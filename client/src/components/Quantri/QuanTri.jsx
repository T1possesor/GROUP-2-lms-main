import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaClipboardList, FaTrophy, FaChartBar } from "react-icons/fa";
import "./QuanTri.scss";
import logoLogin from "../../assets/logologin.png";
import QuanTriMain from "../../assets/quantri2.PNG";
import { FaCalendarAlt } from "react-icons/fa";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const QuanTri = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [taiKhoanList, setTaiKhoanList] = useState([]);
const [loadingTaiKhoan, setLoadingTaiKhoan] = useState(false);
const [showModal, setShowModal] = useState(false);
const [newEmail, setNewEmail] = useState("");
const [newPassword, setNewPassword] = useState("");
const [newTendangnhap, setNewTendangnhap] = useState("");
const [deleteId, setDeleteId] = useState(null); // ID tài khoản cần xóa
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [editingAccountId, setEditingAccountId] = useState(null);
const [baiThiList, setBaiThiList] = useState([]);
const [searchBaiThi, setSearchBaiThi] = useState("");
const [filteredBaiThiList, setFilteredBaiThiList] = useState([]);
const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
const [showAddBaiThiForm, setShowAddBaiThiForm] = useState(false);
const [tenBaiThi, setTenBaiThi] = useState("");
const [thoiGian, setThoiGian] = useState("");
const [ngayBatDau, setNgayBatDau] = useState("");
const [ngayKetThuc, setNgayKetThuc] = useState("");
const [selectedBaiThiId, setSelectedBaiThiId] = useState(null);
const [xepHangData, setXepHangData] = useState([]);
const [xepHangTitle, setXepHangTitle] = useState("");
const [searchXepHang, setSearchXepHang] = useState("");
const [appliedSearchXepHangTerm, setAppliedSearchXepHangTerm] = useState("");
const [tongHopXepHang, setTongHopXepHang] = useState([]);
const [searchThongKe, setSearchThongKe] = useState("");
const [appliedSearchThongKe, setAppliedSearchThongKe] = useState("");
const [selectedThongKe, setSelectedThongKe] = useState(null);



const [dsCauHoi, setDsCauHoi] = useState(
  Array.from({ length: 5 }, () => ({
    NoiDung: "",
    PhuongAn: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    DapAnDung: "", // A, B, C hoặc D
  }))
);
const [trangThaiMo, setTrangThaiMo] = useState(true); // true = Đã mở, false = Đã đóng
const fetchTongHopXepHang = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/xep-hang/tong-hop");
    setTongHopXepHang(res.data.data || []);
  } catch (err) {
    console.error("Lỗi gọi API tổng hợp xếp hạng:", err);
  }
};
const batDauRef = useRef(null);
const ketThucRef = useRef(null);
// Hàm chuyển ISO về yyyy-MM-dd cho input date
const formatToInputDateTime = (isoDateTime) => {
  if (!isoDateTime) return "";
  const date = new Date(isoDateTime);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;  // <-- định dạng chuẩn
};
useEffect(() => {
  if (selectedThongKe) {
    axios.get(`http://localhost:5000/api/bai-thi/${selectedThongKe.BaiThiID}/diem-cao-nhat`)
      .then((res) => {
        const passed = res.data.filter((item) => item.DiemCaoNhat >= 5).length;
        setThongTinDau(passed);
      })
      .catch((err) => console.error("Lỗi gọi số lượt đậu:", err));
  }
}, [selectedThongKe]);
const [thongTinDau, setThongTinDau] = useState(0);

const formatToDisplayDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
};
useEffect(() => {
  const fetchXepHang = async () => {
    if (!selectedBaiThiId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/xep-hang/${selectedBaiThiId}`);
      const rawData = res.data.data;
      const tenBaiThi = res.data.tenBaiThi;
      let currentRank = 1;
      let prevScore = null;
      let rankCounter = 1;

      const ranked = [];
      rawData.forEach(item => {
        if (prevScore !== null && item.Diem < prevScore) {
          currentRank = rankCounter;
        }
        ranked.push({ ...item, XepHang: currentRank });
        prevScore = item.Diem;
        rankCounter++;
      });

      setXepHangData(ranked);
      setXepHangTitle(tenBaiThi);
    } catch (err) {
      console.error("❌ Lỗi tải bảng xếp hạng:", err);
    }
  };

  fetchXepHang();
}, [selectedBaiThiId]);


const handleSearchXepHang = () => {
  setAppliedSearchXepHangTerm(searchXepHang);
};

const handleResetSearchXepHang = () => {
  setSearchXepHang("");
  setAppliedSearchXepHangTerm("");
};


const formatToDisplayDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const [dataPhanPhoiDiem, setDataPhanPhoiDiem] = useState([]);

useEffect(() => {
  if (selectedThongKe) {
    axios
      .get(`http://localhost:5000/api/thong-ke/diem-theo-moc/${selectedThongKe.BaiThiID}`)
      .then((res) => {
        if (res.data.success) {
          setDataPhanPhoiDiem(res.data.data);
        }
      })
      .catch((err) => console.error("Lỗi lấy phân phối điểm:", err));
  }
}, [selectedThongKe]);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTaiKhoanList = taiKhoanList.filter((item) =>
  item.Tendangnhap.toLowerCase().includes(searchTerm.toLowerCase())
);


const handleXoaBaiThi = async (id) => {
  const confirm = window.confirm("Bạn có chắc muốn xóa bài thi này?");
  if (!confirm) return;

  try {
    const res = await axios.delete(`http://localhost:5000/api/bai-thi/${id}`);
    alert(res.data.message || "Đã xóa bài thi!");
    fetchBaiThiList(); // cập nhật danh sách
  } catch (err) {
    console.error("❌ Lỗi khi xóa bài thi:", err);
    alert("Không thể xóa bài thi.");
  }
};

  // Quản lý menu được chọn
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedRole, setSelectedRole] = useState("QuanTri"); // hoặc 'ThiSinh'


  // Quản lý hiển thị "Chào mừng" khi click logo
  const [showWelcome, setShowWelcome] = useState(true);

  const handleCreateOrUpdateAccount = async () => {
  if (!newTendangnhap || !newPassword) {
  alert("Vui lòng nhập tên tài khoản và mật khẩu");
  return;
}


  try {
    if (isEditMode) {
      // Gửi PUT request cập nhật tài khoản
      const endpoint = selectedRole === "ThiSinh"
  ? `http://localhost:5000/api/accounts/thisinh/${editingAccountId}`
  : `http://localhost:5000/api/accounts/quantri/${editingAccountId}`;

await axios.put(endpoint, {
  Tendangnhap: newTendangnhap,
  Matkhau: newPassword
});

      alert("Cập nhật tài khoản thành công!");
    } else {
      // Gửi POST request tạo tài khoản
      await axios.post("http://localhost:5000/api/accounts/quantri/create", {
        Tendangnhap: newTendangnhap,
        Email: newEmail,
        Matkhau: newPassword,
      });
      alert("Tạo tài khoản thành công!");
    }

    setShowModal(false);
    setIsEditMode(false);
    setEditingAccountId(null);
    setNewTendangnhap("");
    setNewEmail("");
    setNewPassword("");
    fetchTaiKhoanData(selectedRole);
  } catch (err) {
    console.error("❌ Lỗi:", err);
    alert("Tài khoản hoặc email có thể đã tồn tại.");
  }
};
useEffect(() => {
  if (appliedSearchTerm.trim() === "") {
    setFilteredBaiThiList([]);
    return;
  }

  const filtered = baiThiList.filter((item) =>
    item.TenBaiThi.toLowerCase().includes(appliedSearchTerm.toLowerCase())
  );
  setFilteredBaiThiList(filtered);
}, [appliedSearchTerm, baiThiList]);

