import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuanLyBaiThiPage.scss";
import logoLogin from "../../assets/logologin.png";
import { FaSearch, FaUser } from "react-icons/fa";

const QuanLyBaiThiPage = () => {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [baiThiList, setBaiThiList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    if (!user || user.Vaitro !== "ThiSinh") {
      navigate("/");
    }
  }, [user, navigate]);

  // Gọi API lấy danh sách bài thi
  useEffect(() => {
    const fetchBaiThi = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/bai-thi");
        setBaiThiList(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi:", error);
      }
    };
    fetchBaiThi();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
        setShowSearchInput(false); // Ẩn ô tìm kiếm khi click ra ngoài
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      setUser(null);
      navigate("/login");
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm (không phân biệt hoa thường)
  const filteredBaiThiList = baiThiList.filter((baiThi) =>
    baiThi.TenBaiThi.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="qlbtp-container">
      {/* HEADER */}
      <header className="qlbtp-header">
        <div className="qlbtp-header-inner">
          <div
            className="qlbtp-logo-area"
            onClick={() => navigate("/ThiSinh")}
            style={{ cursor: "pointer" }}
          >
            <img src={logoLogin} alt="Logo" className="qlbtp-logo-img" />
            <span className="qlbtp-system-name">
              <span className="qlbtp-system-title">
                Hệ thống thi trắc nghiệm trực tuyến
              </span>
            </span>
          </div>

          <div
            className="qlbtp-icon-actions"
            ref={userMenuRef}
            style={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            {/* Icon tìm kiếm */}
            <FaSearch
              className="qlbtp-icon-search"
              style={{ cursor: "pointer" }}
              onClick={() => setShowSearchInput((prev) => !prev)}
            />
            
            {/* Input tìm kiếm hiện/ẩn */}
            {showSearchInput && (
              <input
                type="text"
                className="qlbtp-search-input"
                placeholder="Tìm kiếm bài thi..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                autoFocus
              />
            )}

            {/* Icon user */}
            <FaUser
              className="qlbtp-icon-user"
              onClick={() => setShowUserMenu((prev) => !prev)}
              style={{ cursor: "pointer", marginLeft: 10 }}
            />
            {showUserMenu && (
              <div className="qlbtp-user-menu-dropdown">
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
                <li onClick={handleLogout}>Đăng xuất</li>
              </ul>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* WELCOME */}
      <div className="qlbtp-welcome-bg">
        <div className="qlbtp-breadcrumb-wrapper">
          <nav className="qlbtp-breadcrumb">
            <span className="qlbtp-breadcrumb-item" onClick={() => navigate("/ThiSinh")}>
              Trang chủ
            </span>

            <span className="qlbtp-breadcrumb-separator">{">"}</span>
            <span className="qlbtp-breadcrumb-item active">Quản lý bài thi</span>
          </nav>
          <button className="qlbtp-back-button" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>
        <h2 className="qlbtp-main-title">Quản lý bài thi : Tất cả bài thi</h2>
      </div>

      {/* MAIN CONTENT - BẢNG BÀI THI */}
      <main className="qlbtp-main-card">
        <table className="baiThi-table">
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
            {filteredBaiThiList.length === 0 && (
              <tr><td colSpan="5">Không có dữ liệu bài thi</td></tr>
            )}
            {filteredBaiThiList.map((baiThi, index) => (
              <tr key={baiThi.ID}>
                <td>{index + 1}</td>
                <td>{baiThi.TenBaiThi}</td>
                <td>{baiThi.ThoiGian}</td>
                <td>{baiThi.TrangThai}</td>
                <td>
                  <button
                    disabled={baiThi.TrangThai === "Đã đóng"}
                    onClick={() => navigate(`/chi-tiet-bai-thi/${baiThi.ID}`)}

                    className={
                      baiThi.TrangThai === "Đã đóng" ? "btn-disabled" : "btn-active"
                    }
                  >
                    Vào thi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default QuanLyBaiThiPage;
