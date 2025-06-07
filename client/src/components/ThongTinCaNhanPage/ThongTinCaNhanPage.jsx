import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../utils/context";
import { useNavigate } from "react-router-dom";
import logoLogin from "../../assets/logologin.png";
import { FaSearch, FaUser, FaUserCircle, FaLock, FaPen, FaEye, FaEyeSlash } from "react-icons/fa";
import "./ThongTinCaNhanPage.scss";
import axios from "axios";
import { useLocation } from "react-router-dom";

const ThongTinCaNhanPage = () => {
  const convertISOToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const convertDDMMYYYYToISO = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  const [showPassword, setShowPassword] = useState(false); // Hiển thị mật khẩu
  const [currentPassword, setCurrentPassword] = useState(""); // Mật khẩu hiện tại
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
const [showChangePasswordForm, setShowChangePasswordForm] = useState(
  location.state?.showChangePassword || false
);
// Hiển thị form đổi mật khẩu

  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State lưu avatar URL
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Lấy ảnh avatar từ API khi component mount hoặc user thay đổi
  useEffect(() => {
    let isMounted = true;
    let url = null;

    if (user?.ID) {
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
    }

    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [user]);

  useEffect(() => {
    if (user?.ID) {
      axios
        .get(`http://localhost:5000/api/users/password/${user.ID}`)
        .then((response) => {
          if (response.data.success) {
            
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy mật khẩu:", error);
        });
    }
  }, [user]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [formData, setFormData] = useState({
    hoten: user?.Hoten || "",
    email: user?.Email || "",
    ngaysinh: convertISOToDDMMYYYY(user?.Ngaysinh || ""),
    sodienthoai: user?.Sodienthoai || "",
    diachi: user?.Diachi || "",
  });

  useEffect(() => {
  if (!user) {
    navigate("/login");
  }
  }, [user, navigate]);


  const handleLogout = () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      setUser(null);
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  // Kiểm tra nếu mật khẩu mới và mật khẩu xác nhận không trùng khớp
  if (newPassword && newPassword !== confirmPassword) {
    alert("Mật khẩu mới và mật khẩu xác nhận không khớp.");
    return;
  }

  try {
    const ngaysinhISO = convertDDMMYYYYToISO(formData.ngaysinh);

    const formDataToSend = new FormData();
    formDataToSend.append("hoten", formData.hoten);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("ngaysinh", ngaysinhISO);
    formDataToSend.append("sodienthoai", formData.sodienthoai);
    formDataToSend.append("diachi", formData.diachi);

    if (selectedFile) {
      formDataToSend.append("profileImage", selectedFile);
    }

    // Nếu có mật khẩu mới thì gửi API cập nhật mật khẩu
    if (newPassword) {
      await axios.put(`http://localhost:5000/api/users/update-password/${user.ID}`, {
        currentPassword,
        newPassword,
      });
      alert("Mật khẩu đã được cập nhật thành công");
    }

    // Gửi yêu cầu cập nhật thông tin người dùng
    const res = await axios.put(`http://localhost:5000/api/users/${user.ID}`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert(res.data.message || "Cập nhật thông tin thành công");

    setSelectedFile(null);

    // Cập nhật lại context user với thông tin mới (chưa bao gồm ảnh, vì ảnh là blob)
    setUser(prevUser => ({
      ...prevUser,
      Hoten: formData.hoten,
      Email: formData.email,
      Ngaysinh: ngaysinhISO,
      Sodienthoai: formData.sodienthoai,
      Diachi: formData.diachi,
    }));

    // Cập nhật lại formData hiển thị (giữ định dạng ngày dd/mm/yyyy)
    setFormData(prev => ({
      ...prev,
      ngaysinh: formData.ngaysinh,
    }));

    // **Reset mật khẩu sau khi lưu thành công**
    setCurrentPassword("");  // Đặt lại ô mật khẩu hiện tại thành rỗng
    setNewPassword("");      // Đặt lại ô mật khẩu mới thành rỗng
    setConfirmPassword("");  // Đặt lại ô xác nhận mật khẩu thành rỗng

  } catch (error) {
    console.error("Lỗi khi lưu thông tin:", error);
    alert("Mật khẩu nhập sai, xin vui lòng thử lại");
  }
};


  return (
    <div className="ttcn-wrapper">
      {/* HEADER */}
      <div className="ttcn-topbar full-header">
        <div className="ttcn-topbar-content">
          <div className="ttcn-logo-title">
            <img src={logoLogin} alt="Logo" className="ttcn-logo-img" />
            <span className="ttcn-system-name">
              <span className="ttcn-system-title">
                Hệ thống thi trắc nghiệm trực tuyến
              </span>
            </span>
          </div>
          <div className="ttcn-icon-actions" ref={userMenuRef} style={{ position: "relative" }}>
            
            <FaUser
              className="ttcn-icon ttcn-icon-user"
              onClick={() => setShowUserMenu((prev) => !prev)}
              style={{ cursor: "pointer" }}
            />
            {showUserMenu && (
              <div className="ttcn-user-dropdown-menu">
                <ul>
                  <li onClick={() => { setShowUserMenu(false); navigate("/thong-tin-ca-nhan"); }}>Thông tin cá nhân</li>
                  <li onClick={() => setShowChangePasswordForm(true)}>Đổi mật khẩu</li>
                  <li onClick={handleLogout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NỀN XANH DƯỚI HEADER */}
      <div className="ttcn-background-color-section" />

      {/* MAIN CONTENT */}
      <div className="ttcn-main-content">
        {/* Sidebar */}
        <aside className="ttcn-sidebar">
          <div className="ttcn-profile-pic" style={{ position: "relative" }}>
            <img
              src={selectedFile ? URL.createObjectURL(selectedFile) : avatarUrl || "https://i.pravatar.cc/150?img=12"}
              alt="User avatar"
              className="ttcn-avatar"
            />
            {/* Ẩn input file */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              style={{ display: "none" }}
            />
            {/* Nút icon cây bút để chọn ảnh */}
            <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()} title="Chọn ảnh đại diện">
              <FaPen />
            </button>
            <div className="ttcn-name-job">
              <h3>{user?.Hoten || "Thí sinh"}</h3>
            </div>
          </div>

          <nav className="ttcn-sidebar-menu">
  <ul>
    <li className={showChangePasswordForm ? "" : "active"} onClick={() => setShowChangePasswordForm(false)}>
      <FaUser className="icon-menu" /> Thông tin cá nhân
    </li>
    <li className={showChangePasswordForm ? "active" : ""} onClick={() => setShowChangePasswordForm(true)}>
      <FaLock className="icon-menu" /> Đổi mật khẩu
    </li>
  </ul>
</nav>

        </aside>

        {/* Form Thông tin cá nhân */}
        <section className="ttcn-form-section">
  <h2>{showChangePasswordForm ? "Đổi mật khẩu" : "Thông tin cá nhân"}</h2>
  <form>
    {showChangePasswordForm ? (
      <>
        {/* Form đổi mật khẩu */}
        <div className="ttcn-row">
  <div className="ttcn-col">
    <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
    <input
      type="password" // Dùng "password" để ẩn các ký tự
      id="currentPassword"
      name="currentPassword"
      placeholder="Nhập mật khẩu hiện tại"
      value={currentPassword} // Ô này sẽ trống khi chưa có giá trị mật khẩu
      onChange={(e) => setCurrentPassword(e.target.value)} // Lưu giá trị người dùng nhập
    />
   
  </div>



          <div className="ttcn-col">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="ttcn-col">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </>
    ) : (
      <>
        {/* Form thông tin cá nhân */}
        <div className="ttcn-row">
          <div className="ttcn-col">
            <label htmlFor="hoten">
              Họ và Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="hoten"
              name="hoten"
              placeholder="Họ và Tên"
              value={formData.hoten}
              onChange={handleChange}
            />
          </div>
          <div className="ttcn-col">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="ttcn-row">
          <div className="ttcn-col">
            <label htmlFor="ngaysinh">
              Ngày sinh <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ngaysinh"
              name="ngaysinh"
              placeholder="dd/mm/yyyy"
              value={formData.ngaysinh}
              onChange={handleChange}
            />
          </div>
          <div className="ttcn-col">
            <label htmlFor="sodienthoai">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="sodienthoai"
              name="sodienthoai"
              placeholder="Nhập số điện thoại"
              value={formData.sodienthoai}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="ttcn-row">
          <div className="ttcn-col">
            <label htmlFor="diachi">Địa chỉ</label>
            <input
              type="text"
              id="diachi"
              name="diachi"
              placeholder="Nhập địa chỉ"
              value={formData.diachi}
              onChange={handleChange}
            />
          </div>
        </div>
      </>
    )}
    <div className="ttcn-form-actions">
      <button
        type="button"
        className="ttcn-btn-cancel"
        onClick={() => navigate(-1)}
      >
        Hủy
      </button>
      <button
        type="button"
        className="ttcn-btn-save"
        onClick={handleSave}
      >
        Lưu thay đổi
      </button>
    </div>
  </form>
</section>

      </div>
    </div>
  );
};

export default ThongTinCaNhanPage;