const fetchBaiThiList = () => {
  axios.get("http://localhost:5000/api/bai-thi")
    .then((res) => {
      setBaiThiList(res.data);
    })
    .catch((err) => {
      console.error("❌ Lỗi lấy bài thi:", err);
    });
};
const handleXoaCauHoi = (indexToDelete) => {
  const updated = dsCauHoi.filter((_, idx) => idx !== indexToDelete);
  setDsCauHoi(updated);
};
const handleLuuBaiThi = async () => {
  if (!tenBaiThi || !thoiGian || !ngayBatDau || !ngayKetThuc) {
    alert("Vui lòng nhập đủ thông tin bài thi");
    return;
  }

  const cauHoiChuaHoanThanh = dsCauHoi.some((item) => {
  const daNhapNoiDung = item.NoiDung.trim() !== "";
  const daChonDapAn = ["A", "B", "C", "D"].includes(item.DapAnDung);
  const tatCaPhuongAnDaNhap = ["A", "B", "C", "D"].every((label) => item.PhuongAn[label].trim() !== "");

  return !(daNhapNoiDung && daChonDapAn && tatCaPhuongAnDaNhap);
});

if (cauHoiChuaHoanThanh) {
  alert("Vui lòng nhập đầy đủ nội dung, các phương án và chọn đáp án đúng cho từng câu hỏi.");
  return;
}

  const CauHoi = dsCauHoi.map((item) => ({
    NoiDung: item.NoiDung,
    PhuongAn: ["A", "B", "C", "D"].map((label) => ({
      PhanLoai: label,
      NoiDung: item.PhuongAn[label],
      LaDapAnDung: item.DapAnDung === label
    }))
  }));

  try {
  const payload = {
    TenBaiThi: tenBaiThi,
    ThoiGian: `${thoiGian} phút`,
    NgayBatDau: ngayBatDau,
    NgayKetThuc: ngayKetThuc,
    TrangThai: trangThaiMo ? "Đã mở" : "Đã đóng",
    CauHoi
  };

  if (isEditMode && editingAccountId) {
    // Chế độ sửa → gọi API PUT
    await axios.put(`http://localhost:5000/api/bai-thi/${editingAccountId}/update`, payload);
    alert("Cập nhật bài thi thành công!");
  } else {
    // Tạo mới → gọi API POST
    await axios.post("http://localhost:5000/api/bai-thi/create", payload);
    alert("Tạo bài thi thành công!");
  }

  // Reset form sau khi tạo/sửa
  setShowAddBaiThiForm(false);
  setTenBaiThi("");
  setThoiGian("");
  setNgayBatDau("");
  setNgayKetThuc("");
  setDsCauHoi(
    Array.from({ length: 5 }, () => ({
      NoiDung: "",
      PhuongAn: { A: "", B: "", C: "", D: "" },
      DapAnDung: ""
    }))
  );
  setIsEditMode(false);
  setEditingAccountId(null);
  fetchBaiThiList();
} catch (err) {
  console.error("❌ Lỗi xử lý bài thi:", err);
  alert(isEditMode ? "Cập nhật bài thi thất bại" : "Tạo bài thi thất bại");
}

};

const handleSearchBaiThi = () => {
  setAppliedSearchTerm(searchBaiThi); // Chỉ khi bấm nút thì mới lọc
};


const handleResetBaiThi = () => {
  setSearchBaiThi("");
  setAppliedSearchTerm("");
  setFilteredBaiThiList([]);
};
const handleSuaBaiThi = async (id) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/bai-thi/${id}`);
    const data = res.data;

    setTenBaiThi(data.TenBaiThi || "");
    setThoiGian(parseInt(data.ThoiGian) || "");
    setNgayBatDau(formatToInputDateTime(data.NgayBatDau));
setNgayKetThuc(formatToInputDateTime(data.NgayKetThuc));


    setTrangThaiMo(data.TrangThai === "Đã mở");

    const convertedCauHoi = data.CauHoi.map((cauHoi) => {
      const phuongAnObj = {};
      let dapAnDung = "";

      cauHoi.PhuongAn.forEach((pa) => {
        phuongAnObj[pa.PhanLoai] = pa.NoiDung;
        if (pa.LaDapAnDung) dapAnDung = pa.PhanLoai;
      });

      return {
        NoiDung: cauHoi.NoiDung,
        PhuongAn: phuongAnObj,
        DapAnDung: dapAnDung,
      };
    });

    setDsCauHoi(convertedCauHoi);
    setShowAddBaiThiForm(true);
    setIsEditMode(true); // <- chuyển sang chế độ sửa
    setEditingAccountId(id); // <- lưu ID bài thi để gửi lên API PUT sau này
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu bài thi:", err);
    alert("Không thể lấy dữ liệu bài thi.");
  }
};


  // Ref để detect click ngoài dropdown để đóng
  const dropdownRef = useRef();

  useEffect(() => {
    if (!user || user.Vaitro !== "QuanTri") {
      navigate("/login");
      return;
    }

    let isMounted = true;
    let url = null;

    axios({
      method: "get",
      url: `http://localhost:5000/api/profile-image/${user.ID}`,
      responseType: "blob",
    })
      .then((response) => {
        if (isMounted) {
          url = URL.createObjectURL(response.data);
          setAvatarUrl(url);
        }
      })
      .catch((error) => {
        console.error("Lấy avatar lỗi:", error);
        if (isMounted) setAvatarUrl(null);
      });

    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [user, navigate]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Xử lý click logo: hiển thị welcome và bỏ chọn menu
  const handleLogoClick = () => {
    setShowWelcome(true);
    setActiveMenu(null);
  };
