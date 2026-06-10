# Hướng Dẫn Tùy Chỉnh Portfolio 3D Tương Tác

Chào mừng bạn đến với "bảng điều khiển" (control panel) của portfolio. Dự án này được thiết kế để bạn có thể dễ dàng cập nhật và tùy chỉnh nội dung mà không cần phải can thiệp sâu vào logic phức tạp của mã nguồn.

Hầu hết mọi tùy chỉnh bạn cần sẽ chỉ tập trung ở 3 tệp chính:
1. `src/app.component.ts`
2. `src/guide.service.ts`
3. `src/background.service.ts`

---

## Terminal Theme Pack – Toàn bộ site

### 1. Tổng quan & phạm vi
- **Terminal Theme Pack** là lớp nhận diện chung cho mọi bề mặt của website (landing Angular, mobile stub và blog HUD). Biến thể gốc vẫn là **Terminal Green** lấy cảm hứng từ màn hình phosphor với hiệu ứng scanline nhẹ (xem `blog/README.md`).
- `index.html` nạp bộ font Jersey 25 + VT323 để duy trì cảm giác terminal xuyên suốt và gắn Tailwind build `styles.css` cho toàn bộ layout.
- Khối Angular chính (`<app-root>`) điều khiển Stage 3D, Witness card và hoạt ảnh HUD bằng `AppComponent`, trong khi blog giữ cấu trúc `.stage3d`/`.hud`/`.content` mô phỏng bảng điều khiển theo checklist tại `blog/README.md`.

### 2. Palette & typography toàn site
- **Biến CSS cốt lõi**: `:root` định nghĩa `--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--ok`, `--warn`, `--border`, `--hot`, `--btn-bg` làm nền cho mọi module và được Tailwind pick up qua `color-scheme: dark`. Đây là snapshot Terminal Green hiện hành (nằm trong `index.html`).
- **Tailwind build** (`styles.css`) củng cố palette qua utilities như `.text-gray-200` → `rgb(229 231 235)` và các preset opacity, đảm bảo chữ sáng trên nền tối; đồng thời thiết lập `font-sans` với stack hệ thống cho phần thân.
- **Typography**: Jersey 25 dùng cho banner/tiêu đề, VT323 cho accent terminal; phần thân mặc định `ui-sans-serif, system-ui, Segoe UI, Roboto, Ubuntu`. Khi cần tùy biến Tailwind, mở rộng `theme.extend` trong `tailwind.config.js` (hiện để trống để giữ nguyên mặc định).

### 3. Biến 3D/HUD cốt lõi
- **Kaomoji & emoji burst**: `KAOMOJI_PARTS` và `EMOJI_RANGES` trong `AppComponent` quy định bảng ký tự, decorator và dải Unicode dùng khi kích hoạt witness card – đây là phần nhận diện động cần snapshot khi đóng băng theme.
- **Thông số Stage 3D**: `threeState` giữ `radius: 560`, `autoRotate: true` và bộ tween quản lý camera/điểm nhìn, quyết định cảm giác quỹ đạo quanh vòng card.
- **HUD nền toán tử**: `BackgroundService` định nghĩa lưới 20×30 ô, giới hạn tối đa 50 công thức, `FADE_DURATION` 1500ms và `FORMULA_EXAMPLES` chứa chuỗi vật lý/toán để gõ máy chữ – đây là nguồn hiệu ứng chữ xanh bay trong nền.

### 4. Checklist "đóng băng" theme & bảo trì (scope global)
1. **Snapshot biến toàn cục**: khóa commit chứa `:root` Terminal Green và xác nhận class Tailwind (`text-gray-200`, `.btn-primary`) vẫn bám các giá trị hiện thời (`index.html`, `styles.css`).
2. **Stage 3D Angular**: đảm bảo `threeState` giữ nguyên `radius/autoRotate`, bộ tween và workflow spawn Kaomoji; không sửa `KAOMOJI_PARTS` hay `EMOJI_RANGES` nếu chưa mở version mới (`src/app.component.ts`).
3. **HUD nền**: giữ nguyên kích thước lưới, `FADE_DURATION` và danh sách công thức để tránh lệch pattern Terminal Green (`src/background.service.ts`).
4. **Blog HUD vs module khác**: blog phải duy trì cấu trúc `.stage3d` + `.hud` + slot quảng cáo giả như checklist gốc (`blog/README.md`); phần Angular chỉ render `<app-root>` nên mọi thay đổi HUD phải phản ánh đồng bộ ở cả blog và Stage 3D (ghi chú rõ khi khác biệt để tránh lệch trải nghiệm).

