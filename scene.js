// 3D hero scene — Three.js (vendored ES module, no build step).
import * as THREE from 'three';

const canvas = document.getElementById('bg3d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => innerWidth < 760 || matchMedia('(pointer: coarse)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile(), alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  canvas.style.display = 'none';
}

if (renderer) {
  const mobile = isMobile();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 8);

  const theme = () => document.documentElement.getAttribute('data-theme') || 'dark';

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x1b1030, 1.1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const blueL = new THREE.PointLight(0x0a84ff, 40, 20); blueL.position.set(-4, -1, 3); scene.add(blueL);
  const purpL = new THREE.PointLight(0xbf5af2, 40, 20); purpL.position.set(4, 2, 2); scene.add(purpL);

  /* ---------- phone ---------- */
  const rrect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  };
  const PW = 1.5, PH = 3.1, PD = 0.14;
  const bodyGeo = new THREE.ExtrudeGeometry(rrect(PW, PH, 0.26), {
    depth: PD, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 6, curveSegments: mobile ? 12 : 24,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x23242c, metalness: 0.95, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
  const phone = new THREE.Group();
  phone.add(new THREE.Mesh(bodyGeo, bodyMat));

  // screen texture drawn on a canvas (content taken from the resume)
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 1056;
  const g = sc.getContext('2d');
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const grad = g.createLinearGradient(0, 0, 512, 1056);
  grad.addColorStop(0, '#0a1a3a'); grad.addColorStop(0.55, '#2a1458'); grad.addColorStop(1, '#6a1b6e');
  g.fillStyle = grad; g.fillRect(0, 0, 512, 1056);
  const glow = g.createRadialGradient(380, 260, 10, 380, 260, 380);
  glow.addColorStop(0, 'rgba(100,210,255,.55)'); glow.addColorStop(1, 'rgba(100,210,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, 512, 1056);
  g.fillStyle = '#fff'; g.font = '600 26px -apple-system,Helvetica,Arial,sans-serif'; g.fillText('9:41', 52, 62);
  rr(176, 34, 160, 44, 22); g.fillStyle = '#000'; g.fill();
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '600 26px -apple-system,Helvetica,Arial,sans-serif'; g.fillText('iOS Developer', 44, 190);
  g.fillStyle = '#fff'; g.font = '800 62px -apple-system,Helvetica,Arial,sans-serif'; g.fillText('Markandeyulu', 40, 262); g.fillText('Nistala', 40, 330);
  const cards = [['SwiftUI', '#0a84ff'], ['Combine', '#bf5af2'], ['BLE', '#30d158'], ['Core Data', '#ff9f0a']];
  cards.forEach(([t, c], i) => {
    const x = 40 + (i % 2) * 224, y = 400 + Math.floor(i / 2) * 170;
    rr(x, y, 208, 150, 34); g.fillStyle = 'rgba(255,255,255,.12)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; g.stroke();
    rr(x + 24, y + 24, 54, 54, 16); g.fillStyle = c; g.fill();
    g.fillStyle = '#fff'; g.font = '700 30px -apple-system,Helvetica,Arial,sans-serif'; g.fillText(t, x + 24, y + 126);
  });
  rr(40, 760, 432, 120, 34); g.fillStyle = 'rgba(255,255,255,.14)'; g.fill();
  g.fillStyle = '#fff'; g.font = '700 32px -apple-system,Helvetica,Arial,sans-serif'; g.fillText('Flying Flea', 72, 822);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '500 24px -apple-system,Helvetica,Arial,sans-serif'; g.fillText('Royal Enfield Connected Vehicle', 72, 858);
  rr(176, 1000, 160, 8, 4); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
  const screenTex = new THREE.CanvasTexture(sc); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 4;

  const SW = PW - 0.14, SH = PH - 0.14;
  const screenGeo = new THREE.ShapeGeometry(rrect(SW, SH, 0.2), mobile ? 8 : 16);
  const pos = screenGeo.attributes.position, uv = screenGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / SW + 0.5, pos.getY(i) / SH + 0.5);
  const zFront = PD / 2 + 0.035 + 0.002;
  const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.position.z = zFront; phone.add(screen);
  const glass = new THREE.Mesh(screenGeo, new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false,
  }));
  glass.position.z = zFront + 0.004; phone.add(glass);
  // camera bump on the back
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32), new THREE.MeshPhysicalMaterial({ color: 0x0b0b10, metalness: 1, roughness: 0.12, clearcoat: 1 }));
  lens.rotation.x = Math.PI / 2;
  [[-0.38, 1.08], [-0.38, 0.66]].forEach(([x, y]) => { const l = lens.clone(); l.position.set(x, y, -zFront - 0.005); phone.add(l); });

  const rig = new THREE.Group();   // scroll/mouse driven
  rig.add(phone);
  scene.add(rig);

  /* ---------- orbiting skill chips ---------- */
  const chipLabels = ['Swift', 'SwiftUI', 'Combine', 'MVVM', 'BLE', 'Core Data', 'UIKit', 'FCM'];
  const chipColors = ['#ff6a3d', '#0a84ff', '#bf5af2', '#64d2ff', '#30d158', '#ff9f0a', '#5e5ce6', '#ff375f'];
  const chips = [];
  const nChips = mobile ? 5 : 8;
  for (let i = 0; i < nChips; i++) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 96;
    const x = c.getContext('2d');
    x.beginPath(); x.roundRect(4, 4, 248, 88, 44); x.fillStyle = 'rgba(20,22,32,.78)'; x.fill();
    x.lineWidth = 3; x.strokeStyle = chipColors[i]; x.stroke();
    x.fillStyle = chipColors[i]; x.beginPath(); x.arc(40, 48, 11, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = '700 36px -apple-system,Helvetica,Arial,sans-serif'; x.textBaseline = 'middle'; x.fillText(chipLabels[i], 64, 50);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.375), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.userData = { a: (i / nChips) * Math.PI * 2, r: 1.55 + (i % 3) * 0.3, y: (Math.sin(i * 2.1)) * (mobile ? 1.0 : 1.3), s: 0.25 + (i % 4) * 0.05 };
    rig.add(m); chips.push(m);
  }

  /* ---------- floating geometry ---------- */
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x64d2ff, wireframe: true, transparent: true, opacity: 0.35 });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.15, mobile ? 64 : 140, 12), wireMat);
  knot.position.set(1.0, -2.4, -3); scene.add(knot);
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), wireMat);
  ico.position.set(4.8, -2.5, -3); scene.add(ico);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x7aa7ff, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.35, clearcoat: 1 });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.2, 24, mobile ? 40 : 80), glassMat);
  torus.position.set(4.7, 2.3, -3); scene.add(torus);
  const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), glassMat);
  oct.position.set(1.0, 2.5, -2.5); scene.add(oct);
  const floaters = [knot, ico, torus, oct];
