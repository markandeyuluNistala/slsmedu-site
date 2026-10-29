// Tech-stack logo sphere + AI neural "brain" — Three.js (vendored), no build step.
import * as THREE from 'three';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = () => innerWidth < 760 || matchMedia('(pointer: coarse)').matches;
export const dprCap = () => Math.min(devicePixelRatio || 1, coarse() ? 1.5 : 2);

/* Shared helper: build a renderer that only animates while on screen. */
export function makeStage(canvas, opts) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse(), alpha: true, powerPreference: 'default' });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov || 40, 1, 0.1, 50);
  camera.position.set(0, 0, opts.z || 6);
  const holder = canvas.parentElement;
  const size = () => {
    const w = holder.clientWidth || 300, h = holder.clientHeight || 300;
    renderer.setPixelRatio(dprCap());
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  size();
  new ResizeObserver(size).observe(holder);

  let onscreen = false, running = false, last = 0, tick = () => {};
  const loop = (now) => {
    if (!(onscreen && !document.hidden) || reduced) { running = false; return; }
    const dt = Math.min((now - last) / 1000 || 0.016, 0.05); last = now;
    tick(dt, now / 1000);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  const start = () => { if (!running && !reduced) { running = true; last = performance.now(); requestAnimationFrame(loop); } };
  new IntersectionObserver((es) => {
    onscreen = es[0].isIntersecting;
    if (onscreen) { start(); if (reduced) { tick(0, 0); renderer.render(scene, camera); } }
  }, { rootMargin: '80px' }).observe(holder);
  document.addEventListener('visibilitychange', start);
  return {
    renderer, scene, camera, holder,
    onTick(fn) { tick = fn; },
    still() { if (reduced) { tick(0, 0); renderer.render(scene, camera); } },
  };
}

/* ======================= 1. LOGO SPHERE ======================= */
(function logoSphere() {
  const canvas = document.getElementById('logoSphere');
  if (!canvas) return;
  const stage = makeStage(canvas, { fov: 38, z: 8.6 });
  if (!stage) { canvas.parentElement.style.display = 'none'; return; }
  const { scene, camera } = stage;
  const group = new THREE.Group(); scene.add(group);
  const R = 2.35;

  // faint latitude/longitude shell
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 0.98, 18, 12)),
    new THREE.LineBasicMaterial({ color: 0x4d8dff, transparent: true, opacity: 0.16, depthWrite: false }));
  shell.renderOrder = -1;
  group.add(shell);
  // dust
  const dp = []; for (let i = 0; i < 160; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(R * (0.55 + Math.random() * 0.6)); dp.push(v.x, v.y, v.z); }
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)),
    new THREE.PointsMaterial({ color: 0x8fb4ff, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false }));
  group.add(dust);

  const items = [
    ['swift', '#F05138'], ['swiftui', '#0A84FF'], ['uikit', '#5E5CE6'], ['combine', '#BF5AF2'], ['coredata', '#30B0C7'], ['objc', '#0A84FF'],
    ['xcode', '#147EFB'], ['spm', '#FF9F0A'], ['cocoapods', '#EE3322'], ['bluetooth', '#0082FC'], ['firebase', '#FFA000'], ['rest', '#2AA7D6'],
    ['json', '#1d1d1f'], ['git', '#F05032'], ['github', '#1d1d1f'], ['jira', '#0052CC'], ['figma', '#F24E1E'], ['appstore', '#0D96F6'],
    ['testflight', '#0A84FF'], ['coreml', '#FF6482'], ['claude', '#D97757'], ['googlegemini', '#8E75B2'], ['githubcopilot', '#1d1d1f'], ['cursor', '#1d1d1f'],
  ];
  const sprites = [];
  const N = items.length, ga = Math.PI * (3 - Math.sqrt(5));
  items.forEach(([name, color], i) => {
    const y = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = ga * i;
    const pos = new THREE.Vector3(Math.cos(th) * rr, y, Math.sin(th) * rr).multiplyScalar(R);
    const mat = new THREE.SpriteMaterial({ transparent: true, depthWrite: false, opacity: 0 });
    const sp = new THREE.Sprite(mat); sp.position.copy(pos); sp.scale.setScalar(0.72); sp.renderOrder = 2; mat.depthTest = false;
    group.add(sp); sprites.push(sp);
    fetch('assets/logos/' + name + '.svg').then(r => r.text()).then(txt => {
      txt = txt.indexOf('stroke="#000"') > -1 ? txt.replace('stroke="#000"', 'stroke="' + color + '"') : txt.replace('<svg ', '<svg fill="' + color + '" ');
      const img = new Image();
      img.onload = () => {
        const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
        const x = c.getContext('2d');
        x.shadowColor = 'rgba(10,30,90,.35)'; x.shadowBlur = 8; x.shadowOffsetY = 2;
        x.fillStyle = '#fff'; x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 8, 0, 7); x.fill();
        x.shadowColor = 'transparent';
        x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 2; x.stroke();
        x.drawImage(img, S * 0.26, S * 0.26, S * 0.48, S * 0.48);
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        mat.map = tex; mat.opacity = 1; mat.needsUpdate = true; sp.userData.ready = true;
        stage.still();
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
    }).catch(() => {});
  });

  // interaction: drag to spin (with inertia), gentle hover tilt
  let vy = 0, vx = 0, dragging = false, lx = 0, ly = 0, hoverX = 0, hoverY = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    hoverX = ((e.clientX - r.left) / r.width - 0.5); hoverY = ((e.clientY - r.top) / r.height - 0.5);
    if (dragging) {
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      vy = dx * 0.006; vx = dy * 0.004;
      group.rotation.y += dx * 0.008; group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + dy * 0.005));
      stage.still();
    }
  });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { hoverX = hoverY = 0; });

  const v = new THREE.Vector3();
  stage.onTick((dt) => {
    if (!reduced) {
      if (!dragging) {
        group.rotation.y += (0.22 + vy * 60) * dt;
        vy *= Math.pow(0.04, dt);
        group.rotation.x += ((hoverY * 0.5) - group.rotation.x) * Math.min(1, dt * 2.5);
      }
    }
    group.updateMatrixWorld();
    sprites.forEach((sp) => {
      v.copy(sp.position).applyMatrix4(group.matrixWorld);
      const t = (v.z / R + 1) / 2;                 // 0 back … 1 front
      if (sp.userData.ready) sp.material.opacity = 0.28 + 0.72 * t;
      sp.scale.setScalar(0.5 + 0.42 * t);
    });
  });
  stage.still();
})();

