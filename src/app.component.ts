import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  viewChild,
  Renderer2,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService } from './guide.service';
import { BackgroundService } from './background.service';
import { WitnessCardComponent } from './components/witness-card/witness-card.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { Stage3dComponent } from './components/stage3d/stage3d.component';
import { escapeHtml } from './utils/escape';

// Make THREE available in the component context, as it's loaded from a script tag.
declare const THREE: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private renderer2 = inject(Renderer2);
  private guideService = inject(GuideService);
  private backgroundService = inject(BackgroundService);
  private witnessCard = new WitnessCardComponent(this.renderer2, this.guideService);
  private cardList = new CardListComponent(this.renderer2);
  private stage3dManager = new Stage3dComponent(this.renderer2, this.cardList);

  // View Children for DOM elements
  veiledContainer = viewChild<ElementRef<HTMLDivElement>>('veiledContainer');
  appWrap = viewChild<ElementRef<HTMLDivElement>>('appWrap');
  titleVeiled = viewChild<ElementRef<HTMLDivElement>>('titleVeiled');
  kaoVeiled = viewChild<ElementRef<HTMLSpanElement>>('kaoVeiled');
  btnActivate = viewChild<ElementRef<HTMLButtonElement>>('btnActivate');
  btnMobile = viewChild<ElementRef<HTMLButtonElement>>('btnMobile');
  stage3d = viewChild<ElementRef<HTMLDivElement>>('stage3d');
  fpsEl = viewChild<ElementRef<HTMLDivElement>>('fps');

  isActivating = signal(false);
  isMobileActivating = signal(false);
  backgroundFormulas = this.backgroundService.backgroundFormulas;

  // Open Mobile Version page
  openMobile(): void {
    if (this.isMobileActivating()) return;
    this.isMobileActivating.set(true);
    // Spin the symbol like PC flow
    try {
      const kao = this.kaoVeiled()?.nativeElement;
      if (kao) this.renderer2.addClass(kao, 'spinning');
      const veiled = this.veiledContainer()?.nativeElement;
      if (veiled) this.renderer2.addClass(veiled, 'mobile-activating');
    } catch (err) {
      console.error(err);
    }
    // Give UI a moment to show CONNECTING... then navigate
    setTimeout(() => {
      try {
        window.location.href = 'mobile.html';
      } catch (err) {
        console.error(err);
        // If navigation fails for any reason, release state and stop spin
        this.isMobileActivating.set(false);
        try {
          const kao = this.kaoVeiled()?.nativeElement;
          if (kao) this.renderer2.removeClass(kao, 'spinning');
        } catch (innerErr) {
          console.error(innerErr);
        }
      }
    }, 500);
  }

  // Algorithmic Kaomoji generation using Unicode code points.
  private KAOMOJI_PARTS: {
    [key: string]: {
      eyes: number[];
      mouths: number[];
      decorators?: number[];
    };
  } = {
    neutral: {
      eyes: [8614, 8612, 180, 96, 84, 84, 3239, 3239, 8226, 8226, 12539, 12539, 925, 925],
      mouths: [95, 8255, 8704, 30410, 12504, 30399, 969, 1044, 20154],
    },
    happy: {
      eyes: [9685, 9685, 94, 94, 9734, 9734, 12500, 12500, 707, 706],
      mouths: [12527, 9661, 969, 3665],
      decorators: [10047, 65306, 65311, 12540, 10025, 9829]
    },
    fire: {
      eyes: [180, 96, 9685, 9685, 9689, 9689],
      mouths: [45, 30410, 969, 1044, 30399],
      decorators: [128293]
    },
  };
  
  private readonly EMOJI_RANGES = [
    [0x1F300, 0x1F320], // Weather, landscape
    [0x1F330, 0x1F37F], // Food, plants
    [0x1F380, 0x1F3C0], // Events, sports
    [0x1F400, 0x1F43F], // Animals
    [0x1F440, 0x1F480], // Body parts, people symbols (avoiding faces)
    [0x1F484, 0x1F4FF], // Objects, clothing
    [0x1F500, 0x1F53F], // Symbols
    [0x1F550, 0x1F567], // Clocks
    [0x1F680, 0x1F6C5], // Transport
    [0x2600, 0x26FF],   // Miscellaneous Symbols
    [0x2700, 0x27BF],   // Dingbats
  ];

  private _listeners: (() => void)[] = [];

  // --- Three.js State ---
  private threeState: any = {
    ctrl: new AbortController(),
    radius: 560,
    autoRotate: true,
    mx: 0, my: 0,
    tweens: [],
    ephemerals: [],
    _raf: null,
    _ro: null,
    focused: null,
    witnessCard: null,
  };