floaters.forEach((m) => { m.userData.by = m.position.y; });

  /* ---------- particles ---------- */
  const COUNT = mobile ? 380 : 1400;
  const pGeo = new THREE.BufferGeometry();
  const pp = new Float32Array(COUNT * 3), pc = new Float32Array(COUNT * 3);
  const cA = new THREE.Color(0x0a84ff), cB = new THREE.Color(0xbf5af2), cC = new THREE.Color(0x64d2ff), tmp = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = 3 + Math.random() * 10, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pp[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.4;
    pp[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pp[i * 3 + 2] = r * Math.cos(ph) - 4;
    const t = Math.random(); tmp.copy(t < 0.5 ? cA : cB).lerp(cC, Math.random() * 0.6);
    pc.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const pMat = new THREE.PointsMaterial({ size: mobile ? 0.05 : 0.04, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ---------- theme ---------- */
  const applyTheme = () => {
    const light = theme() === 'light';
    pMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    pMat.opacity = light ? 0.65 : 0.85; pMat.needsUpdate = true;
    wireMat.color.set(light ? 0x0a84ff : 0x64d2ff);
    wireMat.opacity = (light ? 0.4 : 0.35) * (mobile ? 0.55 : 1);
    hemi.color.set(light ? 0xffffff : 0xbfd8ff); hemi.groundColor.set(light ? 0xb8c0d8 : 0x1b1030);
    hemi.intensity = light ? 1.5 : 1.1;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- layout / resize ---------- */
  let layout = { desktop: true, x: 2.5, y: 0, s: 1 };
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const narrow = camera.aspect < 0.85 || w <= 1180;
    knot.position.x = (camera.aspect < 0.85 || w <= 1180) ? 1.0 : -4.7; knot.position.y = knot.userData.by = (camera.aspect < 0.85 || w <= 1180) ? -2.4 : -3.1;
    const halfW = Math.tan(THREE.MathUtils.degToRad(20)) * 8 * camera.aspect;   // world half-width at z=0
    if (narrow) {
      // portrait sits above the text (centred a little left); the phone peeks out from behind it, to the right
      const unit = h / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * 8);       // px per world unit
      const s = Math.min(0.5, w / 640);
      const pw = Math.min(190, w * 0.48), portraitH = pw;
      const left = w <= 640 ? 20 : 24, top = w <= 640 ? 92 : 96;
      const phoneW = 1.5 * s * unit;
      layout = { desktop: false, x: (left + pw + phoneW * 0.15 - w / 2) / unit, y: (h / 2 - (top + portraitH / 2)) / unit, s };
    } else {
      const offPx = Math.min(620, w * 0.4);
      layout = { desktop: true, x: (offPx / (w / 2)) * halfW, y: 0, s: 0.9 };
    }
  };
  addEventListener('resize', resize); resize();

  /* ---------- interaction ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduced) {
    addEventListener('pointermove', (e) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
    addEventListener('deviceorientation', (e) => { if (e.gamma == null) return; mouse.tx = Math.max(-1, Math.min(1, e.gamma / 30)); mouse.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); }, { passive: true });
  }
  let scrollY = 0, scrollSm = 0;
  const onScroll = () => { scrollY = window.scrollY; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { last = performance.now(); loop(); } });

  let last = performance.now(), elapsed = 0;
  const smooth = (a, b, t) => a + (b - a) * t;
  function frame(dt, t) {
    mouse.x = smooth(mouse.x, mouse.tx, 0.06); mouse.y = smooth(mouse.y, mouse.ty, 0.06);
    scrollSm = smooth(scrollSm, scrollY, 0.08);
    const vh = innerHeight;
    const p = Math.min(scrollSm / vh, 1);                       // hero progress 0..1
    const total = Math.max(1, document.documentElement.scrollHeight - vh);
    const q = Math.min(scrollSm / total, 1);                    // page progress 0..1

    // phone: floats, tilts to the mouse, spins with scroll, drifts aside after the hero
    const L = layout;
    const tx = L.desktop ? smooth(L.x, L.x + 1.0, p) : smooth(L.x, 0, p);
    const ty = L.desktop ? smooth(L.y, L.y + 0.5, p) : smooth(L.y, L.y + 2.2, p);
    const hv = Math.min(1, Math.max(0, (p - 0.35) / 0.5)); const hvs = hv * hv * (3 - 2 * hv);   // phone is replaced by the 3D head while the hero is on screen
    const sc = L.s * smooth(1, 0.75, p) * hvs; rig.visible = hvs > 0.01;
    rig.position.set(tx + mouse.x * 0.25, ty - mouse.y * 0.15 + Math.sin(t * 0.9) * 0.1, 0);
    rig.scale.setScalar(sc);
    phone.rotation.y = -0.45 + mouse.x * 0.45 + q * Math.PI * 4 + Math.sin(t * 0.5) * 0.08;
    phone.rotation.x = mouse.y * 0.25 + Math.sin(t * 0.7) * 0.04;
    phone.rotation.z = -0.06 + Math.sin(t * 0.6) * 0.02;

    chips.forEach((m, i) => {
      const d = m.userData, a = d.a + t * d.s;
      m.position.set(Math.cos(a) * d.r * (layout.desktop ? 0.75 : 1), d.y + Math.sin(t * 0.8 + i) * 0.15, Math.sin(a) * d.r * 0.6);
      m.quaternion.copy(camera.quaternion);
      m.scale.setScalar(0.85 + Math.sin(a) * 0.15);
      m.material.opacity = Math.max(0, 1 - p * 1.6) * hvs;
      m.visible = m.material.opacity > 0.01;
    });
    ico.scale.setScalar(Math.max(0.001, hvs)); torus.scale.setScalar(Math.max(0.001, hvs));
    floaters.forEach((m, i) => { m.rotation.x += dt * (0.2 + i * 0.07); m.rotation.y += dt * (0.3 + i * 0.05); m.position.y = m.userData.by + Math.sin(t * 0.8 + i * 1.7) * 0.25; });

    points.rotation.y = t * 0.02 + q * 1.5 + mouse.x * 0.08;
    points.rotation.x = mouse.y * 0.05;
    points.position.y = scrollSm * 0.0012;
    camera.position.x = smooth(camera.position.x, mouse.x * 0.35, 0.05);
    camera.position.y = smooth(camera.position.y, -mouse.y * 0.2 - q * 1.2, 0.05);
    camera.lookAt(0, camera.position.y * 0.5, 0);

    canvas.style.opacity = String(1 - Math.min(p, 1) * 0.45);
    renderer.render(scene, camera);
  }
  function loop() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now; elapsed += dt;
    frame(dt, elapsed);
    requestAnimationFrame(loop);
  }

  if (reduced) { frame(0, 1.2); addEventListener('resize', () => frame(0, 1.2)); addEventListener('scroll', () => frame(0, 1.2), { passive: true }); }
  else loop();

  // let the page know the 3D scene is alive (used by the preview script)
  document.documentElement.classList.add('webgl-ready');
  window.__sceneReady = true;
}
