# Bảng tính cho quán nhỏ

Bốn trang tĩnh, không máy chủ, không cơ sở dữ liệu, không đăng ký người dùng.
Mở là chạy, dữ liệu chỉ nằm trong trình duyệt.

| Trang | Việc |
|---|---|
| `index.html` | Trang chủ, giới thiệu 3 công cụ |
| `gia-von.html` | Tính giá vốn, lãi gộp, tỷ lệ lãi của một phần món |
| `cham-cong.html` | Chấm giờ ca, tiền công, doanh thu trên giờ công, so sánh các ca |
| `bien-nhan-giat.html` | Mẫu biên nhận giặt, in ra hoặc chép vào sổ |
| `404.html` | Trang không tìm thấy, có link về 3 công cụ |

Giá và định lượng nhập vào đều là số thường: `60.000`, `0,018`, `25.000`. Chấm
đồng vạch là phân cách nghìn, dấu phẩy là dấu thập phân.

## Đưa lên mạng bằng cách nào (đều miễn phí)

Cách nhanh nhất, không cần cài gì, không cần mật khẩu:

1. Vào <https://app.netlify.com/drop>
2. Kéo cả thư mục `bang-tinh-quan-nho` vào ô trên trang.
3. Trang cho sẵn một địa chỉ dạng `ten-giong-ban.netlify.app`.
4. Muốn đổi tên miền thì vào **Site settings → Change site name**.

Có thêm 2 lựa chọn nữa nếu muốn dùng lâu dài hơn:

- **Cloudflare Pages** (miễn phí, không giới hạn băng thông): cần tài khoản
  Cloudflare và một mã API. Chạy lệnh trong mục "Lệnh tự động" bên dưới.
- **Surge.sh** (miễn phí): cần tài khoản email, xong là có địa chỉ
  `ten-giong-ban.surge.sh`.

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
