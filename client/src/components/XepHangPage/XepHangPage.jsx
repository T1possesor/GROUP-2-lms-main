import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logoLogin from "../../assets/logologin.png";
import { FaSearch, FaUser } from "react-icons/fa";
import axios from "axios";
import { Context } from "../../utils/context";
import "./XepHangPage.scss";

const XepHangPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(Context);

  const [xepHang, setXepHang] = useState([]);
  const [tenBaiThi, setTenBaiThi] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [userRank, setUserRank] = useState(null);
const [userScore, setUserScore] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/xep-hang/${id}`);
      const rawData = res.data.data;
const rankedData = [];
let currentRank = 1;
let prevScore = null;
let rankCounter = 1;

rawData.forEach((item, index) => {
  if (prevScore !== null && item.Diem < prevScore) {
    currentRank = rankCounter;
  }
  rankedData.push({ ...item, XepHang: currentRank });
  prevScore = item.Diem;
  rankCounter++;
});

setXepHang(rankedData);

// Gán hạng và điểm cho người dùng hiện tại
const yourItem = rankedData.find(item => item.TaiKhoanID === user.ID);
if (yourItem) {
  setUserRank(yourItem.XepHang);
  setUserScore(yourItem.Diem);
}

      setTenBaiThi(res.data.tenBaiThi);

      // ✅ Đây là chỗ đúng
      const yourIndex = res.data.data.findIndex(item => item.TaiKhoanID === user.ID);
      if (yourIndex !== -1) {
        setUserRank(yourIndex + 1);
        setUserScore(res.data.data[yourIndex].Diem);
      }

    } catch (err) {
      console.error("Lỗi tải bảng xếp hạng:", err);
    }
  };
  fetchData();
}, [id, user]);




  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <div className="xhp-container">
      <header className="xhp-header">
        <div className="xhp-header-inner">
          <div
            className="xhp-logo-area"
            onClick={() => navigate("/ThiSinh")}
            style={{ cursor: "pointer" }}
          >
            <img src={logoLogin} alt="Logo" className="xhp-logo-img" />
            <span className="xhp-system-name">
              <span className="xhp-system-title">Hệ thống thi trắc nghiệm trực tuyến</span>
            </span>
          </div>

          <div className="xhp-icon-actions" ref={userMenuRef}>
            <FaUser
              className="xhp-icon-user"
              onClick={() => setShowUserMenu((prev) => !prev)}
            />
            {showUserMenu && (
              <div className="xhp-user-menu-dropdown">
                <ul>
                  <li onClick={() => navigate("/thong-tin-ca-nhan")}>Thông tin cá nhân</li>
                  <li onClick={() => navigate("/thong-tin-ca-nhan", { state: { showChangePassword: true } })}>
                  Đổi mật khẩu
                </li>
                  <li onClick={handleLogout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="xhp-welcome-bg">
        <div className="xhp-breadcrumb-wrapper">
          <nav className="xhp-breadcrumb">
          <span className="xhp-breadcrumb-item" onClick={() => navigate("/ThiSinh")}>
            Trang chủ
          </span>
          <span className="xhp-breadcrumb-separator">{">"}</span>
          <span className="xhp-breadcrumb-item" onClick={() => navigate("/lich-su-bai-thi")}>
            Xem lịch sử thi
          </span>
          <span className="xhp-breadcrumb-separator">{">"}</span>
          <span className="xhp-breadcrumb-item active">Xem bảng xếp hạng</span>
        </nav>

        </div>
        <h2 className="xhp-main-title">
          Bảng xếp hạng - <span className="xhp-ten-bai-thi">{tenBaiThi}</span>
        </h2>


      </div>

      <div className="xhp-card-wrapper">
        {userRank && (
  <div className="xhp-user-rank">
    <div>
      <strong>Xếp hạng của bạn:</strong> <span className="xhp-rank-number">#{userRank}</span>
    </div>
    <div>
      <strong>Điểm:</strong> <span className="xhp-score">{userScore}/10</span>
    </div>
  </div>
)}

        <table className="xhp-table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Tên người dùng</th>
              <th>Điểm cao nhất</th>
            <th>Thời gian hoàn thành</th>
            <th>Ngày thi</th> {/* ✅ thêm cột này */}

            </tr>
          </thead>
          <tbody>
            {xepHang.length === 0 ? (
              <tr><td colSpan="5">Không có dữ liệu</td></tr>
            ) : (
              xepHang.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.XepHang}</td>

                  <td>{item.Hoten}</td>
                  <td><strong>{item.Diem}</strong></td>
                <td>{item.ThoiGian}</td>
                <td>{item.NgayThi}</td> {/* ✅ thêm dòng này */}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default XepHangPage;
