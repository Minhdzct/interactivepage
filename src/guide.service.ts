import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GuideService {
  private witnessTexts: Record<string, string> = {
    'personal-info-card': "Minyh ↔ Bùi Nguyễn Nhật Minh<br>Other IGN: Rifikaru/Luppeey <br>Hanoi - VietNam<br>Casual internet random<br>Wasting my life 24/7 on Hwhqhp Discord",
    'harmony-card': "Galaxy Collapse is one of my favourite. A high-energy Hardcore remix of Heian Alien from Touhou 12. <br>This iconic track is also known for its intense speed and prominence in various rhythm games.<br>",
    'contact-card': "This is where you reach me directly (if ever needed). Just make sure to say HI to me first",
    'microlife-bts-card': "The name came from the stuttering effect that made it sound like a CD was skipping. The 'ONE PIECE' of my favourite YT",
    'external-ids-card': "A compilation of links to social media networks, each serving as an access point to different aspects of MY digital identity.",
    'motor-fest-card': "Yeah this show my current discord activity status... Hopefully I'm not currently doing anything sus...",
    'digital-identity-card': "Used to be directly-related to the Facebook group as a community chat place, but NOT anymore.<br>└ Now owned by Jshagun, meomunsitinh and Me <br>└ Public Server for small circle of friends. Feel free to join!",
    'mv-le-card': "Trong MV Lé – Dr Roc, Minato chính là toàn bộ hậu kỳ. Editing, Color Grade, VFX – tất cả được xử lý gọn ghẽ từ raw footage.",
    'dong-co-lau-card': "Absolute GOAT playlist, probably the best part of my entire life was built based on listening to these OSTs. The TV-Series was also nice at the time, it's just indeed peak.",
    'doraemon-tvc-card': "Trong dự án TVC Doraemon Lipice Sheer Color, Minato đảm nhận vai trò Producer Assistant, tập trung chủ yếu vào giai đoạn hậu kỳ. Trách nhiệm chính là phối hợp thực hiện phần VFX (Visual Effects), đảm bảo các hiệu ứng hình ảnh được hoàn thiện đúng theo yêu cầu của kịch bản và tiêu chuẩn của nhãn hàng.",
    'ThaiLong-card': "Odoriko is one of those songs I can put on at any time and never skip. It feels calm, nostalgic, and a little bittersweet. I don't even fully understand why, but every time it plays, it hits hard.",
    'hithegioi-card': "Toàn bộ hậu kỳ do Minato trực tiếp thực hiện, đảm bảo từ xử lý kỹ thuật đến hoàn thiện sáng tạo. Đây là ví dụ cho năng lực one man army trong post-production.",
    'daydream-card': "PJSK BANGER PJSK BANGER HGB BANGER <br>IYKYK!<br>",
    '2ndchance-card': "Đây là TVC khởi đầu cho chuỗi dự án truyền thông về sức khỏe của Microlife. Trong dự án này, Minato bắt đầu với vai trò Producer Assistant, hỗ trợ Executive Producer, ghi hình Behind The Scene, và góp phần đảm bảo quy trình sản xuất được vận hành trơn tru ngay từ những giai đoạn đầu tiên và phát sinh nếu có.",
    'PhongNguaDotQuy-card': "Pure chaos, unironically one of my most beloved song of my highschool. IYA IYA IYA",
  };

  async getGuidance(cardId: string): Promise<string> {
    const commentary = this.witnessTexts[cardId] || "No specific commentary available for this item. It appears to be a standard portfolio entry within the subject's collection.";
    
    // Simulate a small "thinking" delay for a more realistic feel
    await new Promise(resolve => setTimeout(resolve, 250));

    return Promise.resolve(commentary);
  }
}
