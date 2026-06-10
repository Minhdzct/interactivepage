import { describe, it, expect, vi } from 'vitest';
import { WitnessCardComponent } from './witness-card.component';

class MockRenderer2 {
  createElement(tag: string) { return document.createElement(tag); }
  addClass(el: HTMLElement, name: string) { el.classList.add(name); }
  setStyle(el: HTMLElement, style: string, value: string) { (el.style as any)[style] = value; }
}

class MockGuideService {
  getGuidance(id: string) { return Promise.resolve('summary'); }
}

// Minimal THREE mocks
class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
  setFromMatrixColumn(matrix: any, index: number) { this.copy(matrix.columns[index]); return this; }
  multiplyScalar(s: number) { this.x *= s; this.y *= s; this.z *= s; return this; }
  add(v: Vector3) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v: Vector3) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  normalize() { const l = Math.hypot(this.x, this.y, this.z); if (l) { this.x/=l; this.y/=l; this.z/=l; } return this; }
}

class CSS3DObject {
  element: HTMLElement;
  position = new Vector3();
  rotation = new Vector3();
  scale = new Vector3(1,1,1);
  parent: any = null;
  constructor(el: HTMLElement) { this.element = el; }
}

(global as any).THREE = { Vector3, CSS3DObject };

const renderer = new MockRenderer2() as any;
const guide = new MockGuideService() as any;
const component = new WitnessCardComponent(renderer, guide);

const root = {
  children: [] as any[],
  add(obj: any) { this.children.push(obj); obj.parent = this; },
  remove(obj: any) { this.children = this.children.filter(o => o !== obj); },
  updateMatrixWorld() {},
  worldToLocal(v: any) { return v; },
};

const targetObject = {
  cardData: { id: 'personal-info-card' },
  element: { offsetWidth: 100 },
  scale: new Vector3(1,1,1),
  rotation: new Vector3(),
  getWorldPosition(v: any) { v.set(10,0,0); },
  updateMatrixWorld() {},
};

const threeState: any = {
  focused: targetObject,
  root,
  camera: { matrixWorld: { columns: [new Vector3(1,0,0), new Vector3(0,1,0), new Vector3(0,0,1)] }, updateMatrixWorld() {} },
  controls: { update() {} },
  witnessCard: null,
};

const typewriter = () => Promise.resolve();
const tweenVec3 = (obj: any, target: any) => obj.copy(target);
const spawnKaomojiAt = vi.fn();

(global as any).requestAnimationFrame = (cb: Function) => cb();

describe('WitnessCardComponent', () => {
  it('hiện card đúng vị trí và ẩn khi hide()', async () => {
    await component.show(targetObject, threeState, typewriter, tweenVec3, spawnKaomojiAt);

    expect(threeState.witnessCard).toBeTruthy();
    expect(root.children.length).toBe(1);
    expect(threeState.witnessCard.position.x).toBeCloseTo(386);

    component.hide(threeState);
    expect(root.children.length).toBe(0);
    expect(threeState.witnessCard).toBeNull();
  });
});