const handleEditClick = (account) => {
  setIsEditMode(true);
  setEditingAccountId(account.ID);
  setNewTendangnhap(account.Tendangnhap);
  setNewEmail(account.Email || "");
  setNewPassword(account.Matkhau || ""); // Chỉ để test hoặc dùng input type password giả
  setShowModal(true);
};

const handleDelete = async () => {
  try {
    const res = await axios.delete(`http://localhost:5000/api/accounts/${deleteId}`);
    alert("Xóa thành công!");
    setShowDeleteConfirm(false);
    fetchTaiKhoanData(selectedRole); // Refresh list
  } catch (err) {
    alert("Lỗi khi xóa tài khoản");
    console.error(err);
  }
};

const fetchTaiKhoanData = (vaitro) => {
  setLoadingTaiKhoan(true);
  const endpoint =
    vaitro === "QuanTri"
      ? "http://localhost:5000/api/accounts/quantri"
      : "http://localhost:5000/api/accounts/thisinh";

  axios
    .get(endpoint)
    .then((res) => {
      if (res.data.success) {
        setTaiKhoanList(res.data.data);
      } else {
        setTaiKhoanList([]);
      }
    })
    .catch((err) => {
      console.error("Lỗi lấy tài khoản:", err);
      setTaiKhoanList([]);
    })
    .finally(() => setLoadingTaiKhoan(false));
};

const [thongKeList, setThongKeList] = useState([]);
useEffect(() => {
  if (activeMenu === "thongke") {
    axios.get("http://localhost:5000/api/thong-ke/bai-thi")
      .then((res) => setThongKeList(res.data.data || []))
      .catch((err) => console.error("Lỗi gọi thống kê:", err));
  }
}, [activeMenu]);

