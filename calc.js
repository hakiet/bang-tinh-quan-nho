/* Các phép tính dùng chung cho 3 công cụ. Tách ra để kiểm thử được. */
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

  g.TinhSao = { num: num, giaVon: giaVon, caLam: caLam, money: money, pct: pct };
})(typeof window !== 'undefined' ? window : globalThis);
