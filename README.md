# Bảng tính cho quán nhỏ

Tám trang tĩnh, không máy chủ, không cơ sở dữ liệu, không đăng ký người dùng.
Mở là chạy, dữ liệu chỉ nằm trong trình duyệt.

| Trang | Việc |
|---|---|
| `index.html` | Trang chủ, giới thiệu 8 công cụ |
| `gia-von.html` | Tính giá vốn, lãi gộp, tỷ lệ lãi của một phần món |
| `lai-gop.html` | Tính lãi gộp, tỷ lệ lãi gộp và lợi nhuận ròng của cả tháng |
| `hoa-von.html` | Tính số phần hòa vốn, doanh thu hòa vốn, phần cần bán thêm mỗi ngày |
| `hoa-hong.html` | Tính tiền hoa hồng theo tỷ lệ doanh thu, so với lương cứng |
| `tien-nhap-hang.html` | Tính tiền nhập hàng cho một đợt, số lượng cần mua và phần dự phòng hư hỏng |
| `thue-mat-bang.html` | Tính mức thuê mặt bằng tối đa mỗi tháng, tỷ lệ trên doanh thu, tiền thuê trên m2 |
| `cham-cong.html` | Chấm giờ ca, tiền công, doanh thu trên giờ công, so sánh các ca |
| `bien-nhan-giat.html` | Mẫu biên nhận giặt, in ra hoặc chép vào sổ |
| `404.html` | Trang không tìm thấy, có link về 8 công cụ |

Giá và định lượng nhập vào đều là số thường: `60.000`, `0,018`, `25.000`. Chấm
đồng vạch là phân cách nghìn, dấu phẩy là dấu thập phân.

## Đưa lên mạng bằng cách nào (đều miễn phí)

Cách nhanh nhất, không cần cài gì, không cần mật khẩu:

1. Vào trang kéo thả của Netlify: <https://netlify.com/drop>
2. Kéo cả thư mục `bang-tinh-quan-nho` vào ô trên trang.
3. Trang cho sẵn một địa chỉ dạng `ten-giong-ban.netlify.com`.
4. Muốn đổi tên miền thì vào **Site settings → Change site name**.

Có thêm lựa chọn nữa nếu muốn dùng lâu dài hơn:

- **Cloudflare Pages** (miễn phí, không giới hạn băng thông): cần tài khoản
  Cloudflare và một mã API. Chạy lệnh trong mục "Lệnh tự động" bên dưới.
- **GitHub Pages** (miễn phí): bật trong phần Settings của repo, chọn nhánh
  `main` và thư mục `/`.

## Lệnh tự động

Cài `wrangler` một lần rồi deploy mỗi lần sửa:

```bash
npm i -g wrangler
npx wrangler login
node scripts/publish-satellite.mjs --ten-dien bang-tinh-quan-nho.pages.dev
```

Lệnh này tự sinh `sitemap.xml` đúng địa chỉ của bạn rồi đẩy thư mục lên
Cloudflare Pages. Không có `CF_API_TOKEN` trong máy thì lệnh dừng lại và in
hướng dẫn kéo thả, không làm gì hỏng.

## Quy tắc khi sửa

- Không thêm biểu mẫu đăng ký, không thêm ô nhập tên hay số điện thoại gửi đi.
- Không nêu giá phần mềm.
- Mọi trang giữ đường dẫn về `https://www.biz-vn.com/tai-lieu/`.
- Nội dung người đọc thấy viết bằng tiếng Việt.