const filteredThongKeList = thongKeList.filter(item =>
  item.TenBaiThi.toLowerCase().includes(appliedSearchThongKe.toLowerCase())
);

  // Xử lý click menu: ẩn welcome và set menu active
  const handleMenuClick = (menuKey) => {
  setShowWelcome(false);
  setActiveMenu(menuKey);
  // Reset trạng thái modal để không hiện form cũ
  setShowModal(false);

  if (menuKey === "taikhoan") {
    fetchTaiKhoanData(selectedRole); // gọi theo vai trò hiện tại
  }
  if (menuKey === "baithi") {
  fetchBaiThiList();
}
if (menuKey === "bangxephang") {
  fetchTongHopXepHang();
}


};



  return (
    <div className="quantri-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
          <img src={logoLogin} alt="Logo QuizPro" className="sidebar-logo-img" />
          <div className="admin-label">ADMIN</div>
        </div>
        <nav className="sidebar-menu">
          <ul>
            <li
              className={activeMenu === "taikhoan" ? "active" : ""}
              onClick={() => handleMenuClick("taikhoan")}
            >
              <FaUser className="menu-icon" /> Quản lý tài khoản
            </li>
            <li
              className={activeMenu === "baithi" ? "active" : ""}
              onClick={() => handleMenuClick("baithi")}
            >
              <FaClipboardList className="menu-icon" /> Quản lý bài thi
            </li>
            <li
              className={activeMenu === "bangxephang" ? "active" : ""}
              onClick={() => handleMenuClick("bangxephang")}
            >
              <FaTrophy className="menu-icon" /> Bảng xếp hạng
            </li>
            <li
              className={activeMenu === "thongke" ? "active" : ""}
              onClick={() => handleMenuClick("thongke")}
            >
              <FaChartBar className="menu-icon" /> Thống kê bài thi
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="main-header">
          <h2>
            {activeMenu === "taikhoan" && "Quản lý tài khoản"}
            {activeMenu === "baithi" && "Quản lý bài thi"}
            {activeMenu === "bangxephang" && "Bảng xếp hạng"}
            {activeMenu === "thongke" && "Thống kê bài thi"}
            
          </h2>
          <div
            className="user-info"
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            ref={dropdownRef}
          >
            {avatarUrl && <img src={avatarUrl} alt="Avatar" className="user-avatar" />}
            <span>{user?.Hoten || "Quản trị viên"}</span>
            {dropdownOpen && (
  <div className="dropdown-menu">
    <ul>
      <li
        onClick={() => {
          navigate("/thong-tin-ca-nhan", { state: { showChangePassword: false } });
        }}
      >
        Thông tin cá nhân
      </li>
      <li
        onClick={() => {
          navigate("/thong-tin-ca-nhan", { state: { showChangePassword: true } });
        }}
      >
        Đổi mật khẩu
      </li>
      <li
        onClick={() => {
          const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
          if (confirmLogout) {
            setDropdownOpen(false);
            navigate("/login");
          }
        }}
      >
        Đăng xuất
      </li>
    </ul>
  </div>
)}


          </div>
        </header>

        <section className="content-area">
          {showWelcome && !activeMenu && (
            <>
              <img src={QuanTriMain} alt="Ảnh quản trị" className="welcome-img" />
              <h3 className="welcome-text">CHÀO MỪNG BẠN QUAY TRỞ LẠI !</h3>
            </>
          )}
          {/* Nếu bạn không muốn hiện nội dung gì khi click menu thì để trống phần bên dưới */}
          {/* Hoặc nếu muốn hiện nội dung khác, bạn có thể thêm */}
          {!showWelcome && activeMenu === "taikhoan" && (
  <div className="qltk-wrapper">
    {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{isEditMode ? "Sửa tài khoản" : "Tạo tài khoản mới"}</h3>

      <input
      type="text"
      placeholder="Nhập tên tài khoản"
      value={newTendangnhap}
      onChange={(e) => setNewTendangnhap(e.target.value)}
      className="modal-input"
    />

      
      <input
        type="password"
        placeholder="Nhập mật khẩu"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="modal-input"
      />
      <div className="modal-actions">
        <button className="btn-cancel" onClick={() => setShowModal(false)}>HỦY BỎ</button>
        <button className="btn-save" onClick={handleCreateOrUpdateAccount}>LƯU</button>

      </div>
    </div>
  </div>
)}

    {loadingTaiKhoan ? (
      <p>Đang tải dữ liệu...</p>
    ) : (
  <>
  <div className="account-tabs">
  <span
    className={selectedRole === "QuanTri" ? "active-tab" : ""}
    onClick={() => {
      setSelectedRole("QuanTri");
      fetchTaiKhoanData("QuanTri");
    }}
  >
    Quản trị viên
  </span>
  <span
    className={selectedRole === "ThiSinh" ? "active-tab" : ""}
    onClick={() => {
      setSelectedRole("ThiSinh");
      fetchTaiKhoanData("ThiSinh");
    }}
  >
    Thí sinh
  </span>
</div>
    <div className="qltk-header">
  <button
    className="btn-them"
    style={{ visibility: selectedRole === "QuanTri" ? "visible" : "hidden" }}
    onClick={() => {
      setIsEditMode(false);
      setEditingAccountId(null);
      setNewTendangnhap("");
      setNewEmail("");
      setNewPassword("");
      setShowModal(true);
    }}
  >
    + Thêm mới
  </button>

  <input
    type="text"
    placeholder="Tìm kiếm"
    className="search-input"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>



    <table className="qltk-table">
      <thead>
  <tr>
    <th>STT</th>
    <th>Tên tài khoản</th>
    <th>Trạng thái</th>
    <th>Ngày tạo</th>
    <th></th>
  </tr>
</thead>
<tbody>
  {filteredTaiKhoanList.map((item, index) => (
    <tr key={item.ID}>
      <td>{index + 1}</td>
      <td>{item.Tendangnhap}</td>
      <td>{item.TrangThai}</td>
      <td>{item.Ngaytao}</td>
      <td>
        <div className="action-buttons">
          <button className="btn-sua" onClick={() => handleEditClick(item)}>SỬA</button>
          <button className="btn-xoa" onClick={() => {
            setDeleteId(item.ID);
            setShowDeleteConfirm(true);
          }}>XÓA</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>



    </table>
  </>
)}

{showDeleteConfirm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="delete-icon">❗</div>
      <h3 className="delete-title">Xác nhận xóa tài khoản</h3>
      <p className="delete-message">
        Bạn chắc chắn muốn xóa tài khoản này? Sau khi xóa, sẽ không thể khôi phục lại.
      </p>
      <div className="modal-actions">
        <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
          Hủy bỏ
        </button>
        <button className="btn-xoa" onClick={handleDelete}>
          Xóa vĩnh viễn
        </button>
      </div>
    </div>
  </div>
)}



  </div>
)}

          {!showWelcome && activeMenu === "baithi" && (
  <div className="qlbaithi-wrapper">

    {showAddBaiThiForm ? (
      <div className="form-tao-bai-thi">
        <div className="row-thongtin-baithi">
  <input
    type="text"
    placeholder="Tên bài thi"
    value={tenBaiThi}
    onChange={(e) => setTenBaiThi(e.target.value)}
  />
  <input
    type="number"
    min="1"
    placeholder="Thời gian làm bài (phút)"
    value={thoiGian}
    onChange={(e) => setThoiGian(e.target.value)}
  />
  {/* Ngày bắt đầu */}
<div
  className="date-input-wrapper"
  onClick={() => {
    batDauRef.current?.showPicker?.();
    batDauRef.current?.focus?.();
  }}
>
  <span className="calendar-icon">
    <FaCalendarAlt />
  </span>
  {/* Input ẩn dùng date picker */}
  <input
    ref={batDauRef}
    type="datetime-local"
    value={ngayBatDau}
    onChange={(e) => setNgayBatDau(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="input-hidden-date"
  />
  {/* Input hiển thị ngày theo dd/mm/yyyy */}
  <input
  type="text"
  value={formatToDisplayDateTime(ngayBatDau)}
  readOnly
  className="input-date-display"
/>

</div>

{/* Ngày kết thúc */}
<div
  className="date-input-wrapper"
  onClick={() => {
    ketThucRef.current?.showPicker?.();
    ketThucRef.current?.focus?.();
  }}
>
  <span className="calendar-icon">
    <FaCalendarAlt />
  </span>
  <input
    ref={ketThucRef}
    type="datetime-local"
    value={ngayKetThuc}
    onChange={(e) => setNgayKetThuc(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="input-hidden-date"
  />
  <input
  type="text"
  value={formatToDisplayDateTime(ngayKetThuc)}
  readOnly
  className="input-date-display"
/>

</div>



  <label className="switch-wrapper">
  <span>Mở đề thi</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={trangThaiMo}
      onChange={() => setTrangThaiMo(!trangThaiMo)}
    />
    <span className="slider round"></span>
  </label>
</label>

</div>



        {dsCauHoi.map((cauHoi, index) => (
  <div key={index} className="form-cau-hoi">
  <label className="form-label-cau-hoi">
    Câu hỏi {index + 1} <span className="required"></span>
  </label>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <input
      type="text"
      className="input-cau-hoi"
      placeholder="Nhập câu hỏi"
      value={cauHoi.NoiDung}
      onChange={(e) => {
        const updated = [...dsCauHoi];
        updated[index].NoiDung = e.target.value;
        setDsCauHoi(updated);
      }}
      style={{ flex: 1 }}
    />

  <button
    type="button"
    className="delete-btn"
    title="Xóa câu hỏi"
    onClick={() => {
      const updated = dsCauHoi.filter((_, i) => i !== index);
      setDsCauHoi(updated);
    }}
  >
    ×
  </button>
</div>


    {["A", "B", "C", "D"].map((label) => (
      <div key={label} style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px" }}>
        <input
          type="radio"
          name={`dapan-${index}`}
          value={label}
          checked={dsCauHoi[index].DapAnDung === label}
          onChange={() => {
            const updated = [...dsCauHoi];
            updated[index].DapAnDung = label;
            setDsCauHoi(updated);
          }}
        />
        <input
          type="text"
          placeholder={`Phương án ${label}`}
          value={cauHoi.PhuongAn[label]}
          onChange={(e) => {
            const updated = [...dsCauHoi];
            updated[index].PhuongAn[label] = e.target.value;
            setDsCauHoi(updated);
          }}
          style={{ flex: 1 }}
        />
      </div>
    ))}
  </div>
))}

<div style={{ margin: "20px 0" }}>
  <button
    type="button"
    className="btn-them-cau-hoi"
    onClick={() =>
      setDsCauHoi([
        ...dsCauHoi,
        {
          NoiDung: "",
          PhuongAn: { A: "", B: "", C: "", D: "" },
          DapAnDung: "",
        },
      ])
    }
  >
    + Thêm câu hỏi
  </button>
</div>


        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button className="btn-cancel" onClick={() => setShowAddBaiThiForm(false)}>
            Hủy
          </button>
          <button className="btn-save" onClick={handleLuuBaiThi}>
          Lưu
        </button>

        </div>
      </div>
    ) : (
      <>
        {/* Thanh tìm kiếm */}
        <div className="baithi-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm bài thi"
            value={searchBaiThi}
            onChange={(e) => setSearchBaiThi(e.target.value)}
            className="baithi-search-input"
          />
          <button className="btn-baithi-reset" onClick={handleResetBaiThi}>Tất cả kết quả</button>
          <button className="btn-baithi-apply" onClick={handleSearchBaiThi}>Áp dụng</button>
        </div>

        {/* Nút Thêm mới */}
        <div style={{ margin: "12px 0" }}>
          <button
  className="btn-khoi-tao-de"
  onClick={() => {
    // 👉 RESET FORM KHI THÊM MỚI
    setTenBaiThi("");
    setThoiGian("");
    setNgayBatDau("");
    setNgayKetThuc("");
    setTrangThaiMo(true);
    setDsCauHoi(
      Array.from({ length: 5 }, () => ({
        NoiDung: "",
        PhuongAn: { A: "", B: "", C: "", D: "" },
        DapAnDung: "",
      }))
    );
    setIsEditMode(false);
    setEditingAccountId(null);
    setShowAddBaiThiForm(true);
  }}
>
  + Thêm mới
</button>

        </div>

        {/* Danh sách bài thi */}
        {appliedSearchTerm && filteredBaiThiList.length === 0 ? (
          <p style={{ color: "#777", fontStyle: "italic" }}>
            Không tìm thấy bài thi nào phù hợp.
          </p>
        ) : (
          <table className="qlbaithi-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Bài thi</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(appliedSearchTerm ? filteredBaiThiList : baiThiList).map((item, index) => (
                <tr key={item.ID}>
                  <td>{index + 1}</td>
                  <td>{item.TenBaiThi}</td>
                  <td>{item.ThoiGian}</td>
                  <td>{item.TrangThai}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sua-de" onClick={() => handleSuaBaiThi(item.ID)}>Sửa</button>

                      <button className="btn-xoa-de" onClick={() => handleXoaBaiThi(item.ID)}>Xóa</button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    )}
  </div>
)}




          {!showWelcome && activeMenu === "bangxephang" && (
  <div className="qlxephang-wrapper">
    {!selectedBaiThiId ? (
      // BẢNG TỔNG HỢP CHỈ HIỆN KHI CHƯA CHỌN MÔN
      <>
              {/* Thanh tìm kiếm bảng xếp hạng tổng hợp */}
        <div className="xep-hang-search-bar" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
  <input
    type="text"
    placeholder="Tìm kiếm bài thi"
    value={searchXepHang}
    onChange={(e) => setSearchXepHang(e.target.value)}
    className="baithi-search-input"
  />
  <button className="btn-baithi-reset" onClick={handleResetSearchXepHang}>Tất cả kết quả</button>
  <button className="btn-baithi-apply" onClick={handleSearchXepHang}>Áp dụng</button>
</div>


        {tongHopXepHang.length === 0 ? (
          <p>Không có dữ liệu xếp hạng.</p>
        ) : (
          <table className="qlxephang-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Bài thi</th>
                <th>Thời gian</th>
                <th>Điểm trung bình</th>
                <th>Số người tham gia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(appliedSearchXepHangTerm
  ? tongHopXepHang.filter(item =>
      item.TenBaiThi.toLowerCase().includes(appliedSearchXepHangTerm.toLowerCase()))
  : tongHopXepHang
).map((item, index) => (


                <tr key={item.BaiThiID}>
                  <td>{index + 1}</td>
                  <td>{item.TenBaiThi}</td>
                  <td>{item.ThoiGian}</td>
                  <td>{item.DiemTrungBinh}</td>
                  <td>{item.SoNguoiThamGia}</td>
                  <td>
                    <span
                      onClick={() => setSelectedBaiThiId(item.BaiThiID)}
                      style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Xem bảng xếp hạng
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    ) : (
      // BẢNG CHI TIẾT KHI ĐÃ CHỌN MÔN
      <div className="qlxephang-wrapper" style={{ marginTop: "40px" }}>
        <h3>Bảng xếp hạng - {xepHangTitle}</h3>
        <table className="qlxephang-table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Tên người dùng</th>
              <th>Điểm cao nhất</th>
              <th>Thời gian hoàn thành</th>
              <th>Ngày thi</th>
            </tr>
          </thead>
          <tbody>
            {xepHangData.length === 0 ? (
              <tr><td colSpan="5">Không có dữ liệu</td></tr>
            ) : (
              xepHangData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.XepHang}</td>
                  <td>{item.Hoten}</td>
                  <td><strong>{item.Diem}</strong></td>
                  <td>{item.ThoiGian}</td>
                  <td>{item.NgayThi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button className="btn-back" onClick={() => setSelectedBaiThiId(null)}>
  ← Trở lại
</button>

      </div>
    )}
  </div>
)}

          {!showWelcome && activeMenu === "thongke" && (
  <div className="qlthongke-wrapper">
    {!selectedThongKe ? (
      <>
        {/* THANH TÌM KIẾM */}
        <div className="thongke-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm bài thi"
            value={searchThongKe}
            onChange={(e) => setSearchThongKe(e.target.value)}
            className="thongke-search-input"
          />
          <button className="btn-thongke-reset" onClick={() => {
            setSearchThongKe("");
            setAppliedSearchThongKe("");
          }}>Tất cả kết quả</button>
          <button className="btn-thongke-apply" onClick={() => {
            setAppliedSearchThongKe(searchThongKe);
          }}>Áp dụng</button>
        </div>

        {/* BẢNG THỐNG KÊ */}
        <table className="qlthongke-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên bài thi</th>
              <th>Số thí sinh thi</th>
              <th>Điểm TB</th>
              <th>Thời gian TB</th>
            </tr>
          </thead>
          <tbody>
            {filteredThongKeList.map((item, index) => (
              <tr key={item.BaiThiID} onDoubleClick={() => setSelectedThongKe(item)} style={{ cursor: "pointer" }}>
                <td>{index + 1}</td>
                <td>{item.TenBaiThi}</td>
                <td>{item.SoNguoiThamGia}</td>
                <td>{item.DiemTrungBinh ?? "Chưa có"}</td>
                <td>{item.ThoiGianTrungBinh || "Chưa có"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : (
      <div className="thongke-detail">
  <h3>Thống kê chi tiết - {selectedThongKe.TenBaiThi}</h3>

  {/* 3 thẻ thống kê card nằm trong khối riêng */}
  <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
    <div className="stat-card stat-card--purple">
      <p>👨‍🎓 Thí sinh</p>
      <h2>{selectedThongKe.SoNguoiThamGia}</h2>
    </div>
    <div className="stat-card stat-card--yellow">
      <p>📝 Tổng lượt thi</p>
      <h2>{selectedThongKe.SoNguoiThamGia}</h2>
    </div>
    <div className="stat-card stat-card--green">
      <p>✅ Số lượt đậu</p>
      <h2>{thongTinDau}</h2>
    </div>
  </div>

  {/* BIỂU ĐỒ ở dưới các card */}
  <div style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap", marginBottom: "30px" }}>
    {/* Pie Chart - Tỉ lệ đậu/rớt */}
    <div style={{ width: "400px", height: "400px" }}>
  <h4 style={{ textAlign: "center", color: "orange" }}>Tỉ lệ đậu / rớt</h4>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        dataKey="value"
        isAnimationActive={false}
        data={[
          { name: "Đậu", value: thongTinDau },
          { name: "Rớt", value: selectedThongKe.SoNguoiThamGia - thongTinDau }
        ]}
        cx="50%"
        cy="50%"
        outerRadius={120} // ← tăng bán kính
        label
      >
        <Cell fill="#00C49F" />
        <Cell fill="#FF8042" />
      </Pie>
    </PieChart>
  </ResponsiveContainer>
</div>


    {/* Bar Chart - Tổng lượt thi vs đậu */}
    <div style={{ width: "100%", maxWidth: "800px", height: "400px" }}>
  <h4 style={{ textAlign: "center", color: "orange" }}>Phân phối điểm số</h4>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={dataPhanPhoiDiem}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="diem" label={{ value: "Điểm", position: "insideBottom", offset: -5 }} />
      <YAxis
        allowDecimals={false}
        label={{ value: "Số thí sinh", angle: -90, position: "insideLeft" }}
      />
      <Bar dataKey="soLuot" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
</div>

  </div>

  <button className="btn-back" onClick={() => setSelectedThongKe(null)}>
    ← Quay lại
  </button>
</div>



    )}
  </div>
)}




        </section>
      </main>
    </div>
  );
};

export default QuanTri;