ngAfterViewInit(): void {
    this.boot();
    this.backgroundService.start();

    // DÁN ĐOẠN ĐỢT NÀY VÀO ĐÂY LÀ CHUẨN BÀI:
    setInterval(() => {
      const lanyardImg = document.getElementById('lanyard-live-card') as HTMLImageElement;
      if (lanyardImg) {
        lanyardImg.src = `https://lanyard.cnrad.dev/api/840199281998299206?hideBadges=true&t=${Date.now()}`;
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.threeState.ctrl?.abort();
    if (this.threeState._ro) this.threeState._ro.disconnect();
    if (this.threeState._raf) cancelAnimationFrame(this.threeState._raf);
    this._listeners.forEach(unlisten => unlisten());
    this.backgroundService.stop();
  }

  // --- Boot Logic ---
  private async boot(): Promise<void> {
    const titleEl = this.titleVeiled()?.nativeElement;
    if (titleEl) {
      this.renderer2.setStyle(titleEl, 'visibility', 'hidden');
      await this.typewriter(titleEl, 'Welcome to the<br>Minyh Biopage', 70);
      this.renderer2.addClass(titleEl, 'typing-done');
    }

    const kaoEl = this.kaoVeiled()?.nativeElement;
    if (kaoEl) this.renderer2.setProperty(kaoEl, 'textContent', '⛧');

    const activateBtn = this.btnActivate()?.nativeElement;
    if (activateBtn) {
        this._listeners.push(
            this.renderer2.listen(activateBtn, 'click', () => { this.activatePortfolio(); })
        );
    }

    const mobileBtn = this.btnMobile()?.nativeElement;
    if (mobileBtn) {
      this._listeners.push(
        this.renderer2.listen(mobileBtn, 'click', () => { this.openMobile(); })
      );
    }
  }
  
  private activatePortfolio(): void {
    const veiled = this.veiledContainer()?.nativeElement;
    const wrap = this.appWrap()?.nativeElement;
    if (!veiled || !wrap || this.isActivating()) return;

    this.isActivating.set(true);
    // Keep veiled container visible so only siblings fade, not the ⛧ symbol
    setTimeout(() => {
      this.renderer2.setStyle(veiled, 'display', 'none');
      this.renderer2.removeClass(wrap, 'hidden');
      this.renderer2.addClass(wrap, 'visible');
      this.stage3dManager.init(this.threeState, this.stage3d()?.nativeElement || null, this.fpsEl()?.nativeElement || null, this._listeners, this.focusObject.bind(this));
      this.isActivating.set(false); // Set to false after scene is ready
    }, 500);
  }

  // --- Utilities ---
  private typewriter(element: HTMLElement, text: string, speed = 24): Promise<void> {
    const sanitized = escapeHtml(text).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    return new Promise(resolve => {
        let i = 0;
        element.innerHTML = '';
        this.renderer2.setStyle(element, 'visibility', 'visible');
        const timer = setInterval(() => {
          if (i < sanitized.length) {
            // Check for an HTML tag
            if (sanitized.charAt(i) === '<') {
              const closingTagIndex = sanitized.indexOf('>', i);
              if (closingTagIndex !== -1) {
                // It's a tag, append the whole thing
                const tag = sanitized.substring(i, closingTagIndex + 1);
                element.innerHTML += tag;
                i = closingTagIndex + 1; // Jump index past the tag
              } else {
                // It's an unclosed '<', just print it
                element.innerHTML += sanitized.charAt(i);
                i++;
              }
            } else {
              // It's a normal character
              element.innerHTML += sanitized.charAt(i);
              i++;
            }
          } else {
            clearInterval(timer);
            resolve();
          }
        }, speed);
    });
  }

  private generateEffectEmoji(): string {
    const range = this.EMOJI_RANGES[Math.floor(Math.random() * this.EMOJI_RANGES.length)];
    const codePoint = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    return String.fromCodePoint(codePoint);
  }

  private generateKaomoji(bucket = 'neutral'): string {
    const parts = this.KAOMOJI_PARTS[bucket as keyof typeof this.KAOMOJI_PARTS] || this.KAOMOJI_PARTS.neutral;
  
    const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomCharFromCodePoint = (arr: number[]) => String.fromCodePoint(randomItem(arr));
  
    const eye = randomCharFromCodePoint(parts.eyes);
    const mouth = randomCharFromCodePoint(parts.mouths);
    
    let face = `${eye}${mouth}${eye}`;
    
    if (parts.decorators && Math.random() > 0.6) {
      const decorator = randomCharFromCodePoint(parts.decorators);
      face = `${decorator}${face}${decorator}`;
    }
  
    return `(${face})`;
  }

  
  // --- 3D Scene Initialization ---
  private getVideoCardStyle(): any {
    return { width: '1280px', padding: '32px 16px' };
  }

  
  private async focusObject(o: any): Promise<void> {
    const animationDuration = 700;

    if (this.threeState.focused === o) {
      // Clicked the same card, so hide witness and reset view
      this.witnessCard.hide(this.threeState);
      this.threeState.focused = null;
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      const defaultCamPos = new THREE.Vector3(0, 0, 1200);
      this.stage3dManager.tweenVec3(this.threeState.controls.target, defaultTarget, animationDuration);
      this.stage3dManager.tweenVec3(this.threeState.camera.position, defaultCamPos, animationDuration);
      return;
    }

    this.witnessCard.hide(this.threeState); // Hide previous card if any
    this.threeState.focused = o;

    const target = o.position.clone();
    const camDir = this.threeState.camera.position.clone().sub(this.threeState.controls.target).normalize();
    const camPos = target.clone().add(camDir.multiplyScalar(600));

    this.stage3dManager.tweenVec3(this.threeState.controls.target, target, animationDuration);
    this.stage3dManager.tweenVec3(this.threeState.camera.position, camPos, animationDuration);
    
    // Wait for the camera animation to complete.
    await new Promise(resolve => setTimeout(resolve, animationDuration));

    if (this.threeState.focused === o) {
      requestAnimationFrame(() => {
        if (this.threeState.focused === o) { // Final check
          this.witnessCard.show(o, this.threeState, this.typewriter.bind(this), this.stage3dManager.tweenVec3.bind(this.stage3dManager), this.spawnKaomojiAt.bind(this));
        }
      });
    }
  }

  private spawnKaomojiAt(sourceObject: any): void {
    const k = this.renderer2.createElement('div');
    this.renderer2.addClass(k, 'kao');
    this.renderer2.addClass(k, 'mono');
    
    const face = this.generateKaomoji('happy');
    const effect = this.generateEffectEmoji();
    k.textContent = `${effect}${face}${effect}`;

    const obj = new THREE.CSS3DObject(k);
    
    // TỰ ĐIỀU CHỈNH Ở ĐÂY ------------------
    // Thay đổi giá trị 0.5 để Kaomoji to hoặc nhỏ hơn.
    // Ví dụ: 0.3 (nhỏ hơn nữa), 1.0 (kích thước gốc).
    obj.scale.set(0.5, 0.5, 0.5);
    // -----------------------------------------

    // Set rotation to match the source card, preventing the skewed look.
    obj.rotation.copy(sourceObject.rotation);

    // Calculate the top-center position of the source card in 3D space
    const sourceEl = sourceObject.element as HTMLElement;
    const cardHeight = sourceEl.offsetHeight; // The element's rendered height in pixels
    const cardScale = sourceObject.scale.y;    // The object's scale in the 3D scene
    
    // The offset should be half the card's scaled height to get to the top edge, plus a small gap.
    const verticalOffset = (cardHeight * cardScale / 2) + 20;

    // The kaomoji should appear slightly in front of the card.
    const forwardOffset = 10; 

    const burstPos = sourceObject.position.clone().add(new THREE.Vector3(0, verticalOffset, forwardOffset));

    obj.position.copy(burstPos);
    this.threeState.root.add(obj);
    this.threeState.ephemerals.push(obj);

    const startY = burstPos.y;
    const endY = startY + 120;
    const duration = 1200;
    const t0 = performance.now();

    const animateBurst = () => {
        const now = performance.now();
        const t = Math.min(1, (now - t0) / duration);
        if (t >= 1) {
            this.threeState.root.remove(obj);
            const idx = this.threeState.ephemerals.indexOf(obj);
            if (idx > -1) {
              this.threeState.ephemerals.splice(idx, 1);
            }
            if (obj.element?.parentNode) {
              obj.element.parentNode.removeChild(obj.element);
            }
            return;
        }
        obj.position.y = startY + (endY - startY) * t;
        k.style.opacity = (1 - t).toFixed(2);
        requestAnimationFrame(animateBurst);
    };
    requestAnimationFrame(animateBurst);
  }
}
