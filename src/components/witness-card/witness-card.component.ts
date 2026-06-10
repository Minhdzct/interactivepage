import { Renderer2 } from '@angular/core';
import { GuideService } from '../../guide.service';

declare const THREE: any;

export class WitnessCardComponent {
  constructor(private renderer2: Renderer2, private guideService: GuideService) {}

  private createWitnessCardEl(): HTMLElement {
    const el = this.renderer2.createElement('div');
    this.renderer2.addClass(el, 'card3d');
    this.renderer2.addClass(el, 'witness-card');
    return el;
  }

  async show(
    targetObject: any,
    threeState: any,
    typewriter: (el: HTMLElement, text: string, speed: number) => Promise<void>,
    tweenVec3: (obj: any, target: any, duration: number) => void,
    spawnKaomojiAt: (obj: any) => void,
  ): Promise<void> {
    const cardData = targetObject.cardData;
    const summary = await this.guideService.getGuidance(cardData.id);

    if (threeState.focused !== targetObject) {
      this.hide(threeState);
      return;
    }

    const cardEl = this.createWitnessCardEl();
    const bodyEl = this.renderer2.createElement('div');
    this.renderer2.addClass(bodyEl, 'body');
    this.renderer2.setStyle(bodyEl, 'maxHeight', 'none');
    this.renderer2.setStyle(bodyEl, 'overflow', 'visible');
    cardEl.innerHTML = `<h4> MORE ⇌ INFO </h4><hr/>`;
    cardEl.appendChild(bodyEl);

    threeState.controls.update();
    threeState.camera.updateMatrixWorld(true);
    targetObject.updateMatrixWorld(true);

    const cameraRight = new THREE.Vector3();
    cameraRight.setFromMatrixColumn(threeState.camera.matrixWorld, 0);
    cameraRight.y = 0;
    cameraRight.normalize();

    const targetWorldPos = new THREE.Vector3();
    targetObject.getWorldPosition(targetWorldPos);

    const cardCssWidth = targetObject.element.offsetWidth;
    const witnessCardCssWidth = 680;
    const cardWidth = cardCssWidth * targetObject.scale.x;
    const witnessCardWidth = witnessCardCssWidth * targetObject.scale.x * 0.9;
    const gap = 20;
    const offsetDistance = (cardWidth / 2) + (witnessCardWidth / 2) + gap;

    const offset = cameraRight.multiplyScalar(offsetDistance);
    const finalWorldPos = targetWorldPos.clone().add(offset);

    threeState.root.updateMatrixWorld(true);
    const finalLocalPos = threeState.root.worldToLocal(finalWorldPos.clone());

    const witnessCard = new THREE.CSS3DObject(cardEl);
    threeState.witnessCard = witnessCard;

    witnessCard.position.copy(finalLocalPos);
    witnessCard.rotation.copy(threeState.focused.rotation);

    const targetScale = targetObject.scale.clone().multiplyScalar(0.9);
    witnessCard.scale.set(targetScale.x, 0, targetScale.z);

    threeState.root.add(witnessCard);
    this.renderer2.setStyle(cardEl, 'height', 'auto');

    tweenVec3(witnessCard.scale, targetScale, 350);

    requestAnimationFrame(() => {
      this.renderer2.addClass(cardEl, 'visible');
    });

    setTimeout(async () => {
      if (threeState.witnessCard !== witnessCard) return;
      await typewriter(bodyEl, summary, 20);
      if (threeState.witnessCard === witnessCard) {
        this.renderer2.addClass(cardEl, 'dimming');
      }
    }, 200);

    spawnKaomojiAt(witnessCard);
  }

  hide(threeState: any): void {
    const card = threeState.witnessCard;
    if (card?.parent) {
      card.parent.remove(card);
    }
    threeState.witnessCard = null;
  }
}
