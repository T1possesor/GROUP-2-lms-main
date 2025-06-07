import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useNavigate } from "react-router-dom";
import "./ThiSinh.scss";
import thiSinh1 from "../../assets/ThiSinh1.jpg";
import thiSinh2 from "../../assets/ThiSinh2.jpg";
import logoLogin from "../../assets/logologin.png"; // import logo
import { FaSearch, FaUser } from "react-icons/fa"; // Thêm icon

const ThiSinhPage = () => {
  const { user, setUser } = useContext(Context); // cần có setUser để clear user khi logout
  const navigate = useNavigate();

  // State hiện/ẩn dropdown user
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!user || user.Vaitro !== "ThiSinh") {
      navigate("/");
    }
  }, [user, navigate]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      setUser(null); // Xóa user trong context
      navigate("/login"); // Điều hướng về trang login
    }
  };

  return (
    <div className="thisinh-wrapper">
      {/* HEADER */}
      <div className="topbar full-header">
        <div className="topbar-content">
          <div className="logo-title">
            <img src={logoLogin} alt="Logo" className="logo-img" />
            <span className="system-name">
              <span className="system-title">
                Hệ thống thi trắc nghiệm trực tuyến
              </span>
            </span>
          </div>
          <div
            className="icon-actions"
            ref={userMenuRef}
            style={{ position: "relative" }}
          >
            
            <FaUser
              className="icon icon-user"
              onClick={() => setShowUserMenu((prev) => !prev)}
              style={{ cursor: "pointer" }}
            />
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <ul>
                  {/* Thay alert bằng navigate */}
                  <li onClick={() => {
                    setShowUserMenu(false); // Đóng menu khi chuyển trang
                    navigate("/thong-tin-ca-nhan");
                  }}>
                    Thông tin cá nhân
                  </li>
                  <li onClick={() => {
                  setShowUserMenu(false);
                  navigate("/thong-tin-ca-nhan", { state: { showChangePassword: true } });
                }}>
                  Đổi mật khẩu
                </li>

                  <li onClick={handleLogout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHÀO MỪNG */}
      <>
        {/* Phần nền màu xanh nằm dưới maincard */}
        <div className="background-color-section">
          <header className="thisinh-header">
            <h2>
              Chào mừng, <strong>{user?.Hoten || "Thí sinh"}</strong>
            </h2>
          </header>
        </div>

        {/* Phần nội dung chính (card trắng) */}
        <div className="thisinh-maincard">
          <h3>Hôm nay bạn muốn làm gì?</h3>
          <div className="thisinh-options">
            <div className="option" onClick={() => navigate("/quan-ly-bai-thi")}>

              <img src={thiSinh1} alt="Vào thi" />
              <div className="option-label">
                <span>Vào thi</span>
                <span className="arrow">›</span>
              </div>
            </div>
            <div className="option" onClick={() => navigate("/lich-su-bai-thi")}>

              <img src={thiSinh2} alt="Xem lịch sử thi" />
              <div className="option-label">
                <span>Xem lịch sử thi</span>
                <span className="arrow">›</span>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default ThiSinhPage;
