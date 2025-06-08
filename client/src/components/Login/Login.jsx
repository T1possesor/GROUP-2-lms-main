import React, { useState, useEffect, useContext } from "react";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Context } from "../../utils/context";
import "./Login.scss";
import logoLogin from "../../assets/logologin.png";
import personImage from "../../assets/person.png";

import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useRef } from "react";
import { SiGmail } from "react-icons/si";



const Login = ({ setShowLogin }) => {
    const navigate = useNavigate();
    const { setUser } = useContext(Context);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false); // ⬅ điều khiển animation
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dateInputRef = useRef(null);
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState(null);




    


    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "visible";
        };
    }, []);

    const handleLogin = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Đăng nhập thất bại");
        }

        const user = data.user;
        console.log("✅ Dữ liệu user nhận về:", user);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        // 👉 Điều hướng chỉ theo 2 vai trò
        if (user.Vaitro === 'QuanTri') {
            navigate("/QuanTri");
        } else if (user.Vaitro === 'ThiSinh') {
            navigate("/ThiSinh");
        } else {
            alert("❌ Vai trò không hợp lệ");
        }
    } catch (error) {
        console.error("Login error:", error);
        setError(error.message);
    }
};

const formatDateDisplay = (isoDate) => {
  if (!isoDate) return "";
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

    const handleRegister = async () => {
  // Kiểm tra nếu Email không chứa "@"
  if (!email.includes('@')) {
    alert("⚠️ Email thiếu @");
    return; // Dừng quá trình đăng ký
  }

  // Kiểm tra nếu Họ và Tên chứa số
  const namePattern = /[0-9]/;
  if (namePattern.test(fullname)) {
    alert("⚠️ Họ và tên không được chứa số.");
    return; // Dừng quá trình đăng ký
  }

  // Kiểm tra số điện thoại có đúng 10 chữ số không
  const phonePattern = /^[0-9]{10}$/; // Kiểm tra số điện thoại có đúng 10 chữ số
  if (!phonePattern.test(phone)) {
    alert("⚠️ Số điện thoại phải có đúng 10 chữ số.");
    return; // Dừng quá trình đăng ký
  }

  try {
    // Kiểm tra tên đăng nhập có tồn tại không
    const usernameCheckRes = await fetch("http://localhost:5000/api/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername })
    });

    const usernameCheckData = await usernameCheckRes.json();
    if (!usernameCheckRes.ok || !usernameCheckData.success) {
      alert(usernameCheckData.message); // Hiển thị thông báo lỗi từ API
      return; // Dừng quá trình đăng ký
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      alert("❌ Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hoten: fullname,
        email,
        ngaysinh: birthdate,
        sodienthoai: phone,
        diachi: address,
        tendangnhap: newUsername,
        matkhau: newPassword
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (data.message === "Email đã được đăng ký") {
        alert("⚠️ Email này đã tồn tại trong hệ thống.");
      } else if (data.message === "Tên đăng nhập đã tồn tại") {
        alert("⚠️ Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.");
      } else {
        throw new Error(data.message || "Đăng ký thất bại");
      }
      return;
    }

    alert("✅ Đăng ký thành công!");

    // Reset lại form
    setFullname("");
    setEmail("");
    setBirthdate("");
    setPhone("");
    setAddress("");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsRegistering(false);
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    alert("Đăng ký thất bại: " + err.message);
  }
};












   return (
    <div className={`login-page ${isRegistering ? "move-image" : ""}`}>

        <div className="login-left">
  <div className="login-wrapper">
    {/* Ẩn logo khi đang ở chế độ đăng ký */}
    {!isRegistering && (
      <div className="logo">
        <img src={logoLogin} alt="QuizPro" />
      </div>
    )}

    {/* Ẩn form đăng nhập khi đang ở chế độ đăng ký */}
    {!isRegistering && (
      <form>
        <div className="form-group">
          <label className="field-label">Tài khoản</label>
          <div className="input-box">
            <span className="icon-left">
              <FaUser />
            </span>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="field-label">Mật khẩu</label>
          <div className="input-box">
            <span className="icon-left">
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="button" onClick={handleLogin}>
          Đăng nhập
        </button>

        <div className="register-link">
          <p>
            Chưa có tài khoản?{" "}
            <span onClick={() => setIsRegistering(true)} className="switch-link">
              Đăng ký
            </span>
          </p>
        </div>

        {/* Hình ảnh vẫn hiển thị trong mọi chế độ */}
        
      </form>
    )}
    <img src={personImage} alt="Person" className="person-absolute" />
  </div>
</div>

        <div className="login-right">
  <div className="color-box" />
  {isRegistering && (
    <div className="register-form-container">
      <div className="register-form">
        <div className="register-logo">
          <img src={logoLogin} alt="Logo" />
        </div>
        <h2>Đăng ký</h2>
        <form className="register-grid-form">
          <div className="form-group">
            <label>Họ và Tên <span style={{ color: "red" }}>(*)</span></label>
            <div className="input-box">
              <FaUser />
              <input type="text" placeholder="Họ và Tên" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-box">
                <span className="icon-left"><SiGmail /></span>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-gmail" // class riêng cho email
                />
            </div>
            </div>


          <div className="form-group">
  <label>Ngày sinh <span style={{ color: "red" }}>(*)</span></label>
  <div
    className="input-box"
    onClick={() => {
      if (dateInputRef.current) {
        dateInputRef.current.showPicker?.();
        dateInputRef.current.focus();
      }
    }}
    style={{ cursor: "pointer" }}
  >
    <span className="icon-left"><FaCalendarAlt /></span>

    {/* Input hiển thị định dạng dd/mm/yyyy */}
    <input
      type="text"
      value={formatDateDisplay(birthdate)}
      readOnly
      className="input-ngay-sinh"
      placeholder="dd/mm/yyyy"
    />

    {/* Input ẩn để chọn ngày đúng format yyyy-mm-dd */}
    <input
      ref={dateInputRef}
      type="date"
      value={birthdate}
      onChange={(e) => setBirthdate(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
    />
  </div>
</div>


          <div className="form-group">
            <label>Số điện thoại <span style={{ color: "red" }}>(*)</span></label>
            <div className="input-box">
              <span className="icon-left"><FaPhoneAlt /></span>
              <input
                type="tel"
                className="input-so-dien-thoai"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <div className="input-box">
              <span className="icon-left"><FaMapMarkerAlt /></span>
              <input
                type="text"
                className="input-dia-chi"
                placeholder="Nhập địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                />
            </div>
          </div>

          <div className="form-group full-row">
  <label>
    Tên đăng nhập <span style={{ color: "red" }}>(*)</span>
  </label>
  <div className="input-box">
    <FaUser />
    <input
      type="text"
      placeholder="Username"
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
      required
    />
  </div>
</div>

<div className="form-group">
  <label>
    Mật khẩu <span style={{ color: "red" }}>(*)</span>
  </label>
  <div className="input-box">
    <FaLock />
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Mật khẩu"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
    />
    <span
      className="eye-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

<div className="form-group">
  <label>
    Xác nhận mật khẩu <span style={{ color: "red" }}>(*)</span>
  </label>
  <div className="input-box">
    <FaLock />
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Xác nhận mật khẩu"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    <span
      className="eye-icon"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

        </form>

        <div className="form-action-buttons">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setIsRegistering(false)}
          >
            Hủy
          </button>
          <button type="button" className="btn-submit" onClick={handleRegister}>
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  )}
</div>




    </div>
    
);

};

export default Login;
