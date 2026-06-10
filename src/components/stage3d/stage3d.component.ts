import { Renderer2 } from '@angular/core';
import { CardListComponent } from '../card-list/card-list.component';

declare const THREE: any;

export class Stage3dComponent {
  private listeners: Array<() => void> = [];
  constructor(private renderer2: Renderer2, private cardList: CardListComponent) {}

  private threeState: any;

  init(
    threeState: any,
    container: HTMLDivElement | null,
    fpsEl: HTMLDivElement | null,
    listeners: Array<() => void>,
    focusObject: (o: any) => void
  ): void {
    if (!container || typeof THREE === 'undefined' || !THREE.OrbitControls || !THREE.CSS3DRenderer) {
      console.error('3D libraries unavailable.');
      return;
    }

    this.threeState = threeState;
    this.listeners = listeners;
    this.threeState.container = container;
    this.buildScene();
    this.cardList.buildCards(this.threeState);
    this.createLayouts();

    this.threeState.applyLayout = (name: string) => {
      this.threeState.layout = name;
      (this.threeState.layouts[name] || this.threeState.layouts.sphere).call(this.threeState.layouts);
    };

    this.setupInteractions(focusObject);
    this.animateCameraZ(this.threeState.camera, 900, 1240, 900);
    this.threeState.applyLayout('sphere');
    this.startLoop(fpsEl);
  }

  private buildScene(): void {
    const { container } = this.threeState;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 4000);
    camera.position.set(0, 0, 1200);

    const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setSize(container.clientWidth, container.clientHeight);

    this.renderer2.setStyle(gl.domElement, 'position', 'absolute');
    this.renderer2.setStyle(gl.domElement, 'top', '0');
    this.renderer2.setStyle(gl.domElement, 'left', '0');
    this.renderer2.setStyle(gl.domElement, 'pointer-events', 'none');
    container.appendChild(gl.domElement);

    // Particle System
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 6666;
    const posArray = new Float32Array(particlesCnt * 3);
    const colorArray = new Float32Array(particlesCnt * 3);
    const blinkParamsArray = new Float32Array(particlesCnt);
    const baseColor = new THREE.Color(0x999999);

    for (let i = 0; i < particlesCnt; i++) {
      const i3 = i * 3;
      posArray[i3 + 0] = (Math.random() - 0.5) * (Math.random() * 5) * 1500;
      posArray[i3 + 1] = (Math.random() - 0.5) * (Math.random() * 5) * 1500;
      posArray[i3 + 2] = (Math.random() - 0.5) * (Math.random() * 5) * 1500;

      colorArray[i3 + 0] = baseColor.r;
      colorArray[i3 + 1] = baseColor.g;
      colorArray[i3 + 2] = baseColor.b;

      blinkParamsArray[i] = Math.random() * Math.PI * 2;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('blinkParam', new THREE.BufferAttribute(blinkParamsArray, 1));

    const particleTexture = this.createCircleTexture();
    const particlesMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    this.threeState.particles = particles;

    const css = new THREE.CSS3DRenderer();
    css.setSize(container.clientWidth, container.clientHeight);
    css.domElement.className = 'css3d';
    container.appendChild(css.domElement);
    this.renderer2.setStyle(css.domElement, 'touchAction', 'none');

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const point = new THREE.PointLight(0xffffff, 0.9);
    point.position.set(420, 350, 420);
    scene.add(point);

    const root = new THREE.Group();
    scene.add(root);

    const controls = new THREE.OrbitControls(camera, css.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 260;
    controls.maxDistance = 2200;
    controls.target.set(0, 0, 0);

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      gl.setSize(w, h);
      css.setSize(w, h);
    };

    this.listeners.push(this.renderer2.listen('window', 'resize', onResize));
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    Object.assign(this.threeState, { scene, camera, gl, css, controls, root, _ro: ro });
  }

