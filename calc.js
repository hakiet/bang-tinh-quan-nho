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

  /* Mức thuê mặt bằng tối đa trong một tháng.
     doanhThu = doanh thu dự kiến mỗi tháng; chiPhiKhac = các chi phí cố định khác;
     loiNhuan = lợi nhuận tối thiểu muốn giữ; dienTich = diện tích mặt bằng (m2);
     tienCoc = tiền đặt cọc dự kiến. */
  function thueMatBang(o) {
    var doanhThu = num(o.doanhThu);
    var chiPhiKhac = num(o.chiPhiKhac);
    var loiNhuan = num(o.loiNhuan);
    var dienTich = num(o.dienTich);
    var tienCoc = num(o.tienCoc);
    if (doanhThu <= 0) return null;
    var tienThue = doanhThu - chiPhiKhac - loiNhuan;
    if (tienThue <= 0) return null;
    return {
      doanhThu: doanhThu,
      tienThue: tienThue,
      tienThueNam: tienThue * 12,
      tyLeThue: tienThue / doanhThu * 100,
      tienTrenM2: dienTich > 0 ? tienThue / dienTich : null,
      soThangCoc: tienCoc > 0 ? tienCoc / tienThue : null
    };
  }

  /* Lương nhân viên theo ca.
     tienCongCa = tiền công một ca (đ); gioCa = số giờ trong một ca;
     gioThem = số giờ làm thêm trong ca; tyLeThem = phần trăm trả cao hơn cho giờ thêm;
     phuCapCa = phụ cấp mỗi ca (đ); soCa = số ca trong tháng;
     doanhThu = doanh thu tháng (đ), dùng để ra tỷ lệ lương trên doanh thu. */
  function luongTheoCa(o) {
    var tienCongCa = num(o.tienCongCa);
    var gioCa = num(o.gioCa);
    var gioThem = num(o.gioThem);
    var tyLeThem = num(o.tyLeThem);
    var phuCapCa = num(o.phuCapCa);
    var soCa = num(o.soCa);
    var doanhThu = num(o.doanhThu);
    if (tienCongCa <= 0 || gioCa <= 0) return null;
    if (gioThem < 0) gioThem = 0;
    if (tyLeThem < 0) tyLeThem = 0;
    if (soCa < 0) soCa = 0;
    var congGio = tienCongCa / gioCa;
    var tienThem = congGio * gioThem * (1 + tyLeThem / 100);
    var luongCa = tienCongCa + tienThem + phuCapCa;
    var tongThang = luongCa * soCa;
    return {
      congGio: congGio,
      tienThem: tienThem,
      luongCa: luongCa,
      tongThang: tongThang,
      gioThang: (gioCa + gioThem) * soCa,
      tyLeLuong: doanhThu > 0 ? tongThang / doanhThu * 100 : null
    };
  }

  /* Vốn mở quán.
     tienCoc = tiền cọc mặt bằng (đ); suaChua = sửa chữa, trang trí (đ);
     thietBi = thiết bị, máy móc, tủ kệ (đ); tonKhoMo = tồn kho mở hàng (đ);
     khacMo = giấy phép, quảng cáo, chi phí khác lúc mở (đ);
     vay = số tiền vay (đ), dùng để ra vốn tự quân;
     chiPhiThang = chi phí vận hành mỗi tháng (đ);
     doanhThuThang = doanh thu kỳ vọng mỗi tháng (đ). */
  function vonMoQuan(o) {
    var tienCoc = num(o.tienCoc);
    var suaChua = num(o.suaChua);
    var thietBi = num(o.thietBi);
    var tonKhoMo = num(o.tonKhoMo);
    var khacMo = num(o.khacMo);
    var vay = num(o.vay);
    var chiPhiThang = num(o.chiPhiThang);
    var doanhThuThang = num(o.doanhThuThang);
    if (vay < 0) vay = 0; /* nhập âm là nhập nhầm */
    var tongVon = tienCoc + suaChua + thietBi + tonKhoMo + khacMo;
    if (tongVon <= 0 && doanhThuThang <= 0) return null;
    var vonTuQuan = tongVon - vay;
    if (vonTuQuan < 0) vonTuQuan = 0;
    var loiNhuanThang = doanhThuThang - chiPhiThang;
    return {
      tongVon: tongVon,
      vonTuQuan: vonTuQuan,
      vay: vay,
      loiNhuanThang: loiNhuanThang,
      thangHoaVon: loiNhuanThang > 0 ? tongVon / loiNhuanThang : null,
      tyLeChiPhi: doanhThuThang > 0 ? chiPhiThang / doanhThuThang * 100 : null
    };
  }

  function money(n) {
    return Math.round(n).toLocaleString('vi-VN') + ' đ';
  }
  function pct(n) {
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
  }

  g.TinhSao = { num: num, giaVon: giaVon, laiGop: laiGop, hoaVon: hoaVon, hoaHong: hoaHong, nhapHang: nhapHang, thueMatBang: thueMatBang, caLam: caLam, luongTheoCa: luongTheoCa, vonMoQuan: vonMoQuan, money: money, pct: pct };
})(typeof window !== 'undefined' ? window : globalThis);
