// Hero: large 3D particle head built from the AI head artwork (assets/ai-head.jpg).
// The picture is sampled into points; each point gets real depth from a distance-to-edge
// "inflated" volume (mirrored thickness), so rotating the head shows genuine 3D.
import * as THREE from 'three';
import { makeStage, reduced, coarse, dprCap } from './tech3d.js?v=20261029c';

const canvas = document.getElementById('heroHead3d');
if (canvas) init();

const FIX = (() => { const m = /[?&]headyaw=(-?[\d.]+)/.exec(location.search); return m ? parseFloat(m[1]) : null; })();   // debug: freeze yaw
function init() {
  const stage = makeStage(canvas, { fov: 32, z: 10 });
  if (!stage) { canvas.parentElement.classList.add('no-webgl'); return; }
  const { scene, camera, holder } = stage;
  const WORLD = 4.6;                                  // image width in world units
  const group = new THREE.Group(), rot = new THREE.Group();
  rot.add(group); scene.add(rot);
  group.scale.x = -1;                                 // face looks left, towards the hero text

  const uni = { uTime: { value: 0 }, uAsm: { value: reduced ? 1 : 0 }, uPR: { value: dprCap() }, uD: { value: 10 }, uPtr: { value: new THREE.Vector3(99, 99, 99) }, uK: { value: 10 }, uSz: { value: coarse() ? 1.55 : 1 } };

  const fit = () => {
    const w = holder.clientWidth || 500, h = holder.clientHeight || 600, a = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(16));
    const z = Math.max(2.15 / (t * a), 7.5);
    camera.position.z = z; uni.uD.value = z; uni.uK.value = z; camera.updateProjectionMatrix();
  };
  fit(); new ResizeObserver(fit).observe(holder);

  const img = new Image();
  img.decoding = 'async';
  img.onload = () => build(img);
  img.src = 'assets/ai-head.jpg?v=20261029c';

  function build(img) {
    const S = 600;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, S, S);
    const px = cx.getImageData(0, 0, S, S).data;
    const lum = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) lum[i] = Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) / 255;

    /* --- silhouette: dilate, flood the outside, erode; then distance-to-edge --- */
    const G = 300, f = S / G;
    const m0 = new Uint8Array(G * G);
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      let mx = 0; for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) mx = Math.max(mx, lum[(y * 2 + j) * S + x * 2 + i]);
      m0[y * G + x] = mx > 0.14 ? 1 : 0;
    }
    const dilate = (src, r) => {
      const t = new Uint8Array(G * G), o = new Uint8Array(G * G);
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const xx = x + k; if (xx >= 0 && xx < G && src[y * G + xx]) v = 1; } t[y * G + x] = v; }
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const yy = y + k; if (yy >= 0 && yy < G && t[yy * G + x]) v = 1; } o[y * G + x] = v; }
      return o;
    };
    const m1 = dilate(m0, 5);
    const bg = new Uint8Array(G * G), stack = [];
    const seed = (x, y) => { const k = y * G + x; if (!m1[k] && !bg[k]) { bg[k] = 1; stack.push(k); } };
    for (let i = 0; i < G; i++) { seed(i, 0); seed(0, i); seed(G - 1, i); if (i < G * 0.14 || i > G * 0.72) seed(i, G - 1); }
    while (stack.length) {
      const k = stack.pop(), x = k % G, y = (k / G) | 0;
      if (x > 0) seed(x - 1, y); if (x < G - 1) seed(x + 1, y); if (y > 0) seed(x, y - 1); if (y < G - 1) seed(x, y + 1);
    }
    const inside = new Uint8Array(G * G);
    for (let i = 0; i < G * G; i++) inside[i] = bg[i] ? 0 : 1;
    // erode back by the dilation radius (roughly)
    const outMask = new Uint8Array(G * G); for (let i = 0; i < G * G; i++) outMask[i] = inside[i] ? 0 : 1;
    const grown = dilate(outMask, 4); for (let i = 0; i < G * G; i++) inside[i] = grown[i] ? 0 : inside[i];
    // chamfer distance transform
    const dist = new Float32Array(G * G); const INF = 1e6;
    for (let i = 0; i < G * G; i++) dist[i] = inside[i] ? INF : 0;
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { const k = y * G + x; if (!dist[k]) continue; let d = dist[k]; if (x > 0) d = Math.min(d, dist[k - 1] + 1); if (y > 0) { d = Math.min(d, dist[k - G] + 1); if (x > 0) d = Math.min(d, dist[k - G - 1] + 1.414); if (x < G - 1) d = Math.min(d, dist[k - G + 1] + 1.414); } dist[k] = d; }
    let maxD = 1;
    for (let y = G - 1; y >= 0; y--) for (let x = G - 1; x >= 0; x--) { const k = y * G + x; if (!dist[k]) continue; let d = dist[k]; if (x < G - 1) d = Math.min(d, dist[k + 1] + 1); if (y < G - 1) { d = Math.min(d, dist[k + G] + 1); if (x < G - 1) d = Math.min(d, dist[k + G + 1] + 1.414); if (x > 0) d = Math.min(d, dist[k + G - 1] + 1.414); } dist[k] = d; if (d > maxD) maxD = d; }
    // the neck runs off the bottom of the picture: treat the border as "far" so the volume closes smoothly
    const depthAt = (x, y) => { const gx = Math.min(G - 1, (x / f) | 0), gy = Math.min(G - 1, (y / f) | 0); return dist[gy * G + gx] / maxD; };
    // Per-row runs of the silhouette -> elliptical horizontal cross-section (top view of a head is an egg:
    // widest behind the ears, tapering to the midline at the face). Edges are rounded by the 2D distance field.
    const runS = new Int16Array(G * G).fill(-1), runE = new Int16Array(G * G).fill(-1);
    let headLen = 1;
    for (let gy = 0; gy < G; gy++) {
      let gx = 0;
      while (gx < G) {
        if (!inside[gy * G + gx]) { gx++; continue; }
        const a = gx; while (gx < G && inside[gy * G + gx]) gx++;
        const b = gx - 1; for (let q = a; q <= b; q++) { runS[gy * G + q] = a; runE[gy * G + q] = b; }
        if (gy * f < 300) headLen = Math.max(headLen, (b - a + 1) * f);
      }
    }
    const mainA = new Float32Array(G), mainB = new Float32Array(G); let yTop = 0;
    for (let gy = 0; gy < G; gy++) {
      let best = 0, ba = 0, bb = 0, gx = 0;
      while (gx < G) { if (!inside[gy * G + gx]) { gx++; continue; } const a = gx; while (gx < G && inside[gy * G + gx]) gx++; if (gx - a > best) { best = gx - a; ba = a; bb = gx; } }
      mainA[gy] = ba * f; mainB[gy] = bb * f; if (!yTop && best * f > 24) yTop = gy * f;
    }
    const R0 = 26;                                        // edge rounding radius (grid cells)
    const hwAt = (x, y) => {                              // half-width in image px at image (x, y)
      const gx = Math.max(0, Math.min(G - 1, (x / f) | 0)), gy = Math.max(0, Math.min(G - 1, (y / f) | 0)), c = gy * G + gx;
      if (!inside[c] || runS[c] < 0) return 0;
      const a = runS[c] * f, b = (runE[c] + 1) * f, len = b - a;
      const u = Math.max(0, Math.min(1, (x - a) / len)), t = 2 * u - 1;           // -1 back ... +1 face
      const egg = Math.sqrt(Math.max(0, 1 - t * t)) * (1 - 0.16 * t);
      const ys = Math.max(0, Math.min(1, (y - 330) / 110)), cap = headLen * (0.40 - 0.13 * ys * ys * (3 - 2 * ys));
      const W = Math.min(len * 0.5 * 0.86, cap);
      const d = Math.min(1, dist[c] / R0), round = Math.sqrt(Math.max(0, 2 * d - d * d));
      return W * egg * round;
    };
    const insideAt = (x, y) => inside[Math.min(G - 1, (y / f) | 0) * G + Math.min(G - 1, (x / f) | 0)];

    /* --- brain regions (image coords) --- */
    const inBrain = (x, y) => { const a = (x - 288) / 168, b = (y - 150) / 108, a2 = (x - 218) / 74, b2 = (y - 278) / 46; return a * a + b * b < 1 || a2 * a2 + b2 * b2 < 1; };

    /* --- fully rounded head volume: elliptical cross-section per image row --- */
    const rowOf = (y) => { const gy = Math.max(0, Math.min(G - 1, (y / f) | 0)); return [mainA[gy], mainB[gy]]; };
    const rowW = (y, len) => { const ys = Math.max(0, Math.min(1, (y - 330) / 110)), cap = headLen * (0.40 - 0.13 * ys * ys * (3 - 2 * ys)); return Math.min(len * 0.5 * 0.86, cap); };
    // point on the head surface at row y, angle th (0 = face, PI = back of head); returns px-space x,z and outward normal
    const shellAt = (y, th) => {
      const [a, b] = rowOf(y), len = b - a; if (len < 8) return null;
      const a2 = len / 2, cx = (a + b) / 2, W = rowW(y, len), c = Math.cos(th), sn = Math.sin(th);
      const x = cx + a2 * Math.sign(c) * Math.pow(Math.abs(c), 0.85), z = W * sn * (1 - 0.1 * c);
      let nx = c / a2, nz = sn / W; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
      return { x, z, nx, nz, W, a2, cx };
    };
    // face feature points from the profile's feature heights (px rows): symmetric eyes, brows, nose, lips, chin
    function buildFeatures() {
      const F = [], Y = { brow: 206, eye: 221, tip: 288, ala: 306, up: 331, mouth: 345, low: 358, chin: 392 };
      const add = (y, zr, c, sz, jit) => { F.push({ y: y + (Math.random() - 0.5) * jit, zr: zr + (Math.random() - 0.5) * jit * 0.012, c, sz }); };
      const eyeC = [0.5, 0.95, 1.0], cy = [0.25, 0.8, 1.0], pk = [1.0, 0.42, 0.85], vi = [0.6, 0.45, 1.0];
      for (const sg of [-1, 1]) {
        for (let i = 0; i < 90; i++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()); add(Y.eye + Math.sin(a) * r * 4, sg * (0.34 + Math.cos(a) * r * 0.075), eyeC, 3.2, 0); }   // eyes
        for (let i = 0; i < 40; i++) add(Y.eye, sg * 0.34, [0.7, 0.95, 1], 3.4, 1);                                                                                              // pupils
        for (let i = 0; i < 60; i++) { const t = Math.random(); add(Y.brow - 5 * Math.sin(t * Math.PI) + 4 * t, sg * (0.18 + t * 0.34), cy, 1.5, 1.5); }                       // brows
        for (let i = 0; i < 36; i++) { const a = Math.random() * 6.283; add(Y.ala + Math.sin(a) * 5, sg * (0.13 + Math.cos(a) * 0.05), vi, 1.6, 0); }                     // nostril wings
      }
      for (let i = 0; i < 150; i++) { const t = Math.random(); add(Y.eye + 6 + t * (Y.tip - Y.eye - 8), (Math.random() - 0.5) * (0.03 + t * 0.05), cy, 1.7, 0); }         // nose ridge
      for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()); add(Y.tip + Math.sin(a) * r * 6, Math.cos(a) * r * 0.075, eyeC, 2.4, 0); } // nose tip
      for (let i = 0; i < 90; i++) { const t = Math.random() * 2 - 1; add(Y.up - 5 * Math.cos(t * 1.4) + 3 * t * t, t * 0.27, pk, 2.6, 1.2); }                              // upper lip
      for (let i = 0; i < 90; i++) { const t = Math.random() * 2 - 1; add(Y.low + 6 * Math.cos(t * 1.1) - 5, t * 0.23, pk, 2.6, 1.2); }                                     // lower lip
      for (let i = 0; i < 80; i++) { const t = Math.random() * 2 - 1; add(Y.mouth + 4 * t * t - 1, t * 0.28, [1, 0.6, 0.95], 2.0, 1); }                                  // mouth line
      for (let i = 0; i < 40; i++) add(Y.chin + (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 0.2, cy, 1.5, 0);                                                      // chin
      return F;
    }

    /* --- weighted sampling over pixels --- */
    const cdf = new Float32Array(S * S); let acc = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, l = lum[i];
      let w = Math.pow(l, 1.1);
      if (l > 0.12 && inBrain(x, y)) w *= 1.05;
      if (insideAt(x, y) && l < 0.14) w += 0.03;          // faint volumetric filler
      acc += w; cdf[i] = acc;
    }
    const NT = coarse() ? 10000 : 30000, FEAT = buildFeatures(), NF = FEAT.length, NS = Math.round(NT * 0.34), N = NT - NS - NF;
    const pos = new Float32Array(NT * 3), start = new Float32Array(NT * 3), col = new Float32Array(NT * 3), aN = new Float32Array(NT * 3), aSz = new Float32Array(NT), aPh = new Float32Array(NT), aBr = new Float32Array(NT), aR = new Float32Array(NT);
    const k = WORLD / S;
    for (let n = 0; n < N; n++) {
      const r = Math.random() * acc; let lo = 0, hi = S * S - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
      const x = (lo % S) + Math.random(), y = ((lo / S) | 0) + Math.random();
      const l = lum[lo], brain = l > 0.12 && inBrain(x, y);
      const zmax = hwAt(x, y) * k;
      let z;
      const sgn = Math.random() < 0.5 ? -1 : 1;
      let surf = false;
      if (brain) z = sgn * zmax * Math.pow(Math.random(), 0.75) * 0.82;
      else if (Math.random() < 0.9) { z = sgn * zmax * (0.97 + Math.random() * 0.03); surf = true; }   // skin / facial contour: surface only, never inside
      else z = sgn * zmax * Math.sqrt(Math.random());
      if (surf) {                                    // surface normal from the height field (for rim light)
        const zf = (xx, yy) => hwAt(xx, yy) * k;
        const h = 7, dzx = (zf(x + h, y) - zf(x - h, y)) / (2 * h * k), dzy = -(zf(x, y + h) - zf(x, y - h)) / (2 * h * k);
        const nl = Math.hypot(dzx, dzy, 1) || 1; aN.set([-dzx / nl, -dzy / nl, sgn / nl], n * 3);
      }
      pos[n * 3] = (x - S / 2) * k; pos[n * 3 + 1] = -(y - S / 2) * k - 0.05; pos[n * 3 + 2] = z;
      // colour: picture colour, lifted & saturated
      let R = px[lo * 4] / 255, Gc = px[lo * 4 + 1] / 255, B = px[lo * 4 + 2] / 255;
      const mn = Math.min(R, Gc, B); R -= mn * 0.75; Gc -= mn * 0.75; B -= mn * 0.75;       // keep it cyan / violet, never white
      const mx = Math.max(R, Gc, B, 0.04), I = (0.55 + 0.9 * l) * (brain ? 1.2 : (surf ? 1.3 : 1)); R = R / mx * I; Gc = Gc / mx * I; B = B / mx * I;
      if (l < 0.14) { R = 0.22; Gc = 0.5; B = 0.95; }      // filler: cool blue
      if (!brain && !surf) { R *= 0.45; Gc *= 0.45; B *= 0.45; }       // dim interior volume
      const nf = 1 - Math.max(0, Math.min(1, (y - 500) / 100)); R *= nf; Gc *= nf; B *= nf;          // neck fades out
      col.set([R, Gc, B], n * 3);
      aSz[n] = (brain && l > 0.78) ? 1.6 + Math.random() * 1.2 : 0.9 + l * 1.1 + Math.random() * 0.5;
      aPh[n] = Math.random() * 6.283; aBr[n] = brain ? (l > 0.78 ? 2 : 1) : 0; aR[n] = Math.random();
      const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), rr = 4 + Math.random() * 6;
      start.set([rr * Math.sin(ph) * Math.cos(th) * 1.2, rr * Math.cos(ph) * 0.9, rr * Math.sin(ph) * Math.sin(th)], n * 3);
    }
    // parametric skin shell (all around the head: gives the rounded volume from any angle)
    const imgCol = (x, y) => { const i = (Math.max(0, Math.min(S - 1, y | 0)) * S + Math.max(0, Math.min(S - 1, x | 0))); return [px[i * 4] / 255, px[i * 4 + 1] / 255, px[i * 4 + 2] / 255, lum[i]]; };
    const putPoint = (n, xp, yp, zp, nx, nz, r, g, b, sz, br) => {
      pos[n * 3] = (xp - S / 2) * k; pos[n * 3 + 1] = -(yp - S / 2) * k - 0.05; pos[n * 3 + 2] = zp * k;
      aN.set([nx, 0, nz], n * 3); col.set([r, g, b], n * 3); aSz[n] = sz; aPh[n] = Math.random() * 6.283; aBr[n] = br; aR[n] = Math.random();
      const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), rr = 4 + Math.random() * 6;
      start.set([rr * Math.sin(ph) * Math.cos(th) * 1.2, rr * Math.cos(ph) * 0.9, rr * Math.sin(ph) * Math.sin(th)], n * 3);
    };
    for (let n = N, made = 0, guard = 0; made < NS && guard < NS * 6; guard++) {
      const y = yTop + Math.random() * (540 - yTop), th = Math.random() * 6.283, p = shellAt(y, th); if (!p) continue;
      const [R0_, G0, B0, l] = imgCol(p.cx + (p.x - p.cx), y), t = Math.max(0, Math.min(1, (p.x - 120) / 380));
      let I = 0.42 + 1.0 * l; if (inBrain(p.x, y)) I *= 0.45;
      const nf = 1 - Math.max(0, Math.min(1, (y - 500) / 100)); I *= nf;
      let r = (0.55 - 0.3 * t) * I, g = (0.42 + 0.4 * t) * I, b = 1.0 * I;                       // violet (back) -> cyan (face)
      if (l > 0.14) { const mx = Math.max(R0_, G0, B0, 0.04); r = r * 0.5 + R0_ / mx * I * 0.5; g = g * 0.5 + G0 / mx * I * 0.5; b = b * 0.5 + B0 / mx * I * 0.5; }
      putPoint(n, p.x, y, p.z, p.nx, p.nz, r, g, b, 0.9 + l * 0.8 + Math.random() * 0.4, 0);
      n++; made++;
    }
    for (let i = 0; i < NF; i++) {                                // features on the face surface
      const ft = FEAT[i], zr = Math.max(-0.95, Math.min(0.95, ft.zr)), th = Math.asin(zr / 1.0), p = shellAt(ft.y, th); const n = N + NS + i;
      if (!p) { putPoint(n, 300, 300, 0, 0, 1, 0, 0, 0, 0.1, 0); continue; }
      const I = 1.2; putPoint(n, p.x, ft.y, p.z, p.nx, p.nz, ft.c[0] * I, ft.c[1] * I, ft.c[2] * I, ft.sz, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    geo.setAttribute('aN', new THREE.BufferAttribute(aN, 3)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aSz', new THREE.BufferAttribute(aSz, 1));
    geo.setAttribute('aPh', new THREE.BufferAttribute(aPh, 1)); geo.setAttribute('aBr', new THREE.BufferAttribute(aBr, 1)); geo.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime,uAsm,uPR,uD,uK,uSz; uniform vec3 uPtr;
        attribute vec3 aStart,aCol,aN; attribute float aSz,aPh,aBr,aR; varying vec3 vC; varying float vA;
        void main(){
          float e=clamp(uAsm*1.6-aR*.6,0.,1.); e=e*e*(3.-2.*e);
          vec3 p=mix(aStart,position,e);
          p+=(1.-e)*vec3(sin(uTime*2.+aPh),cos(uTime*1.7+aPh),sin(uTime*1.3+aPh))*.15;
          float tw=.7+.3*sin(uTime*2.4+aPh*3.);
          float pulse=0.;
          if(aBr>.5){ float d=length(p.xy-vec2(-.1,1.1)); pulse=smoothstep(.22,0.,fract(uTime*.42-d*.30)); tw*=1.+.5*sin(uTime*3.+aPh); }
          float sweep=smoothstep(.16,0.,abs(fract(uTime*.11+p.y*.12+p.x*.05)-.5)*2.-.0);   // slow travelling band
          float near=smoothstep(1.1,0.,distance(p,uPtr));
          vec4 mv=modelViewMatrix*vec4(p,1.);
          float depth=.4+.6*smoothstep(-1.4,1.4,mv.z+uD);
          float fr=0., face=1.; if(dot(aN,aN)>.1){ vec3 nv=normalize(normalMatrix*aN); fr=pow(1.-abs(nv.z),2.0)*smoothstep(-.25,.2,nv.z); face=mix(.04,1.,smoothstep(-.12,.28,nv.z)); }
          vC=aCol*(.85+pulse*.9+sweep*.4+near*.6+(aBr>1.5?.35:0.))+vec3(.15,.75,1.)*fr*1.3;
          vA=(.62*tw+pulse*.6+sweep*.2+near*.4+fr*.9)*depth*e*(aBr>.5?1.25:1.)*face;
          gl_PointSize=(aSz*(.9+pulse*.65+(aBr>1.5?.6:0.))+near*2.)*uPR*(uK/-mv.z)*1.35*uSz;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; float g=smoothstep(.5,.0,d); gl_FragColor=vec4(vC*(.4+g*.9),g*g*clamp(vA,0.,1.)); }`,
    });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; group.add(pts);
    canvas.parentElement.classList.add('ready');

    /* --- interaction: oscillation + pointer + drag (with inertia) --- */
    let yaw = 0.5, vel = 0, dragPitch = 0, dragging = false, lx = 0, ly = 0, px_ = 0, py_ = 0, idle = 0;
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
    document.addEventListener('pointermove', (e) => {
      px_ = (e.clientX / innerWidth - 0.5) * 2; py_ = (e.clientY / innerHeight - 0.5) * 2;
      const r = holder.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      ray.setFromCamera({ x: Math.max(-2, Math.min(2, nx)), y: Math.max(-2, Math.min(2, ny)) }, camera);
      if (ray.ray.intersectPlane(plane, hit)) { rot.updateMatrixWorld(); inv.copy(group.matrixWorld).invert(); uni.uPtr.value.copy(hit).applyMatrix4(inv); }
      if (dragging) { const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; yaw += dx * 0.008; vel = Math.max(-6, Math.min(6, dx * 0.008 * 60)); dragPitch = Math.max(-0.25, Math.min(0.25, dragPitch + dy * 0.003)); idle = 0; if (reduced) { rot.rotation.y = yaw; stage.still(); } }
    }, { passive: true });
    canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
    const up = () => { dragging = false; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    let asm = 0;
    stage.onTick((dt, t) => {
      uni.uTime.value = reduced ? 2 : t; uni.uPR.value = dprCap();
      if (reduced) { uni.uAsm.value = 1; rot.rotation.set(dragPitch, yaw, 0); return; }
      asm = Math.min(1, asm + dt / 3.0); uni.uAsm.value = asm;
      if (!dragging) { idle += dt; yaw += (0.22 + vel) * dt; vel *= Math.pow(0.08, dt); dragPitch *= Math.pow(0.25, dt); }   // slow continuous 360 turn + inertia after a drag
      rot.rotation.y = FIX !== null ? FIX : yaw;
      rot.rotation.x = -py_ * 0.06 + dragPitch + Math.sin(t * 0.5) * 0.02;
      rot.position.y = Math.sin(t * 0.8) * 0.07;
    });
    stage.still();
  }
}
