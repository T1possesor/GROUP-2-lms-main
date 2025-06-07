import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from "./components/Login/Login";
import QuanTri from "./components/Quantri/QuanTri";
import ThiSinh from "./components/ThiSinh/ThiSinh";
import AppContext from "./utils/context";
import QuanLyBaiThiPage from "./components/QuanLyBaiThiPage/QuanLyBaiThiPage";
import ThongTinCaNhanPage from "./components/ThongTinCaNhanPage/ThongTinCaNhanPage"; 
import ChiTietBaiThiPage from "./components/ChiTietBaiThiPage/ChiTietBaiThiPage";
import LamBaiThiPage from "./components/LamBaiThiPage/LamBaiThiPage";
import LichSuBaiThiPage from "./components/LichSuBaiThiPage/LichSuBaiThiPage";
import XepHangPage from "./components/XepHangPage/XepHangPage";


function AppContent() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/QuanTri" element={<QuanTri />} />
            <Route path="/ThiSinh" element={<ThiSinh />} />
            <Route path="/quan-ly-bai-thi" element={<QuanLyBaiThiPage />} />
            <Route path="/thong-tin-ca-nhan" element={<ThongTinCaNhanPage />} />
            <Route path="/chi-tiet-bai-thi/:id" element={<ChiTietBaiThiPage />} />
            <Route path="/lam-bai/:id" element={<LamBaiThiPage />} />
            <Route path="/lich-su-bai-thi" element={<LichSuBaiThiPage />} />
            <Route path="/xep-hang/:id" element={<XepHangPage />} />
        </Routes>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AppContext>
                    <AppContent />
                </AppContext>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
