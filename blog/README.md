# Terminal Theme Pack – Hướng dẫn nội bộ

## 1. Tổng quan & mục đích
- **Terminal Theme Pack** là bộ nhận diện dành cho cụm blog 3D/HUD mô phỏng bảng điều khiển điện tử. Biến thể khai mở là **Terminal Green**, dựa trên màn hình phosphor xanh và hiệu ứng scanline nhẹ.
- Bộ nhận diện này gắn với kiến trúc giao diện hiện có của `blog/index.html`, sử dụng nền 3D (Three.js) kết hợp HUD dạng lưới với các lớp `.stage3d`, `.hud`, banner chính và bố cục nội dung `.main-layout`/`.sidebar-slot`.

## 2. Bảng màu & typography
- Palette chính được khai báo trong `blog/blog.css` qua các custom properties:
  - Nền: `--bg`, thẻ: `--card`/`--card-bg`, chữ chính: `--ink`, chữ phụ: `--muted`.
  - Điểm nhấn: `--accent`, cảnh báo: `--warn`, nóng: `--hot`, trạng thái: `--ok`.
  - Viền: `--border`, `--border-strong`, nền nút: `--btn-bg`, hiệu ứng chủ đạo: `--terminal-green` cùng `--bgx`/`--bgy` điều chỉnh tâm gradient.
- Font chủ đạo lấy từ Google Fonts: **Jersey 25** cho banner tiêu đề và **VT323** cho điểm nhấn phong cách terminal; font hệ monospace được dùng cho HUD và các slot mô phỏng terminal.

## 3. Bố cục 3D/HUD bắt buộc
Khi dựng trang blog con mới phải giữ nguyên cấu trúc và asset sau:
1. Các thẻ `<link>`/`<script>`: `../styles.css`, `blog.css`, `blog.js`, cùng hai script Three.js CDN (`three.min.js` và `CSS3DRenderer.js`).
2. Thuộc tính lớp của `<body>`: `class="text-gray-200 font-sans antialiased"` để đồng bộ Tailwind utilities.
3. Cấu trúc DOM 3 lớp: wrapper `.stage3d` (bao gồm `<canvas>` và `.css3d` render), lớp HUD `.hud` với `.brand` & `.nav-buttons`, rồi cụm `.content` chứa `.banner-slot`, `.main-layout`, `.article-slot`, `.sidebar-slot` và footer mô phỏng quảng cáo/slot placeholder.

## 4. Ghi chú khi nhân bản trang blog
- Không bỏ lớp `.stage3d` hay `.hud`; các slot quảng cáo giả (`.ad-slot`, `.ad-leaderboard`, `.ad-skyscraper`, `.interstitial-slot`) phải tồn tại để giữ khung bố cục.
- Có thể thay nội dung văn bản trong `.article-slot`, nhưng không đổi cấu trúc grid `.main-layout` trừ khi cập nhật chung toàn pack.

## 5. "Đóng băng" theme & bảo trì
- **Snapshot**: tạo commit đánh dấu (tag/branch) lưu trạng thái hiện tại của Terminal Theme Pack, kèm checklist gồm:
  1. Các biến CSS trong `:root` giữ đúng giá trị Terminal Green (`--bg`, `--terminal-green`, `--accent`, v.v.).
  2. Cấu trúc HTML (HUD + layout + slot quảng cáo) không thay đổi thứ tự hoặc class.
  3. Slot quảng cáo giả lập (`GDN 728×90`, `GDN 160×600`, `Interstitial Placeholder`) vẫn tồn tại làm khung tham chiếu.
  4. Footer `© 2025 ⛧` hiển thị đầy đủ.
- Khi cần tuỳ biến nhưng vẫn thuộc Terminal Theme Pack: chỉ thay đổi giá trị custom property trong CSS (ví dụ chỉnh `--terminal-green`, `--accent`, `--bg`); tránh sửa layout, HUD hoặc script Three.js để đảm bảo nhận diện gốc.

## 6. Versioning & phát hành biến thể
- Quy ước tên: `Terminal Theme Pack vX.Y – <Biến thể>` (ví dụ: `Terminal Theme Pack v1.0 – Terminal Green`). Ghi chú rõ trong changelog hoặc README để phân biệt.
- Khi phát hành biến thể mới (ví dụ Terminal Amber), giữ nguyên template và cập nhật README với:
  - Danh sách biến CSS thay đổi (màu sắc, ánh sáng) nhưng xác nhận HUD/layout không đổi.
  - Ngày phát hành, mục tiêu thị giác và liên kết tới commit snapshot.
  - Nếu thêm slot nội dung mới, phải mô tả lý do và cách tương thích ngược với HUD 3D.

## 7. Checklist nhanh khi dựng trang con
- [ ] Sao chép cấu trúc `blog/index.html` làm khung.
- [ ] Đảm bảo import đầy đủ CSS/JS/Three.js như mục 3.
- [ ] Kiểm tra lại giá trị custom property theo version hiện hành.
- [ ] Đặt banner `.banner-text` bằng font Jersey 25 (qua Google Fonts).
- [ ] Xác nhận footer, slot quảng cáo và HUD hiển thị đúng.
