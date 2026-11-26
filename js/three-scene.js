/* Lightweight 3D gold-dust scene. Falls back silently if WebGL/CDN is unavailable. */
const mount = document.querySelector('#three-stage');
const smallScreen = window.matchMedia('(max-width: 760px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (mount && !smallScreen && !reduceMotion) {
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').then(THREE => {
    if (!mount.isConnected) return;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, .1, 100);
    camera.position.z = 7;
    const points = 950, positions = new Float32Array(points * 3), sizes = new Float32Array(points);
    for (let i = 0; i < points; i++) {
      positions[i * 3] = (Math.random() - .5) * 12;
      positions[i * 3 + 1] = (Math.random() - .5) * 7;
      positions[i * 3 + 2] = (Math.random() - .5) * 5;
      sizes[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.PointsMaterial({ color: 0xc9a24d, size: .025, transparent: true, opacity: .68, depthWrite: false, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(geometry, material);
    scene.add(dust);
    const group = new THREE.Group(); scene.add(group);
    const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24d, metalness: .85, roughness: .22 });
    const glass = new THREE.MeshStandardMaterial({ color: 0xd9c18b, metalness: .7, roughness: .15, transparent: true, opacity: .65 });
    // Abstract chandelier rings: decorative geometry, not a literal building model.
    [1.35, 1.02, .68].forEach((radius, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .018, 8, 100), i === 1 ? glass : gold);
      ring.rotation.x = Math.PI / 2 + i * .18;
      ring.rotation.y = i * .45;
      ring.position.y = .2 - i * .08;
      group.add(ring);
    });
    for (let i = 0; i < 14; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(.035 + Math.random() * .035, 12, 12), gold);
      const angle = i / 14 * Math.PI * 2;
      bead.position.set(Math.cos(angle) * (1.35 + Math.random() * .18), -.55 - Math.random() * .55, Math.sin(angle) * (1.35 + Math.random() * .18));
      group.add(bead);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.PointLight(0xffd98a, 2.2, 12); key.position.set(2, 3, 4); scene.add(key);
    let pointerX = 0, pointerY = 0, frame = 0, active = true;
    const onMove = e => { pointerX = (e.clientX / innerWidth - .5) * .35; pointerY = (e.clientY / innerHeight - .5) * .2; };
    addEventListener('pointermove', onMove, { passive: true });
    const observer = new IntersectionObserver(entries => { active = entries.some(entry => entry.isIntersecting); });
    observer.observe(mount);
    function resize() {
      const width = mount.clientWidth || innerWidth, height = mount.clientHeight || innerHeight;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
    }
    addEventListener('resize', resize, { passive: true });
    function render() {
      frame = requestAnimationFrame(render);
      if (!active) return;
      dust.rotation.y += .00045; dust.rotation.x = Math.sin(performance.now() * .00015) * .04;
      group.rotation.y += .002; group.rotation.x += (pointerY - group.rotation.x) * .02;
      group.rotation.z += (-pointerX - group.rotation.z) * .02;
      renderer.render(scene, camera);
    }
    render();
    addEventListener('pagehide', () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('pointermove', onMove); renderer.dispose(); }, { once: true });
  }).catch(() => { /* CSS hero remains visible when WebGL is not supported or offline. */ });
}
