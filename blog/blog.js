(function(){
  const stage = document.getElementById('stage3d');
  if (!stage || !window.THREE) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = window.matchMedia('(max-width: 768px)');
  let allowMotion = !prefersReducedMotion.matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010202, 0.0012);

  const camera = new THREE.PerspectiveCamera(60, stage.clientWidth / stage.clientHeight, 1, 5000);
  camera.position.set(0, 0, isMobile.matches ? 900 : 1200);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile.matches,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(isMobile.matches ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.domElement.classList.add('webgl-layer');
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.insertBefore(renderer.domElement, stage.firstChild);

  let cssRenderer = null;
  let cssScene = null;
  if (THREE.CSS3DRenderer) {
    cssScene = new THREE.Scene();
    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(stage.clientWidth, stage.clientHeight);
    cssRenderer.domElement.classList.add('css3d');
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.setAttribute('aria-hidden', 'true');

    const placeholder = stage.querySelector('.css3d');
    if (placeholder && placeholder !== cssRenderer.domElement) {
      stage.replaceChild(cssRenderer.domElement, placeholder);
    } else {
      stage.appendChild(cssRenderer.domElement);
    }
  }

  const particleTotal = prefersReducedMotion.matches ? 240 : (isMobile.matches ? 880 : 1500);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleTotal * 3);
  const basePositions = new Float32Array(particleTotal * 3);
  const driftSpeeds = new Float32Array(particleTotal);
  const flickerSpeeds = new Float32Array(particleTotal);
  const flickerOffsets = new Float32Array(particleTotal);
  const colors = new Float32Array(particleTotal * 3);

  for (let i = 0; i < particleTotal; i++) {
    const i3 = i * 3;
    const radius = 240 + Math.pow(Math.random(), 0.55) * 1500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const sinPhi = Math.sin(phi);

    const x = radius * sinPhi * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * sinPhi * Math.sin(theta);

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    driftSpeeds[i] = 0.25 + Math.random() * 1.15;
    flickerSpeeds[i] = 0.6 + Math.random() * 1.4;
    flickerOffsets[i] = Math.random() * Math.PI * 2;
    colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const createParticleTexture = () => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.32, 'rgba(255,255,255,0.88)');
    gradient.addColorStop(0.72, 'rgba(255,255,255,0.32)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    const capabilities = renderer.capabilities;
    if (capabilities && typeof capabilities.getMaxAnisotropy === 'function') {
      texture.anisotropy = Math.min(8, capabilities.getMaxAnisotropy());
    }
    texture.needsUpdate = true;
    return texture;
  };

  const particleTexture = createParticleTexture();

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: isMobile.matches ? 2.8 : 3.8,
    transparent: true,
    opacity: 0.98,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: particleTexture,
    vertexColors: true,
    sizeAttenuation: true
  });
  material.alphaTest = 0.02;

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(ambient);

  const clock = new THREE.Clock();
  let elapsed = 0;
  const positionAttribute = geometry.getAttribute('position');
  const colorAttribute = geometry.getAttribute('color');
  const staticIntensity = 0.55;
  let needsStaticSync = !allowMotion;

  const syncStaticState = () => {
    const positionArray = positionAttribute.array;
    positionArray.set(basePositions);
    positionAttribute.needsUpdate = true;

    particles.rotation.set(0, 0, 0);

    const colorsArr = colorAttribute.array;
    for (let i = 0; i < particleTotal; i++) {
      const i3 = i * 3;
      colorsArr[i3] = colorsArr[i3 + 1] = colorsArr[i3 + 2] = staticIntensity;
    }
    colorAttribute.needsUpdate = true;
  };

  if (!allowMotion) {
    syncStaticState();
    needsStaticSync = false;
  }

  function animate() {
    const delta = clock.getDelta();
    elapsed += delta;

    camera.lookAt(0, 0, 0);

    if (allowMotion) {
      const arr = positionAttribute.array;
      for (let i = 0; i < particleTotal; i++) {
        const i3 = i * 3;
        const speed = driftSpeeds[i];
        arr[i3] = basePositions[i3] + Math.sin(elapsed * speed * 0.58 + i * 0.12) * 26;
        arr[i3 + 1] = basePositions[i3 + 1] + Math.cos(elapsed * speed * 0.42 + i * 0.08) * 32;
        arr[i3 + 2] = basePositions[i3 + 2] + Math.sin(elapsed * speed * 0.52 + i * 0.15) * 24;
      }
      positionAttribute.needsUpdate = true;
      particles.rotation.y += delta * 0.12;
      particles.rotation.x = Math.sin(elapsed * 0.18) * 0.06;
    } else if (needsStaticSync) {
      syncStaticState();
      needsStaticSync = false;
    }

    if (allowMotion) {
      const colorsArr = colorAttribute.array;
      const flickerBase = 0.46;
      const flickerRange = 0.52;
      for (let i = 0; i < particleTotal; i++) {
        const i3 = i * 3;
        const phase = (elapsed * flickerSpeeds[i]) + flickerOffsets[i];
        const intensity = THREE.MathUtils.clamp(flickerBase + Math.sin(phase) * flickerRange, 0.2, 1.05);
        colorsArr[i3] = colorsArr[i3 + 1] = colorsArr[i3 + 2] = intensity;
      }
      colorAttribute.needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (cssRenderer && cssScene) {
      cssRenderer.render(cssScene, camera);
    }

    requestAnimationFrame(animate);
  }

  animate();

  const resize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (cssRenderer) {
      cssRenderer.setSize(width, height);
    }
  };

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => resize());
    observer.observe(stage);
  }

  const updatePixelRatio = () => {
    renderer.setPixelRatio(isMobile.matches ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  };

  const addMediaListener = (mediaQuery, handler) => {
    if (!mediaQuery) return;
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler);
    }
  };

  addMediaListener(isMobile, () => {
    updatePixelRatio();
    camera.position.z = isMobile.matches ? 900 : 1200;
    resize();
  });

  addMediaListener(prefersReducedMotion, (event) => {
    allowMotion = !event.matches;
    if (!allowMotion) {
      needsStaticSync = true;
    }
  });
})();
