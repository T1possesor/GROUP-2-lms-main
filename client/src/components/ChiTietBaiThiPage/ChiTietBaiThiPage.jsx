import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChiTietBaiThiPage.scss";
import logoLogin from "../../assets/logologin.png";
import { FaSearch, FaUser, FaCalendarAlt, FaTimesCircle, FaClock, FaQuestionCircle } from "react-icons/fa";

// Hàm format ngày giờ kiểu en-GB
const formatDateTime = (isoString) => {
  if (!isoString || new Date(isoString).getTime() === 0) {
    return "Không xác định";
  }

  const date = new Date(isoString);

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const day = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${time} ${day}`;
};



const ChiTietBaiThiPage = () => {
  const { user } = useContext(Context);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const { id } = useParams();

  const [baiThi, setBaiThi] = useState(null);

  useEffect(() => {
    if (!user || user.Vaitro !== "ThiSinh") {
      navigate("/");
    }
  }, [user, navigate]);
    useEffect(() => {
      function handleClickOutside(event) {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
          setShowUserMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  useEffect(() => {
    const fetchChiTiet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bai-thi/${id}`);
        setBaiThi(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết bài thi:", err);
      }
    };

    fetchChiTiet();
  }, [id]);

  if (!baiThi) {
    return <div className="ctbtp-loading">Đang tải dữ liệu bài thi...</div>;
  }

  return (
    <div className="ctbtp-container">
      {/* HEADER */}
      <header className="ctbtp-header">
        <div className="ctbtp-header-inner">
          <div
            className="ctbtp-logo-area"
            onClick={() => navigate("/ThiSinh")}
            style={{ cursor: "pointer" }}
          >
            <img src={logoLogin} alt="Logo" className="ctbtp-logo-img" />
            <span className="ctbtp-system-name">
              <span className="ctbtp-system-title">
                Hệ thống thi trắc nghiệm trực tuyến
              </span>
            </span>
          </div>

          <div
  className="ctbtp-icon-actions"
  ref={userMenuRef}
  style={{ position: "relative" }}
>
  <FaUser
    className="ctbtp-icon-user"
    onClick={() => setShowUserMenu((prev) => !prev)}
    style={{ cursor: "pointer" }}
  />

  {showUserMenu && (
    <div className="ctbtp-user-menu-dropdown">
      <ul>
        <li onClick={() => {
          setShowUserMenu(false);
          navigate("/thong-tin-ca-nhan", { state: { showChangePassword: false } });
        }}>
          Thông tin cá nhân
        </li>
        <li onClick={() => {
          setShowUserMenu(false);
          navigate("/thong-tin-ca-nhan", { state: { showChangePassword: true } });
        }}>
          Đổi mật khẩu
        </li>
        <li onClick={() => {
          setShowUserMenu(false);
          localStorage.removeItem("user");
          navigate("/login");
        }}>
          Đăng xuất
        </li>
      </ul>
    </div>
  )}
</div>

        </div>
      </header>

      {/* WELCOME / NAV */}
      <div className="ctbtp-welcome-bg">
  <div className="ctbtp-breadcrumb-wrapper">
    <nav className="ctbtp-breadcrumb">
      <span className="ctbtp-breadcrumb-item" onClick={() => navigate("/ThiSinh")}>
        Trang chủ
      </span>

      <span className="ctbtp-breadcrumb-separator">{">"}</span>
      <span className="ctbtp-breadcrumb-item" onClick={() => navigate("/quan-ly-bai-thi")}>
        Quản lý bài thi
      </span>
      <span className="ctbtp-breadcrumb-separator">{">"}</span>
      <span className="ctbtp-breadcrumb-item active">Chi tiết bài thi</span>
    </nav>
    <button className="ctbtp-back-button" onClick={() => navigate(-1)}>
      ← Quay lại
    </button>
  </div>
</div>

{/* Đưa h2 ra ngoài */}
<h2 className="ctbtp-main-title">{baiThi.TenBaiThi}</h2>


      {/* MAIN CONTENT */}
      <main className="ctbtp-main-card">
        <div className="ctbtp-test-details">
          <p>
            <FaCalendarAlt className="ctbtp-icon" />
            <strong> Ngày mở (Opened):</strong> {formatDateTime(baiThi.NgayBatDau)}
          </p>
          <p>
            <FaTimesCircle className="ctbtp-icon" />
            <strong> Ngày đóng (Closes):</strong> {formatDateTime(baiThi.NgayKetThuc)}
          </p>
          <p>
            <FaClock className="ctbtp-icon" />
            Thời gian làm bài: {baiThi.ThoiGian}
          </p>
          <p>
            <FaQuestionCircle className="ctbtp-icon" />
            Số lượng câu hỏi: {baiThi.CauHoi?.length || 0} câu
          </p>
        </div>

        <button
  className="ctbtp-start-btn"
  disabled={baiThi.TrangThai !== "Đã mở"}
  onClick={() => {
    const confirmStart = window.confirm("Bạn có chắc chắn muốn bắt đầu làm bài thi này không?");
    if (confirmStart) {
      navigate(`/lam-bai/${baiThi.ID}`);
    }
  }}
>
  Vào thi
</button>



      </main>
    </div>
  );
};

export default ChiTietBaiThiPage;