### 5. Versioning & phát hành biến thể
- Quy ước tên: `Terminal Theme Pack vX.Y – <Biến thể>` cho toàn bộ site, đồng bộ với changelog và tag Git (ví dụ `v1.0 – Terminal Green`) theo hướng dẫn ở `blog/README.md`.
- Mỗi biến thể phải liệt kê: (a) giá trị custom property thay đổi; (b) ảnh hưởng tới Stage 3D (ví dụ điều chỉnh `KAOMOJI_PARTS`, `EMOJI_RANGES`) và blog HUD; (c) liên kết commit snapshot.
- Khi blog HUD cần khác màu so với Stage 3D (ví dụ layer amber cho bài viết đặc biệt), tài liệu phải nêu rõ sự khác biệt và cách đồng bộ hoặc rollback để tránh lệch branding giữa hai module.

## Điều khiển thủ công

### Card dữ liệu (`src/app.component.ts`)
Mảng `CARD_DATA` giữ toàn bộ thông tin card. Mỗi card có thể tự đặt vị trí và kích thước bằng `layout` và bật `manualLayout` để bỏ qua bố cục tự động.

```typescript
{
  id: 'unique-card-id',
  title: 'Tiêu đề chính',
  meta: 'Mô tả ngắn',
  body: `Nội dung chi tiết`,
  opts: { noexpand: true, style: { width: '840px' } },
  manualLayout: true,
  layout: {
    scale: 0.25,
    position: { x: 0, y: 0, z: 0 }
  }
}
```
- `layout.scale`: điều chỉnh kích thước (1 = 100%).
- `layout.position.x/y/z`: dịch chuyển card theo trục X, Y, Z.
- `manualLayout`: đặt `true` để dùng tọa độ trong `layout`; nếu bỏ qua, card sẽ được xếp tự động quanh vòng tròn.

### Lời bình Witness (`src/guide.service.ts`)
`witnessTexts` chứa lời bình tương ứng với từng card.

```typescript
private witnessTexts: Record<string, string> = {
  'personal-info-card': 'Lời bình cho card thông tin cá nhân...',
  // ...
};
```
Thêm hoặc sửa lời bình bằng cách chỉnh sửa các cặp `id: nội_dung` trong đối tượng này. `id` phải trùng với `id` của card trong `CARD_DATA`.

### Công thức nền (`src/background.service.ts`)
Các hằng số giúp điều khiển tần suất và hiệu ứng của công thức xuất hiện ở nền:

- `FORMULA_EXAMPLES`: danh sách công thức hiển thị tuần tự. Thêm bớt phần tử để thay đổi nội dung.
- `GRID_ROWS` và `GRID_COLS`: số hàng và cột của lưới đặt công thức; tăng giảm để chỉnh mật độ xuất hiện.
- `FADE_DURATION`: thời gian (ms) để công thức mờ dần rồi biến mất.

### Kaomoji & emoji hiệu ứng (`src/app.component.ts`)
Hiệu ứng Kaomoji xuất hiện khi chọn card.

- Trong hàm `spawnKaomojiAt`, thay đổi dòng:
  ```typescript
  obj.scale.set(0.5, 0.5, 0.5);
  ```
  để phóng to/thu nhỏ Kaomoji.
- Tùy biến gương mặt Kaomoji qua cấu trúc `KAOMOJI_PARTS` (mắt, miệng, ký tự trang trí).
- Phạm vi emoji hiệu ứng được lấy ngẫu nhiên từ `EMOJI_RANGES`; sửa các cặp mã Unicode để đổi bộ emoji.

