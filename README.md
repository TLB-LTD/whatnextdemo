# Rồi Sao Nữa (WhatNext) — demo sản phẩm

Bản demo công khai của **Rồi Sao Nữa** — nền tảng giúp trẻ 6–10 tuổi học kỹ năng sống bằng cách
tự quyết định trong những tình huống có thật, rồi thấy điều gì đến sau lựa chọn đó.

**Xem trực tiếp: https://tlb-ltd.github.io/whatnextdemo/**

---

## Trong này có gì

| Phần | Nội dung |
|---|---|
| **Tổng quan** | Sản phẩm là gì, vòng học, năm chiến lược, sáu mặt phẳng đối tượng |
| **Ba vai** | Ba luồng **bấm được thật**: trẻ đọc truyện · tác giả soạn truyện · biên tập duyệt truyện |
| **Màn hình** | **70 màn** dựng đủ, mở trong khung thiết bị, đổi được khổ và giao diện |
| **Hệ thiết kế** | Token màu/chữ/khoảng cách, 20 cặp tương phản WCAG **tính trực tiếp trong trình duyệt**, và 16 luật thiết kế kèm ví dụ đúng/sai |

Ba vai dùng chung một kho dữ liệu trong trình duyệt của bạn. Truyện bạn soạn ở vai **tác giả**,
sau khi tự duyệt ở vai **quản trị**, sẽ xuất hiện thật trong thư viện ở vai **người xem** —
vòng lặp nội dung khép kín, nhìn thấy được.

## Chạy ở máy

Không có bước build, không cần cài gì. Chỉ cần một web server tĩnh (mở thẳng bằng `file://`
sẽ không chạy vì trình duyệt chặn ES module):

```bash
python -m http.server 8080
# rồi mở http://localhost:8080/
```

## Cấu trúc

```
index.html                shell + import map
assets/css/tokens.css     biến CSS lấy từ nguồn token của sản phẩm
assets/css/wn.css         lớp component của sản phẩm (thứ người dùng cuối thấy)
assets/css/app.css        chrome của khung trưng bày
assets/js/art.js          sinh tranh minh hoạ bằng SVG từ màu thể loại
assets/js/registry.js     sổ đăng ký 70 màn, một hợp đồng chung
assets/js/flows/          ba luồng có state thật: đọc · soạn · duyệt
assets/js/screens/        định nghĩa từng màn, nhóm theo mặt phẳng đối tượng
assets/js/data/           truyện, danh mục, nhân vật, số liệu báo cáo
```

**Không framework, không bundler, không dependency runtime.** ES module chạy thẳng trên trình
duyệt; tranh minh hoạ là SVG sinh tại chỗ nên không có một tệp ảnh nào trong repo.

## Vài điều nên biết

- **Toàn bộ dữ liệu là hư cấu.** Truyện, tên nhân vật, tên hồ sơ, số liệu báo cáo đều được viết
  mới cho bản demo. Không có dữ liệu thật của bất kỳ trẻ em hay phụ huynh nào.
- **Trạng thái lưu trong `localStorage`** của chính máy bạn, không gửi đi đâu. Nút **Đặt lại demo**
  ở mỗi trang vai đưa mọi thứ về ban đầu.
- **Giọng đọc** dùng bộ đọc sẵn có của trình duyệt. Máy nào không có giọng tiếng Việt thì nút loa
  vẫn bấm được nhưng không phát tiếng.
- **Không có điểm số.** Hệ điểm 0–100 đã bị gỡ khỏi sản phẩm vì mâu thuẫn với chính bộ luật sư
  phạm của nó; thứ thay thế là **Sổ chiến lược** — ghi lại *cách xử lý* trẻ đã khám phá, không có
  tổng, không có thứ hạng.

## Tự kiểm tra

Mở `#/tu-kiem-tra` (không nằm trên thanh điều hướng): trang này gọi hàm dựng của cả 70 màn ở mọi
trạng thái và báo số lỗi. Kỳ vọng: **0 lỗi**.
Trang **Hệ thiết kế** tự tính lại 20 cặp tương phản WCAG mỗi lần mở. Kỳ vọng: **20/20 đạt**.

## Triển khai

Đẩy lên nhánh `main`; GitHub Pages phục vụ thẳng từ thư mục gốc (`.nojekyll` để Pages không bỏ
qua thư mục nào). Mọi đường dẫn trong trang đều là đường dẫn tương đối và điều hướng bằng hash,
nên site chạy đúng ở đường dẫn con `/whatnextdemo/`.
