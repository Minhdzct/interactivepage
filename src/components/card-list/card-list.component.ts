import { Renderer2 } from '@angular/core';
import { escapeHtml } from '../../utils/escape';

declare const THREE: any;

export interface CardData {
  id: string;
  title: string;
  meta: string;
  body: string;
  opts?: any;
  manualLayout?: boolean;
  layout: {
    scale: number;
    position: { x: number; y: number; z: number };
  };
}

export class CardListComponent {
  constructor(private renderer2: Renderer2) {}

  getVideoCardStyle(): any {
    return { width: '1280px', padding: '32px 16px' };
  }

  readonly CARD_DATA: CardData[] = [
{
      id: 'personal-info-card',
      title: 'ABOUT ME',
      meta: 'Personal Information',
      body: `<ul>${["Name: Bùi Nguyễn Nhật Minh", "Birthday: August 11th (11/08)", "Title: Internet Retard", "Literal Jack of all trades master of none"].map(g => `<li>${escapeHtml(g)}</li>`).join('')}</ul>`,
      opts: { noexpand: true, style: { width: '960px' } },
      manualLayout: true,
      layout: { scale: 0.55, position: { x: 0, y: 60, z: 300 } } // Thẻ chính giữ làm mốc cố định
    },
    {
      id: 'external-ids-card',
      title: 'External IDs',
      meta: 'Social Network',
      body: `<ul>${[{ label: "Steam", handle: "rifikaru", url: "https://steamcommunity.com/id/rifikaru/", status: "OK" }, { label: "Spotify", handle: "Minh", url: "https://open.spotify.com/user/317klfocuvdjnjb7io7qm3cwbfh4", status: "OK" }, { label: "YouTube", handle: "@rifikaru", url: "https://www.youtube.com/@rifikaru", status: "OK" }].map(e => `<li>${escapeHtml(e.label || 'Social')}: <a href=\"${e.url}\" target=\"_blank\" rel=\"noopener\">${escapeHtml(e.handle)}</a></li>`).join('')}</ul>`,
      manualLayout: true,
      layout: { scale: 0.32, position: { x: -460, y: 110, z: 470 } } // Bay chếch lên trên và lùi nhẹ ra sau (Z=270)
    },
    {
      id: 'digital-identity-card',
      title: 'Discord Server',
      meta: 'Friends Discord Server',
      body: `<ul><li><b>Discovery Search: </b>Here We Have Quality Hotpot : Discord edition</li><li><b>Invite Link</b>: <a href="https://discord.com/invite/kdNFAmyzwu" target="_blank" rel="noopener">kdNFAmyzwu</a></li></ul>`,
      manualLayout: true,
      layout: { scale: 0.32, position: { x: 410, y: -10, z: 220 } } // Hạ thấp xuống một chút và hơi nổi lên trước (Z=320)
    },
    {
      id: 'contact-card',
      title: 'Contact',
      meta: 'Direct Contact Info',
      body: `<ul><li><strong>Email</strong>: <a href="mailto:buinguyennhatminh.neu@gmail.com">buinguyennhatminh.neu@gmail.com</a></li><li><strong>Discord</strong>: <span style="color:var(--accent);">rifikaru</span></li></ul>`,
      manualLayout: true,
      layout: { scale: 0.32, position: { x: -60, y: -180, z: 390 } } // Đẩy nhẹ sang bên trái và hơi lùi vào trong một tí
    },
    // --- LỚP HẬU CẢNH: ĐẨY SÂU TRỤC Z VÀ BẢN RỘNG TRỤC X ĐỂ KHÔNG BỊ KHUẤT ---
    {
      id: 'harmony-card',
      title: '黒皇帝・Galaxy Collapse',
      meta: '平安のエイリアン・ZUN',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe width="1280" height="720" src="https://www.youtube.com/embed/VJFNcHgQ4HM" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: -650, y: 360, z: -100 } } // Tầng cao - Cánh trái phía sau
    },
    {
      id: 'ThaiLong-card',
      title: 'Odoriko・Vaundy',
      meta: '踊り子・Vaundy',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe width="1280" height="720" src="https://www.youtube.com/embed/7HgJIAUtICU" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: 650, y: 360, z: -100 } } // Tầng cao - Cánh phải phía sau
    },
    {
      id: 'daydream-card',
      title: 'Non-breath oblige・PinocchioP',
      meta: 'ノンブレス・オブリージュ',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe width="1280" height="720" src="https://www.youtube.com/embed/lw7pcm1W5tw" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: -950, y: 40, z: -150 } } // Tầng trung - Cánh trái rìa ngoài
    },
    {
      id: 'PhongNguaDotQuy-card',
      title: 'バグ・25時',
      meta: 'バグ・かいりきベア',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe width="1280" height="720" src="https://www.youtube.com/embed/2Ii7UBMxWVw" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: 950, y: 40, z: -150 } } // Tầng trung - Cánh phải rìa ngoài
    },
    {
      id: 'dong-co-lau-card',
      title: 'Chinese Paladin 3 (2009)',
      meta: '仙剑奇侠传三',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe src="https://www.youtube.com/embed/aKIMsJ5PqpA" width="1280" height="720" title="ĐỒNG CỎ LAU - HÀNH TRÌNH TỪ ĐẤT TRỜI ĐẾN TỔ ẤM" style="border-radius:12px;border:none;box-shadow:0 4px 24px rgba(0,0,0,0.18);"></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: -650, y: -280, z: -100 } } // Tầng thấp - Cánh trái bên dưới
    },
    {
      id: 'microlife-bts-card',
      title: 'Error On The Dance Floor・Max Repka',
      meta: 'BHGaming Legendary Outro',
      body: `<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;min-height:320px;"><iframe width="1280" height="720" src="https://www.youtube.com/embed/KfuKMbE1seM" title="Microlife Talkshow 2021 | Behind the scene" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
      opts: { noexpand: true, style: this.getVideoCardStyle() },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: 650, y: -280, z: -100 } } // Tầng thấp - Cánh phải bên dưới
    },
{
      id: 'motor-fest-card',
      title: 'DISCORD ACTIVITY', // Dọn sạch khoảng trống thừa ở tiêu đề
      meta: 'Profile Presence Data', // Dọn sạch khoảng trống thừa ở meta
      body: `<div style="display:flex; justify-content:center; align-items:center; width:100%; height:100%; min-height:220px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px;">
               <img id="lanyard-live-card" 
                    src="https://lanyard.cnrad.dev/api/840199281998299206?hideBadges=true" 
                    style="width:100%; max-width:950px; height:auto; display:block;" 
                    alt="Discord Profile Presence">
             </div>`,
      // ÉP GIÃN RỘNG KHUNG SANG 2 BÊN TẠI ĐÂY (Tăng từ 500px lên 1120px)
      opts: { noexpand: true, style: { width: '1020px', padding: '32px 24px' } },
      manualLayout: true,
      layout: { scale: 0.35, position: { x: 0, y: 380, z: -250 } } // Nắn lại scale và cao độ Y để hiển thị vừa vặn, không đè thẻ khác
    }
  ];

  createCardEl(title: string, meta: string, body: string, opts: any = {}): HTMLElement {
    const el = this.renderer2.createElement('div');
    this.renderer2.addClass(el, 'card3d');
    if (opts.noexpand) this.renderer2.addClass(el, 'noexpand');
    el.innerHTML = `<h4>${escapeHtml(title)}</h4>${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}<div class="body">${body || ''}</div>`;
    if (opts.style) Object.keys(opts.style).forEach(key => this.renderer2.setStyle(el, key, opts.style[key]));
    return el;
  }

  buildCards(threeState: any): void {
    const objects: any[] = [];
    for (const cardData of this.CARD_DATA) {
      const el = this.createCardEl(cardData.title, cardData.meta, cardData.body, cardData.opts);
      this.renderer2.setAttribute(el, 'id', cardData.id);

      const obj = new THREE.CSS3DObject(el);
      const { scale } = cardData.layout;
      obj.scale.set(scale, scale, scale);
      (obj as any).cardData = cardData;

      threeState.root.add(obj);
      objects.push(obj);
    }
    threeState.objects = objects;
  }
}