### Particles (`src/app.component.ts`)
Hiệu ứng hạt bay lơ lửng trong nền được tạo ngẫu nhiên.

- `particlesCnt`: số lượng hạt. Giảm hoặc tăng để đổi mật độ.
- `baseColor` và `colorArray`: chỉnh màu mặc định của hạt.
- `pointsMaterial.size`: thay đổi kích thước từng hạt.
- Nếu muốn đổi hình dạng hạt, sửa hàm `createCircleTexture`.

### Màu sắc & font chữ (`index.html`, `tailwind.config.js`)
Toàn bộ bảng màu và font cơ bản được đặt trong `index.html`.

```html
:root { --bg:#060606; --card:#111826; --ink:#e6edf3; /* ... */ }
```

- Chỉnh các biến `--bg`, `--card`, `--ink`, v.v. để đổi màu nền và màu chữ.
- Liên kết Google Fonts ở đầu tệp cho phép đổi kiểu chữ. Thay URL hoặc thuộc tính `font` trong `html,body` để chỉnh font và cỡ chữ gốc.
- Khi cần thêm màu hoặc font với Tailwind, mở rộng `theme.extend` trong `tailwind.config.js`.

---

## Blog page

Trang blog được phục vụ từ tệp tĩnh `blog/index.html`. Đường dẫn này sẽ tương ứng với URL `/blog/index.html` (hoặc `/blog/` nếu máy chủ hỗ trợ tự động ánh xạ), vì vậy chỉ cần deploy thư mục `blog/` là đã có thể truy cập trang blog.

Toàn bộ nội dung và tài nguyên liên quan đến blog nên đặt trong thư mục `blog/`. Cấu trúc đề xuất:

- `blog/index.html`: trang chủ blog, liệt kê các bài viết và liên kết điều hướng.
- `blog/posts/`: thư mục con (tùy chọn) chứa từng bài viết, ví dụ `blog/posts/first-post.html`.
- `blog/assets/`: nơi đặt ảnh hoặc CSS/JS riêng cho blog nếu cần.

Quy trình tạo hoặc cập nhật trang blog:

1. Tạo thư mục `blog/` ở gốc repo nếu chưa tồn tại.
2. Thêm `blog/index.html` với phần liệt kê bài viết, mỗi bài liên kết tới tệp HTML tương ứng trong `blog/` hoặc các thư mục con.
3. Tạo một tệp HTML cho mỗi bài viết (ví dụ `blog/2024-hello-world.html` hoặc `blog/posts/2024-hello-world.html`) và cập nhật liên kết từ `blog/index.html`.
4. Khi thêm tài nguyên tĩnh (ảnh, CSS, JS) cho blog, đặt chúng trong `blog/assets/` và tham chiếu bằng đường dẫn tương đối.

## Các cập nhật trong tương lai

- Mobile Version tối ưu cho màn hình nhỏ.
- Blog page để đăng tải bài viết.
- AI tool page cung cấp tiện ích hỗ trợ sáng tạo.
- Trang tương tác 3D với AI.

## Ví dụ versioning Terminal Theme Pack

- **Terminal Theme Pack v1.0 – Terminal Green**: sử dụng snapshot mặc định với `--bg:#060606`, `--card:#111826`, `--ink:#e6edf3`, `--accent:#7dd3fc`, đi kèm `KAOMOJI_PARTS`/`EMOJI_RANGES` như hiện tại và HUD blog màu phosphor xanh.
- **Terminal Theme Pack v1.1 – Terminal Amber (ví dụ)**: vẫn giữ cấu trúc Stage 3D/blog nhưng chuyển `--accent` sang tông hổ phách (`--warn:#f59e0b`) và có thể cập nhật `KAOMOJI_PARTS.decorators` để tăng biểu tượng 🔥, đồng thời ghi chú sự khác màu giữa blog HUD (amber overlay) và module khác trong changelog để đảm bảo đồng bộ khi rollback.

