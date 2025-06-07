import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../utils/context";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LamBaiThiPage.scss";
import logoLogin from "../../assets/logologin.png";
import {
  FaSearch,
  FaUser,
} from "react-icons/fa";

const LamBaiThiPage = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const { id } = useParams();
  const [baiThi, setBaiThi] = useState(null);
  const [dapAn, setDapAn] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
const [timeLeft, setTimeLeft] = useState(null); 
const [baiLamId, setBaiLamId] = useState(null);
  useEffect(() => {
    if (!user || user.Vaitro !== "ThiSinh") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchChiTiet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bai-thi/${id}`);
        setBaiThi(res.data);
        const thoiGianStr = res.data.ThoiGian;
let totalSeconds = 0;

const phutMatch = thoiGianStr.match(/(\d+)\s*phút/);
const giayMatch = thoiGianStr.match(/(\d+)\s*giây/);

if (phutMatch) totalSeconds += parseInt(phutMatch[1]) * 60;
if (giayMatch) totalSeconds += parseInt(giayMatch[1]);

setTimeLeft(totalSeconds);

setTimeLeft(totalSeconds);
const taoBaiLamRes = await axios.post("http://localhost:5000/api/bai-lam/create", {
  TaiKhoanID: user.ID,
  BaiThiID: id
});
setBaiLamId(taoBaiLamRes.data.BaiLamID);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết bài thi:", err);
      }
    };
    fetchChiTiet();
  }, [id]);
useEffect(() => {
  if (timeLeft === null) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        alert("Hết thời gian! Bài sẽ được nộp.");
        submitBaiLam();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft]);

 const handleChonDapAn = (index, value) => {
  setDapAn((prev) => ({
    ...prev,
    [index]: prev[index] === value ? null : value, // Nếu đã chọn → bỏ chọn
  }));
};


  const [flaggedQuestions, setFlaggedQuestions] = useState({});
const toggleFlag = (index) => {
  setFlaggedQuestions((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));
};
const submitBaiLam = async () => {
  if (!baiLamId) return alert("Không có ID bài làm!");

  const danhSachTraLoi = baiThi.CauHoi.map((cauHoi, index) => {
    const selected = dapAn[index];
    if (!selected) return null;

    const phuongAnChon = cauHoi.PhuongAn.find(p => p.PhanLoai === selected);
    return {
      CauHoiID: cauHoi.ID,
      PhuongAnChonID: phuongAnChon?.ID
    };
  }).filter(Boolean);

  let diem = 0;

  // 🛠 Chấm điểm bằng cách gọi API mới của bạn
  for (const item of danhSachTraLoi) {
    try {
      const res = await axios.get(`http://localhost:5000/api/phuong-an/${item.PhuongAnChonID}`);
      if (res.data.LaDapAnDung === 1 || res.data.LaDapAnDung === true) diem++;
    } catch (err) {
      console.error(`❌ Không kiểm tra được đáp án cho PhuongAnID = ${item.PhuongAnChonID}`, err);
    }
  }

  const totalQuestions = baiThi.CauHoi.length;
  const finalDiem = ((diem / totalQuestions) * 10).toFixed(2);

  try {
    await axios.post(`http://localhost:5000/api/bai-lam/${baiLamId}/submit`, {
      danhSachTraLoi
    });

    await axios.put(`http://localhost:5000/api/bai-lam/${baiLamId}/diem`, {
      Diem: finalDiem
    });

    alert(`✅ Bạn đã nộp bài thành công!\n🎯 Điểm: ${finalDiem}/10`);
    navigate("/ThiSinh");
  } catch (err) {
    console.error("❌ Lỗi khi nộp bài:", err);
    alert("Lỗi khi nộp bài. Vui lòng thử lại.");
  }
};




  const handleNopBai = () => {
  const confirmSubmit = window.confirm("Bạn chắc chắn muốn nộp bài?");
  if (!confirmSubmit) return;

  submitBaiLam(); // chỉ gọi đúng 1 lần
};



  if (!baiThi) return <div className="lbp-loading">Đang tải dữ liệu bài thi...</div>;

  const cauHoi = baiThi.CauHoi[currentIndex];

  return (
  <div className="lbp-container">
    <header className="lbp-header">
      <div className="lbp-header-inner">
        <div className="lbp-logo-area">
          <img src={logoLogin} alt="Logo" className="lbp-logo-img" />
          <span className="lbp-system-name">
            <span className="lbp-system-title">Hệ thống thi trắc nghiệm trực tuyến</span>
          </span>
        </div>
        <div className="lbp-icon-actions">
          
          <FaUser className="lbp-icon-user" />
        </div>
      </div>
    </header>

    <div className="lbp-welcome-bg">
  <div className="lbp-breadcrumb-wrapper">
    
    

    {/* ✅ Breadcrumb */}
    <nav className="lbp-breadcrumb">
      
      
      
    </nav>

    <h2 className="lbp-main-title">{baiThi.TenBaiThi}</h2>
  </div>
</div>


    

    <main className="lbp-main-card">
  <div className="lbp-question-block">
    {timeLeft !== null && (
  <div className="lbp-timer-box-inline">
    ⏱ Thời gian còn lại:{" "}
    <strong>
      {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
      {String(timeLeft % 60).padStart(2, "0")}
    </strong>
  </div>
)}

    <div className="lbp-question-header">
  <h3 className="lbp-question-title">Câu hỏi {currentIndex + 1}</h3>
  <div className="lbp-flag" onClick={() => toggleFlag(currentIndex)}>
    {flaggedQuestions[currentIndex] ? "🚩 Đặt cờ" : "☆ Đặt cờ"}
  </div>
</div>

    <p className="lbp-question-content">{cauHoi.NoiDung}</p>
    <div className="lbp-options">
      {cauHoi.PhuongAn.map((ph, i) => (
        <label key={i} className="lbp-option">
          <input
  type="checkbox"
  name={`cauhoi-${currentIndex}`}
  value={ph.PhanLoai}
  checked={dapAn[currentIndex] === ph.PhanLoai}
  onChange={() =>
    handleChonDapAn(
      currentIndex,
      dapAn[currentIndex] === ph.PhanLoai ? null : ph.PhanLoai
    )
  }
/>



          {ph.PhanLoai}. {ph.NoiDung}
        </label>
      ))}
    </div>

    <div className="lbp-pagination-btns">
      <button
        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        disabled={currentIndex === 0}
      >
        Trước
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => Math.min(baiThi.CauHoi.length - 1, prev + 1))}
        disabled={currentIndex === baiThi.CauHoi.length - 1}
      >
        Sau
      </button>
    </div>
  </div>

  <div className="lbp-right-side">
    <div className="lbp-question-box">
    <div className="lbp-nav-questions">
      {baiThi.CauHoi.map((_, idx) => (
        <button
          key={idx}
          className={`lbp-question-num 
  ${idx === currentIndex ? "active" : ""} 
  ${flaggedQuestions[idx] ? "flagged" : ""} 
  ${dapAn[idx] ? "answered" : ""}
`}


          onClick={() => setCurrentIndex(idx)}
        >
          {idx + 1}
        </button>
      ))}
    </div>
    
    </div>
    <button className="lbp-submit-btn" onClick={handleNopBai}>Nộp bài</button>
  </div>
  
</main>

  </div>
);

};

export default LamBaiThiPage;