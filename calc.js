/* Các phép tính dùng chung cho các công cụ. Tách ra để kiểm thử được. */
(function (g) {
  'use strict';

  function num(v) {
    if (typeof v !== 'string') v = v == null ? '' : String(v);
    v = v.trim();
    /* Chủ quán hay viết 60.000 hoặc 1.234.567,5: dấu chấm là phân cách nghìn.
       Số mở đầu bằng 0 (0,018 / 0.018) thì chấm vẫn là dấu thập phân. */
    if (/^[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(v)) v = v.replace(/\./g, '').replace(',', '.');
    else v = v.replace(',', '.');
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }

  /* Tính giá vốn một phần món.
     dinhLuong = số lượng dùng cho 1 phần (đơn vị của giá nhập). */
  function giaVon(o) {
    var giaNhap = num(o.giaNhap);
    var dinhLuong = num(o.dinhLuong);
    var giaBan = num(o.giaBan);
    var chiPhiKhac = num(o.chiPhiKhac);
    var mucTieu = num(o.mucTieu) || 60;
    if (giaNhap <= 0 || giaBan <= 0 || dinhLuong <= 0) return null;
    var chiPhi = giaNhap * dinhLuong + chiPhiKhac;
    var lai = giaBan - chiPhi;
    var tyLe = lai / giaBan * 100;
    var giaCan = chiPhi / (1 - mucTieu / 100);
    /* Lượng tối đa còn lại để đạt tỷ lệ lãi mục tiêu. */
    var maxLuong = (giaBan * (1 - mucTieu / 100) - chiPhiKhac) / giaNhap;
    return {
      chiPhi: chiPhi,
      lai: lai,
      tyLe: tyLe,
      giaCan: giaCan,
      maxLuong: maxLuong,
      mucTieu: mucTieu
    };
  }

  /* Lãi gộp của cả quán trong một tháng.
     doanhThu = tiền bán ra; giaVon = tiền mua hàng đã bán;
     chiPhiBienDinh = hoa hồng, đóng hộp, giao hàng (tăng theo số hàng bán);
     chiPhiCoDinh = mặt bằng, lương, điện nước (không đổi theo số hàng bán). */
  function laiGop(o) {
    var doanhThu = num(o.doanhThu);
    var giaVon = num(o.giaVon);
    var bienDinh = num(o.chiPhiBienDinh);
    var coDinh = num(o.chiPhiCoDinh);
    if (doanhThu <= 0) return null;
    var von = giaVon + bienDinh;
    var lai = doanhThu - von;
    var loiNhuan = lai - coDinh;
    return {
      von: von,
      lai: lai,
      tyLeLai: lai / doanhThu * 100,
      loiNhuan: loiNhuan,
      tyLeLoi: loiNhuan / doanhThu * 100,
      coDinh: coDinh
    };
  }

  /* Điểm hòa vốn trong kỳ: số phần phải bán để bù hết chi phí cố định.
     giaBan - chiPhiBienDinh = lãi gộp mỗi phần. */
  function hoaVon(o) {
    var coDinh = num(o.chiPhiCoDinh);
    var giaBan = num(o.giaBan);
    var bienDinh = num(o.chiPhiBienDinh);
    var banNgay = num(o.banMoiNgay);
    var soNgay = num(o.soNgayBan) || 30;
    if (giaBan <= 0) return null;
    var lai = giaBan - bienDinh;
    if (lai <= 0) return null;
    var soPhan = coDinh / lai;
    var doanhThu = soPhan * giaBan;
    var canMoiNgay = soPhan / soNgay;
    var thieu = banNgay > 0 ? canMoiNgay - banNgay : null;
    return {
      lai: lai,
      soPhan: soPhan,
      doanhThu: doanhThu,
      soNgay: soNgay,
      canMoiNgay: canMoiNgay,
      banMoiNgay: banNgay,
      thieuPhanMoiNgay: thieu,
      canThemPhanMoiNgay: thieu !== null && thieu > 0 ? thieu : 0
    };
  }

  /* Hoa hồng theo doanh thu, và mức lương cứng tương đương.
     doanhThu = doanh thu của riêng người bán trong tháng;
     tyLe = tỷ lệ hoa hồng (%);
     luongCu = lương cứng mỗi tháng (đ), dùng để quy đổi ngược. */
  function hoaHong(o) {
    var doanhThu = num(o.doanhThu);
    var tyLe = num(o.tyLe);
    var luongCu = num(o.luongCu);
    if (doanhThu <= 0) return null;
    if (tyLe < 0) tyLe = 0; /* nhập âm là nhập nhầm */
    var tien = doanhThu * tyLe / 100;
    var tuongDuong = luongCu > 0 ? luongCu / doanhThu * 100 : null;
    return {
      doanhThu: doanhThu,
      tyLe: tyLe,
      tien: tien,
      luongCu: luongCu,
      tongThuNhap: tien + luongCu,
      tyLeTuongDuong: tuongDuong,
      chenhLech: tuongDuong === null ? null : tuongDuong - tyLe
    };
  }

  /* Tiền nhập hàng cho một đợt.
     soLuong = lượng bán trung bình mỗi ngày; soNgay = số ngày bán trong đợt;
     giaVon = giá nhập của một đơn vị; duPhong = tỷ lệ hư hỏng, mất mát (%). */
  function nhapHang(o) {
    var soLuong = num(o.soLuong);
    var soNgay = num(o.soNgay) || 7;
    var giaVon = num(o.giaVon);
    var duPhong = num(o.duPhong);
    if (soLuong <= 0 || giaVon <= 0) return null;
    if (duPhong < 0) duPhong = 0; /* nhập âm là nhập nhầm */
    var luongCan = soLuong * soNgay;
    var tienCan = luongCan * giaVon;
    var luongNhap = luongCan * (1 + duPhong / 100);
    var tienNhap = luongNhap * giaVon;
    return {
      luongCan: luongCan,
      tienCan: tienCan,
      luongNhap: luongNhap,
      tienNhap: tienNhap,
      tienDuPhong: tienNhap - tienCan,
      soNgay: soNgay,
      duPhong: duPhong
    };
  }

  /* Tính một ca làm việc. Ca qua nửa đêm vẫn tính đúng. */
  function caLam(o) {
    var vao = o.vao || '';
    var ra = o.ra || '';
    if (!vao || !ra) return null;
    var a = vao.split(':');
    var b = ra.split(':');
    var pVao = +a[0] * 60 + +a[1];
    var pRa = +b[0] * 60 + +b[1];
    if (pRa <= pVao) pRa += 24 * 60;
    var nghi = num(o.nghi);
    var phut = pRa - pVao - nghi;
    if (phut <= 0) return null;
    var gio = phut / 60;
    var mucCong = num(o.mucCong);
    var doanhThu = num(o.doanhThu);
    var tien = gio * mucCong;
    return {
      gio: gio,
      phut: phut,
      tien: tien,
      doanhThu: doanhThu,
      trenGio: gio > 0 ? doanhThu / gio : 0,
      tyLe: doanhThu > 0 ? tien / doanhThu * 100 : 0
    };
  }

  function money(n) {
    return Math.round(n).toLocaleString('vi-VN') + ' đ';
  }
  function pct(n) {
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
  }

  g.TinhSao = { num: num, giaVon: giaVon, laiGop: laiGop, hoaVon: hoaVon, hoaHong: hoaHong, nhapHang: nhapHang, caLam: caLam, money: money, pct: pct };
})(typeof window !== 'undefined' ? window : globalThis);
