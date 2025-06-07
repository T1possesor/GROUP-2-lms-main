import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useNavigate } from "react-router-dom";
import logoLogin from "../../assets/logologin.png";
import { FaSearch, FaUser } from "react-icons/fa";
import axios from "axios";
import "./LichSuBaiThiPage.scss";

const LichSuBaiThiPage = () => {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [lichSuList, setLichSuList] = useState([]);
  const lastName = user?.Hoten?.trim().split(" ").slice(-1)[0] || "";
  const userMenuRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;


  
  useEffect(() => {
    if (!user || user.Vaitro !== "ThiSinh") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowSearchInput(false);
      }
    };
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

  useEffect(() => {
    const fetchLichSu = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/lich-su-thi/${user.ID}`);
        setLichSuList(res.data.data);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử bài thi:", err);
      }
    };

    if (user?.ID) {
      fetchLichSu();
    }
  }, [user]);

  const filteredList = lichSuList.filter((item) =>
  item.TenBaiThi.toLowerCase().includes(searchKeyword.toLowerCase())
);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedList = filteredList.slice(startIndex, endIndex);

  return (
    <div className="lsbtp-container">
      <header className="lsbtp-header">
        <div className="lsbtp-header-inner">
          <div className="lsbtp-logo-area" onClick={() => navigate("/ThiSinh")} style={{ cursor: "pointer" }}>

            <img src={logoLogin} alt="Logo" className="lsbtp-logo-img" />
            <span className="lsbtp-system-name">
              <span className="lsbtp-system-title">Hệ thống thi trắc nghiệm trực tuyến</span>
            </span>
          </div>
          <div className="lsbtp-icon-actions" ref={userMenuRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {showSearchInput && (
              <input
                type="text"
                className="lsbtp-search-input"
                placeholder="Tìm kiếm bài thi..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                autoFocus
              />
            )}
            <FaUser
              className="lsbtp-icon-user"
              onClick={() => setShowUserMenu((prev) => !prev)}
              style={{ marginLeft: 10 }}
            />
            {showUserMenu && (
              <div className="lsbtp-user-menu-dropdown">
                <ul>
                  <li onClick={() => navigate("/thong-tin-ca-nhan")}>Thông tin cá nhân</li>
                  <li
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/thong-tin-ca-nhan", { state: { showChangePassword: true } });
                  }}
                >
                  Đổi mật khẩu
                </li>

                  <li onClick={handleLogout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="lsbtp-welcome-bg">
        <div className="lsbtp-breadcrumb-wrapper">
          <nav className="lsbtp-breadcrumb">
            <span className="lsbtp-breadcrumb-item" onClick={() => navigate("/ThiSinh")}>Trang chủ</span>
            <span className="lsbtp-breadcrumb-separator">{">"}</span>
            <span className="lsbtp-breadcrumb-item active">Lịch sử bài thi</span>
          </nav>
          
        </div>
        <h2 className="lsbtp-main-title">
  Lịch sử thi của <span style={{ color: "#ff7a00" }}>{lastName}</span>
</h2>

      </div>

      {/* ✅ Khung bao quanh cả filter + table */}
      <div className="lsbtp-card-wrapper">
        <div className="lsbtp-filter-container">
          <input
  type="text"
  className="lsbtp-filter-input"
  placeholder="Tìm kiếm bài thi"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
/>
<button
  className="lsbtp-filter-btn"
  onClick={() => setSearchKeyword(searchInput.trim())}
>
  Áp dụng
</button>

          <button
  className="lsbtp-filter-reset-btn"
  onClick={() => {
    setSearchInput("");
    setSearchKeyword("");
  }}
>
  Tất cả kết quả
</button>

        </div>

        <main className="lsbtp-main-card">
          <table className="baiThi-table">
            <thead>
              <tr>
                <th>TÊN BÀI THI</th>
                <th>THỜI GIAN THI</th>
                <th>ĐIỂM THI<br />CAO NHẤT</th>
                <th>SỐ &nbsp; LẦN THI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
  <tr><td colSpan="5">Không có lịch sử thi</td></tr>
) : (
  paginatedList.map((item, index) => (
    <tr key={index}>
      <td>{item.TenBaiThi}</td>
      <td>{item.ThoiGianThiGanNhat}</td>
      <td><strong>{item.DiemCaoNhat}</strong></td>
      <td>{item.SoLanThi}</td>
      <td>
        <span
  onClick={() => navigate(`/xep-hang/${item.BaiThiID}`)}
  style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
>
  Xem bảng xếp hạng
</span>

      </td>
    </tr>
  ))
)}

            </tbody>
          </table>
          <div className="pagination">
  <button
    onClick={() => setCurrentPage(1)}
    disabled={currentPage === 1}
  >
    &#171;
  </button>
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    &#8249;
  </button>

  {Array.from({ length: Math.ceil(filteredList.length / itemsPerPage) }, (_, i) => (
    <button
      key={i}
      className={currentPage === i + 1 ? "active" : ""}
      onClick={() => setCurrentPage(i + 1)}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredList.length / itemsPerPage)))}
    disabled={currentPage === Math.ceil(filteredList.length / itemsPerPage)}
  >
    &#8250;
  </button>
  <button
    onClick={() => setCurrentPage(Math.ceil(filteredList.length / itemsPerPage))}
    disabled={currentPage === Math.ceil(filteredList.length / itemsPerPage)}
  >
    &#187;
  </button>
</div>


        </main>
      </div>
    </div>
  );
};

export default LichSuBaiThiPage;