  private createLayouts(): void {
    const { objects } = this.threeState;
    const V = THREE.Vector3;
    const animateTo = (obj: any, target: any, dur = 650) => {
      const start = obj.position.clone();
      const t0 = performance.now();
      this.threeState.tweens.push((now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        obj.position.lerpVectors(start, target, this.easeInOutCubic(t));
        return t < 1;
      });
    };
    const look = (obj: any, to?: any) => obj.lookAt(to || new V(0, 0, 0));

    const applyOffset = (obj: any, targetPosition: any) => {
      const { position } = obj.cardData.layout;
      targetPosition.x += position.x || 0;
      targetPosition.y += position.y || 0;
      targetPosition.z += position.z || 0;
      return targetPosition;
    };

    this.threeState.layouts = {
      sphere: () => {
        const autoLayoutObjects = objects.filter((o: any) => !o.cardData.manualLayout);
        const manualLayoutObjects = objects.filter((o: any) => o.cardData.manualLayout);

        const N = autoLayoutObjects.length;
        const r = this.threeState.radius;
        for (let i = 0; i < N; i++) {
          const obj = autoLayoutObjects[i];
          const phi = Math.acos(-1 + (2 * i) / N);
          const theta = Math.sqrt(N * Math.PI) * phi;
          let target = new V(r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(phi));
          target = applyOffset(obj, target);
          animateTo(obj, target);
          look(obj);
        }

        for (const obj of manualLayoutObjects) {
          const { position } = obj.cardData.layout;
          const target = new V(position.x, position.y, position.z);
          animateTo(obj, target);
          look(obj);
        }
      },
    };
  }

  private setupInteractions(focusObject: (o: any) => void): void {
    this.threeState.objects.forEach((o: any) => {
      this.listeners.push(this.renderer2.listen(o.element, 'mouseenter', () => this.renderer2.setStyle(o.element, 'borderColor', '#7dd3fc')));
      this.listeners.push(this.renderer2.listen(o.element, 'mouseleave', () => this.renderer2.setStyle(o.element, 'borderColor', '#1f2937')));
      this.listeners.push(this.renderer2.listen(o.element, 'click', () => { focusObject(o); }));
    });
  }

  private startLoop(fpsEl: HTMLDivElement | null): void {
    const { controls, gl, css, scene, camera, root, particles } = this.threeState;
    let last = performance.now(), acc = 0, frames = 0;

    const fluidTilt = () => {
      root.rotation.y += (this.threeState.mx * 0.35 - root.rotation.y) * 0.04;
      root.rotation.x += (-this.threeState.my * 0.25 - root.rotation.x) * 0.04;
      if (this.threeState.autoRotate) {
        root.rotation.y += 0.0002;
      }
    };

    const animate = () => {
      this.threeState._raf = requestAnimationFrame(animate);
      if (document.hidden) return;

      controls.update();
      fluidTilt();

      if (this.threeState.objects && camera) {
        const camPos = camera.position.clone();
        for (const obj of this.threeState.objects) {
          obj.lookAt(camPos);
        }

        if (this.threeState.focused && this.threeState.witnessCard) {
          this.threeState.witnessCard.rotation.copy(this.threeState.focused.rotation);
        }
      }

      if (particles) {
        particles.rotation.y += 0.0001;

        const time = performance.now() * 0.0008;
        const colors = particles.geometry.attributes.color;
        const blinkParams = particles.geometry.attributes.blinkParam;
        const baseColor = new THREE.Color(0x999999);
        const count = colors.count;

        for (let i = 0; i < count; i++) {
          const offset = blinkParams.getX(i);
          const brightness = (Math.sin(time + offset) + 1) / 2 * 1.6 + 0.2;
          const finalColor = baseColor.clone().multiplyScalar(brightness);
          colors.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
        }
        colors.needsUpdate = true;
      }

      if (this.threeState.tweens.length) {
        const now = performance.now();
        this.threeState.tweens = this.threeState.tweens.filter((fn: Function) => fn(now));
      }

      gl.render(scene, camera);
      css.render(scene, camera);

      const now = performance.now(); acc += now - last; last = now; frames++;
      if (fpsEl && acc > 500) {
        const fps = Math.round(1000 / (acc / frames));
        fpsEl.textContent = 'fps: ' + fps;
        acc = 0; frames = 0;
      }
    };
    animate();
  }

  private animateCameraZ(camera: any, fromZ: number, toZ: number, dur = 800): void {
    const start = fromZ, delta = toZ - fromZ, t0 = performance.now();
    camera.position.z = start;
    this.threeState.tweens.push((now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      camera.position.z = start + delta * this.easeInOutCubic(t);
      return t < 1;
    });
  }

  public tweenVec3(vec: any, to: any, dur = 700): void {
    const s = vec.clone ? vec.clone() : new THREE.Vector3(vec.x, vec.y, vec.z);
    const t0 = performance.now();
    this.threeState.tweens.push((now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const k = this.easeInOutCubic(t);
      vec.set(s.x + (to.x - s.x) * k, s.y + (to.y - s.y) * k, s.z + (to.z - s.z) * k);
      return t < 1;
    });
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private createCircleTexture(): any {
    const canvas = this.renderer2.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(32, 32, 32, 0, Math.PI * 2, false);
    context.fill();
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}