/* ======================= 2. AI NEURAL BRAIN ======================= */
function buildBrain(canvasId, o) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const stage = makeStage(canvas, { fov: 38, z: o.z });
  if (!stage) { canvas.parentElement.classList.add('no-webgl'); return; }
  const { scene, camera, renderer } = stage;
  const brain = new THREE.Group(); scene.add(brain);

  // seeded RNG so the shape is stable between loads
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // --- node positions: two hemispheres + cerebellum + stem, wrinkled surface bias
  const pts = [];
  const hemi = (sgn) => {
    let n = 0;
    while (n < o.hemi) {
      const x = (rnd() * 2 - 1), y = (rnd() * 2 - 1), z = (rnd() * 2 - 1);
      const r = Math.hypot(x, y, z); if (r > 1 || r < 0.05) continue;
      const k = (rnd() < 0.62 ? Math.pow(r, 0.3) : r) / r;          // push toward the surface
      let px = x * k * 1.55, py = y * k * 1.05, pz = z * k * 0.72;
      if (py < -0.35) py = -0.35 + (py + 0.35) * 0.55;       // flatter underside
      const w = 1 + 0.11 * Math.sin(px * 5.2 + py * 3.1) * Math.cos(pz * 6 + px * 2);   // gyri
      px *= w; py *= w; pz = sgn * (0.10 + Math.abs(pz) * w);
      pts.push(new THREE.Vector3(px, py + 0.1, pz)); n++;
    }
  };
  hemi(1); hemi(-1);
  for (let n = 0; n < o.cb;) {                    // cerebellum
    const x = rnd() * 2 - 1, y = rnd() * 2 - 1, z = rnd() * 2 - 1; if (x * x + y * y + z * z > 1) continue;
    pts.push(new THREE.Vector3(-0.85 + x * 0.5, -0.72 + y * 0.28, z * 0.45)); n++;
  }
  for (let n = 0; n < 8; n++) pts.push(new THREE.Vector3(-0.25 + n * 0.0 + rnd() * 0.1, -0.85 - n * 0.09, (rnd() - 0.5) * 0.12)); // stem
  const NP = pts.length;

  // --- edges: k nearest neighbours under a distance cap
  const edgeSet = new Set(), edges = [];
  for (let i = 0; i < NP; i++) {
    const d = pts.map((p, j) => [p.distanceTo(pts[i]), j]).filter(a => a[1] !== i).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < o.k; k++) {
      const [dist, j] = d[k]; if (dist > 0.5) continue;
      const key = i < j ? i + '_' + j : j + '_' + i;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
    }
  }
  // a few long-range "synapses" across the fissure
  for (let n = 0; n < o.syn; n++) {
    const i = (rnd() * o.hemi) | 0, j = o.hemi + ((rnd() * o.hemi) | 0);
    if (pts[i].distanceTo(pts[j]) < 1.1) edges.push([i, j]);
  }

  const cA = new THREE.Color(0x3a8bff), cB = new THREE.Color(0xbf5af2), cC = new THREE.Color(0xff6482);
  const colorAt = (p) => { const t = (p.x + 1.7) / 3.4; return (t < 0.5 ? cA.clone().lerp(cB, t * 2) : cB.clone().lerp(cC, (t - 0.5) * 2)); };

  const uni = { uTime: { value: 0 }, uPtr: { value: new THREE.Vector3(99, 99, 99) }, uPR: { value: dprCap() }, uBoost: { value: 0 } };

  // nodes
  const npos = new Float32Array(NP * 3), ncol = new Float32Array(NP * 3), nph = new Float32Array(NP), nsz = new Float32Array(NP);
  pts.forEach((p, i) => { npos.set([p.x, p.y, p.z], i * 3); const c = colorAt(p); ncol.set([c.r, c.g, c.b], i * 3); nph[i] = rnd() * 6.28; nsz[i] = 0.7 + rnd() * 0.9; });
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(npos, 3)); ng.setAttribute('aCol', new THREE.BufferAttribute(ncol, 3));
  ng.setAttribute('aPh', new THREE.BufferAttribute(nph, 1)); ng.setAttribute('aSz', new THREE.BufferAttribute(nsz, 1));
  const nodeMat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime,uPR; uniform vec3 uPtr; attribute vec3 aCol; attribute float aPh,aSz; varying vec3 vC; varying float vA;
      void main(){ vec3 p=position; float tw=.65+.35*sin(uTime*2.0+aPh); float near=smoothstep(.9,.0,distance(p,uPtr));
        vC=aCol+near*.6; vA=tw+near; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(7.5*aSz*(.8+tw*.4)+near*10.)*uPR*(5.4/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; float g=smoothstep(.5,.0,d); gl_FragColor=vec4(vC*(.35+g*1.4),g*g*clamp(vA,0.,1.4)); }`,
  });
  brain.add(new THREE.Points(ng, nodeMat));

  // edges with travelling pulses
  const E = edges.length, epos = new Float32Array(E * 6), ecol = new Float32Array(E * 6), eend = new Float32Array(E * 2), eph = new Float32Array(E * 2), esp = new Float32Array(E * 2);
  edges.forEach(([i, j], e) => {
    epos.set([pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z], e * 6);
    const a = colorAt(pts[i]), b = colorAt(pts[j]); ecol.set([a.r, a.g, a.b, b.r, b.g, b.b], e * 6);
    eend[e * 2] = 0; eend[e * 2 + 1] = 1; const ph = rnd(), sp = 0.25 + rnd() * 0.5; eph[e * 2] = eph[e * 2 + 1] = ph; esp[e * 2] = esp[e * 2 + 1] = sp;
  });
  const eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.BufferAttribute(epos, 3)); eg.setAttribute('aCol', new THREE.BufferAttribute(ecol, 3));
  eg.setAttribute('aEnd', new THREE.BufferAttribute(eend, 1)); eg.setAttribute('aPh', new THREE.BufferAttribute(eph, 1)); eg.setAttribute('aSp', new THREE.BufferAttribute(esp, 1));
  const lineMat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime; uniform vec3 uPtr; attribute vec3 aCol; attribute float aEnd,aPh,aSp; varying vec3 vC; varying float vE,vP,vN;
      void main(){ vC=aCol; vE=aEnd; vP=fract(uTime*aSp*.6+aPh*7.0); vN=smoothstep(.9,.0,distance(position,uPtr)); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vC; varying float vE,vP,vN; uniform float uBoost;
      void main(){ float pulse=smoothstep(.22,.0,abs(vE-vP)); float a=.10+pulse*.9+vN*.5+uBoost*pulse; gl_FragColor=vec4(vC*(.6+pulse*1.2+vN),a); }`,
  });
  brain.add(new THREE.LineSegments(eg, lineMat));

  // faint orbiting rings + dust
  const ringMat = new THREE.LineBasicMaterial({ color: 0x4d8dff, transparent: true, opacity: 0.22 });
  const rings = [];
  [2.25, 2.55].forEach((r, i) => {
    const g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r * 0.92, 0, Math.PI * 2).getPoints(120).map(p => new THREE.Vector3(p.x, p.y, 0)));
    const l = new THREE.LineLoop(g, ringMat); l.rotation.set(1.2 + i * 0.5, 0.3 * i, i); scene.add(l); rings.push(l);
  });
  const dp = []; for (let i = 0; i < 140; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(2.2 + Math.random() * 1.4); dp.push(v.x, v.y * 0.8, v.z); }
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)),
    new THREE.PointsMaterial({ color: 0x9fc2ff, size: 0.03, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  // pointer: rotate toward it, light up nearby nodes / edges
  const tgt = { x: 0, y: 0 }; let pulseBoost = 0;
  const holder = stage.holder, ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  const onScreenNow = () => { const r = holder.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const onMove = (e) => {
    const r = holder.getBoundingClientRect();
    const cl = (v) => Math.max(-1.5, Math.min(1.5, v));
    const nx = cl(((e.clientX - r.left) / r.width) * 2 - 1), ny = cl(-(((e.clientY - r.top) / r.height) * 2 - 1));
    tgt.x = nx; tgt.y = ny;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    if (ray.ray.intersectPlane(plane, hit)) { brain.updateMatrixWorld(); inv.copy(brain.matrixWorld).invert(); uni.uPtr.value.copy(hit).applyMatrix4(inv); }
    stage.still();
  };
  const pm = o.global ? (e) => { if (onScreenNow()) onMove(e); } : onMove;
  (o.global ? document : holder).addEventListener('pointermove', pm, { passive: true });
  holder.addEventListener('pointerleave', () => { tgt.x = tgt.y = 0; uni.uPtr.value.set(99, 99, 99); stage.still(); });
  holder.addEventListener('pointerdown', () => { pulseBoost = 1; });

  stage.onTick((dt, t) => {
    uni.uTime.value = reduced ? 4.0 : t; uni.uPR.value = dprCap();
    if (!reduced) {
      brain.rotation.y = -0.55 + Math.sin(t * 0.32) * 0.75 + tgt.x * 0.45;
      brain.rotation.x += (-tgt.y * 0.35 - brain.rotation.x) * Math.min(1, dt * 3);
      brain.position.y = Math.sin(t * 0.8) * 0.06;
      rings.forEach((r, i) => { r.rotation.z += dt * (0.12 + i * 0.08); });
      dust.rotation.y -= dt * 0.04;
      pulseBoost *= Math.pow(0.1, dt); uni.uBoost.value = pulseBoost * 2;
    } else { brain.rotation.set(-tgt.y * 0.2, -0.45 + tgt.x * 0.4, 0); }
  });
  stage.still();
}
buildBrain('aiBrain', { z: 4.5, hemi: 150, cb: 34, k: 4, syn: 24 });
