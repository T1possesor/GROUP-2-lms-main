const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MySQL
const db = mysql.createConnection({
  host: '100.126.19.76', // IP Tailscale của máy A (MySQL Server)
  user: 'remoteuser',     // user bạn đã tạo
  password: '123456',     // password bạn đặt cho remoteuser
  database: 'ptudw'       // database muốn dùng
});

db.connect(err => {
  if (err) {
    console.error('❌ Kết nối MySQL thất bại:', err.message);
    return;
  }
  console.log('✅ Đã kết nối tới MySQL Workbench!');
});

// API đăng ký
app.post('/api/register', (req, res) => {
  const {
    hoten,
    email,
    ngaysinh,
    sodienthoai,
    diachi,
    tendangnhap,
    matkhau
  } = req.body;

  if (!hoten || !ngaysinh || !sodienthoai || !tendangnhap || !matkhau) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }

  // Kiểm tra email đã tồn tại chưa
  const checkEmailQuery = `SELECT * FROM TaiKhoan WHERE Email = ?`;
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("❌ Lỗi kiểm tra email:", err);
      return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi kiểm tra email' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Email đã được đăng ký' });
    }

    // Nếu chưa có email, tiếp tục thêm mới
    const insertQuery = `
      INSERT INTO TaiKhoan
      (Hoten, Email, Ngaysinh, Sodienthoai, Diachi, Tendangnhap, Matkhau, Vaitro)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ThiSinh')
    `;

    db.query(
      insertQuery,
      [hoten, email, ngaysinh, sodienthoai, diachi, tendangnhap, matkhau],
      (err, result) => {
        if (err) {
          console.error('❌ Lỗi thêm tài khoản:', err);
          return res.status(500).json({ success: false, message: 'Lỗi khi thêm tài khoản' });
        }

        return res.json({ success: true, message: 'Đăng ký thành công!' });
      }
    );
  });
});

// API lấy mật khẩu của người dùng
app.get('/api/users/password/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT Matkhau FROM TaiKhoan WHERE ID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi lấy mật khẩu:", err);
      return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Trả về mật khẩu (nên mã hóa trong thực tế)
    const password = results[0].Matkhau;
    res.json({ success: true, password });
  });
});


// API cập nhật mật khẩu
app.put('/api/users/update-password/:id', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
  }

  // Kiểm tra mật khẩu hiện tại
  const query = 'SELECT Matkhau FROM TaiKhoan WHERE ID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    const storedPassword = results[0].Matkhau;

    // Kiểm tra mật khẩu hiện tại có đúng không
    if (storedPassword !== currentPassword) {
      return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không chính xác" });
    }

    // Cập nhật mật khẩu mới
    const updateQuery = 'UPDATE TaiKhoan SET Matkhau = ? WHERE ID = ?';
    db.query(updateQuery, [newPassword, userId], (err, results) => {
      if (err) {
        console.error("Lỗi cập nhật mật khẩu:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật mật khẩu" });
      }

      res.json({ success: true, message: "Mật khẩu đã được cập nhật thành công" });
    });
  });
});

// API xác minh mật khẩu
app.post('/api/users/verify-password/:id', (req, res) => {
  const { currentPassword } = req.body;
  const userId = req.params.id;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: "Mật khẩu hiện tại là bắt buộc" });
  }

  // Lấy mật khẩu đã lưu trong cơ sở dữ liệu
  const query = 'SELECT Matkhau FROM TaiKhoan WHERE ID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    const storedPassword = results[0].Matkhau;

    // Kiểm tra mật khẩu hiện tại
    if (storedPassword !== currentPassword) {
      return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }

    // Nếu mật khẩu đúng
    return res.json({ success: true, message: "Mật khẩu hiện tại chính xác" });
  });
});

app.get('/api/accounts/quantri', (req, res) => {
  const sql = `
    SELECT ID, Tendangnhap, Email, TrangThai, DATE_FORMAT(Ngaytao, '%d/%m/%Y') AS Ngaytao
    FROM TaiKhoan
    WHERE Vaitro = 'QuanTri'
    ORDER BY ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn quản trị viên:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, data: results });
  });
});


app.get('/api/accounts/thisinh', (req, res) => {
  const sql = `
    SELECT ID, Tendangnhap, Email, TrangThai, DATE_FORMAT(Ngaytao, '%d/%m/%Y') AS Ngaytao
    FROM TaiKhoan
    WHERE Vaitro = 'ThiSinh'
    ORDER BY ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn thí sinh:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, data: results });
  });
});


app.post("/api/accounts/quantri/create", (req, res) => {
  const { Tendangnhap, Matkhau } = req.body;

  if (!Tendangnhap || !Matkhau) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  const sql = `
    INSERT INTO TaiKhoan (Tendangnhap, Matkhau, Vaitro, TrangThai)
    VALUES (?, ?, 'QuanTri', 'Đang hoạt động')
  `;

  db.query(sql, [Tendangnhap, Matkhau], (err, result) => {
    if (err) {
      console.error("❌ Lỗi thêm tài khoản quản trị:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: "Tên đăng nhập đã tồn tại" });
      }
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    res.status(201).json({ success: true, message: "Tạo tài khoản quản trị thành công" });
  });
});


// DELETE API: /api/accounts/:id
app.delete("/api/accounts/:id", (req, res) => {
  const { id } = req.params;

  // Bước 1: Xóa các bản ghi trong bảng 'bailam' có liên quan đến tài khoản
  const deleteBailamSql = "DELETE FROM bailam WHERE TaiKhoanID = ?";
  
  db.query(deleteBailamSql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa bản ghi trong bảng bailam:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa dữ liệu liên quan" });
    }

    // Bước 2: Xóa tài khoản trong bảng 'TaiKhoan'
    const deleteTaiKhoanSql = `DELETE FROM TaiKhoan WHERE ID = ?`;
    
    db.query(deleteTaiKhoanSql, [id], (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi xóa tài khoản:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa tài khoản" });
      }

      res.json({ success: true, message: "Xóa tài khoản thành công" });
    });
  });
});


// Cập nhật thông tin tài khoản quản trị
app.put("/api/accounts/quantri/:id", (req, res) => {
  const { id } = req.params;
  const { Tendangnhap, Matkhau } = req.body;

  if (!Tendangnhap || !Matkhau) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }

  const sql = `
    UPDATE TaiKhoan
    SET Tendangnhap = ?, Matkhau = ?
    WHERE ID = ? AND Vaitro = 'QuanTri'
  `;

  db.query(sql, [Tendangnhap, Matkhau, id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi cập nhật tài khoản:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
    }

    res.json({ success: true, message: "Cập nhật tài khoản thành công" });
  });
});

app.put("/api/accounts/thisinh/:id", (req, res) => {
  const { id } = req.params;
  const { Tendangnhap, Matkhau } = req.body;

  if (!Tendangnhap || !Matkhau) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }

  // Kiểm tra tên đăng nhập trùng
  const checkSql = `SELECT * FROM TaiKhoan WHERE Tendangnhap = ? AND ID != ?`;
  db.query(checkSql, [Tendangnhap, id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("❌ Lỗi kiểm tra trùng tên:", checkErr);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

    // Cập nhật
    const sql = `
      UPDATE TaiKhoan
      SET Tendangnhap = ?, Matkhau = ?
      WHERE ID = ? AND Vaitro = 'ThiSinh'
    `;

    db.query(sql, [Tendangnhap, Matkhau, id], (err, result) => {
      if (err) {
        console.error("❌ Lỗi cập nhật:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
      }

      res.json({ success: true, message: "Cập nhật tài khoản thí sinh thành công" });
    });
  });
});



app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu tên đăng nhập hoặc mật khẩu' });
  }

  const query = `
    SELECT * FROM TaiKhoan 
    WHERE Tendangnhap = ? AND Matkhau = ?
  `;

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    // Đăng nhập thành công, trả lại thông tin tài khoản
    const user = results[0];
    return res.json({ success: true, user });
  });
});




app.post("/api/bai-thi/create", (req, res) => {
  const { TenBaiThi, ThoiGian, NgayBatDau, NgayKetThuc, TrangThai, CauHoi } = req.body;

  if (!TenBaiThi || !ThoiGian || !NgayBatDau || !NgayKetThuc || !Array.isArray(CauHoi)) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin hoặc cấu trúc sai" });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi bắt đầu transaction" });

    // 1. Tạo bài thi (có thêm cột TrangThai)
    const baiThiQuery = `
      INSERT INTO BaiThi (TenBaiThi, ThoiGian, NgayBatDau, NgayKetThuc, TrangThai)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(baiThiQuery, [TenBaiThi, ThoiGian, NgayBatDau, NgayKetThuc, TrangThai], (err, result) => {
      if (err) {
        db.rollback(() => {
          console.error("❌ Lỗi khi thêm bài thi:", err);
          return res.status(500).json({ success: false, message: "Lỗi khi thêm bài thi" });
        });
        return;
      }

      const BaiThiID = result.insertId;

      // 2. Duyệt từng câu hỏi
      const insertCauHoi = (index) => {
        if (index >= CauHoi.length) {
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error("❌ Lỗi commit:", err);
                return res.status(500).json({ success: false, message: "Lỗi khi lưu dữ liệu" });
              });
            } else {
              res.status(200).json({ success: true, message: "Tạo bài thi thành công!" });
            }
          });
          return;
        }

        const cauHoi = CauHoi[index];
        db.query(
          `INSERT INTO CauHoi (BaiThiID, NoiDung) VALUES (?, ?)`,
          [BaiThiID, cauHoi.NoiDung],
          (err, result) => {
            if (err) {
              db.rollback(() => {
                console.error("❌ Lỗi khi thêm câu hỏi:", err);
                return res.status(500).json({ success: false, message: "Lỗi thêm câu hỏi" });
              });
              return;
            }

            const CauHoiID = result.insertId;

            // Thêm phương án
            const phuongAnPromises = cauHoi.PhuongAn.map((ph) => {
              return new Promise((resolve, reject) => {
                db.query(
                  `INSERT INTO PhuongAn (CauHoiID, NoiDung, LaDapAnDung, PhanLoai) VALUES (?, ?, ?, ?)`,
                  [CauHoiID, ph.NoiDung, ph.LaDapAnDung, ph.PhanLoai],
                  (err) => {
                    if (err) return reject(err);
                    resolve();
                  }
                );
              });
            });

            Promise.all(phuongAnPromises)
              .then(() => insertCauHoi(index + 1))
              .catch((err) => {
                db.rollback(() => {
                  console.error("❌ Lỗi khi thêm phương án:", err);
                  return res.status(500).json({ success: false, message: "Lỗi khi thêm phương án" });
                });
              });
          }
        );
      };

      insertCauHoi(0);
    });
  });
});


// API cập nhật bài thi và câu hỏi liên quan
// API sửa bài thi và câu hỏi liên quan
app.put("/api/bai-thi/:id/update", (req, res) => {
  const BaiThiID = req.params.id;
  const { TenBaiThi, ThoiGian, NgayBatDau, NgayKetThuc, TrangThai, CauHoi } = req.body;

  if (!TenBaiThi || !ThoiGian || !NgayBatDau || !NgayKetThuc || !Array.isArray(CauHoi)) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin hoặc dữ liệu sai" });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi transaction" });

    // 1. Cập nhật thông tin bài thi
    const updateBaiThiQuery = `
      UPDATE BaiThi
      SET TenBaiThi = ?, ThoiGian = ?, NgayBatDau = ?, NgayKetThuc = ?, TrangThai = ?
      WHERE ID = ?
    `;

    db.query(updateBaiThiQuery, [TenBaiThi, ThoiGian, NgayBatDau, NgayKetThuc, TrangThai, BaiThiID], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("Lỗi khi cập nhật bài thi:", err);
          return res.status(500).json({ success: false, message: "Lỗi khi cập nhật bài thi" });
        });
        return;
      }

      // 2. Xóa bài làm của tất cả thí sinh đã làm bài thi này
      const deleteBaiLamQuery = `DELETE FROM BaiLam WHERE BaiThiID = ?`;
      db.query(deleteBaiLamQuery, [BaiThiID], (err) => {
        if (err) {
          db.rollback(() => {
            console.error("Lỗi khi xóa bài làm của thí sinh:", err);
            return res.status(500).json({ success: false, message: "Lỗi khi xóa bài làm" });
          });
          return;
        }

        // 3. Xóa câu hỏi cũ và phương án cũ
        db.query("SELECT ID FROM CauHoi WHERE BaiThiID = ?", [BaiThiID], (err, cauHoiRows) => {
          if (err) {
            db.rollback(() => res.status(500).json({ success: false, message: "Lỗi lấy câu hỏi cũ" }));
            return;
          }

          const cauHoiIDs = cauHoiRows.map((row) => row.ID);

          // Xóa phương án cũ của các câu hỏi
          const deletePhuongAn = `DELETE FROM PhuongAn WHERE CauHoiID IN (?)`;
          db.query(deletePhuongAn, [cauHoiIDs], (err) => {
            if (err) {
              db.rollback(() => res.status(500).json({ success: false, message: "Lỗi xóa phương án cũ" }));
              return;
            }

            // Xóa câu hỏi cũ
            db.query(`DELETE FROM CauHoi WHERE BaiThiID = ?`, [BaiThiID], (err) => {
              if (err) {
                db.rollback(() => res.status(500).json({ success: false, message: "Lỗi xóa câu hỏi cũ" }));
                return;
              }

              // 4. Chèn câu hỏi mới và phương án mới
              const insertCauHoi = (index) => {
                if (index >= CauHoi.length) {
                  db.commit((err) => {
                    if (err) {
                      db.rollback(() => res.status(500).json({ success: false, message: "Lỗi commit" }));
                    } else {
                      res.status(200).json({ success: true, message: "Cập nhật bài thi thành công và câu hỏi mới đã được thêm vào" });
                    }
                  });
                  return;
                }

                const cauHoi = CauHoi[index];
                db.query(
                  `INSERT INTO CauHoi (BaiThiID, NoiDung) VALUES (?, ?)`,
                  [BaiThiID, cauHoi.NoiDung],
                  (err, result) => {
                    if (err) {
                      db.rollback(() => res.status(500).json({ success: false, message: "Lỗi thêm câu hỏi mới" }));
                      return;
                    }

                    const CauHoiID = result.insertId;
                    const phuongAnPromises = cauHoi.PhuongAn.map((ph) => {
                      return new Promise((resolve, reject) => {
                        db.query(
                          `INSERT INTO PhuongAn (CauHoiID, NoiDung, LaDapAnDung, PhanLoai) VALUES (?, ?, ?, ?)`,
                          [CauHoiID, ph.NoiDung, ph.LaDapAnDung, ph.PhanLoai],
                          (err) => {
                            if (err) return reject(err);
                            resolve();
                          }
                        );
                      });
                    });

                    Promise.all(phuongAnPromises)
                      .then(() => insertCauHoi(index + 1))
                      .catch((err) => {
                        db.rollback(() => {
                          console.error("Lỗi thêm phương án mới:", err);
                          res.status(500).json({ success: false, message: "Lỗi khi thêm phương án" });
                        });
                      });
                  }
                );
              };

              insertCauHoi(0);
            });
          });
        });
      });
    });
  });
});



app.get("/api/bai-thi/:id", (req, res) => {
  const id = req.params.id;

  const baiThiQuery = "SELECT * FROM BaiThi WHERE ID = ?";
  db.query(baiThiQuery, [id], (err, baiThiRows) => {
    if (err || baiThiRows.length === 0) {
      return res.status(500).json({ success: false, message: "Không tìm thấy bài thi" });
    }

    const cauHoiQuery = "SELECT * FROM CauHoi WHERE BaiThiID = ?";
    db.query(cauHoiQuery, [id], (err, cauHoiRows) => {
      if (err) return res.status(500).json({ success: false });

      const cauHoiIDs = cauHoiRows.map(q => q.ID);
      if (cauHoiIDs.length === 0) {
        return res.status(200).json({ ...baiThiRows[0], CauHoi: [] });
      }

      const placeholders = cauHoiIDs.map(() => '?').join(',');
      const phuongAnQuery = `SELECT * FROM PhuongAn WHERE CauHoiID IN (${placeholders})`;

      db.query(phuongAnQuery, cauHoiIDs, (err, phuongAnRows) => {
        if (err) return res.status(500).json({ success: false });

        const fullCauHoi = cauHoiRows.map(q => ({
  ID: q.ID, // <- thêm dòng này
  NoiDung: q.NoiDung,
  PhuongAn: phuongAnRows
    .filter(p => p.CauHoiID === q.ID)
    .map(p => ({
      ID: p.ID, // <- thêm dòng này
      PhanLoai: p.PhanLoai,
      NoiDung: p.NoiDung,
      LaDapAnDung: p.LaDapAnDung,
    })),
}));


        res.status(200).json({
          ID: baiThiRows[0].ID,
          TenBaiThi: baiThiRows[0].TenBaiThi,
          ThoiGian: baiThiRows[0].ThoiGian,
          NgayBatDau: baiThiRows[0].NgayBatDau,
          NgayKetThuc: baiThiRows[0].NgayKetThuc,
          TrangThai: baiThiRows[0].TrangThai,
          CauHoi: fullCauHoi,
        });
      });
    });
  });
});





app.delete("/api/bai-thi/:id", (req, res) => {
  const baiThiId = req.params.id;

  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Lỗi bắt đầu transaction:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ khi bắt đầu transaction" });
    }

    // 1. Xóa các bài làm liên quan đến bài thi
    db.query("DELETE FROM BaiLam WHERE BaiThiID = ?", [baiThiId], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Lỗi khi xóa bài làm:", err);
          res.status(500).json({ success: false, message: "Lỗi khi xóa bài làm" });
        });
      }

      // 2. Lấy danh sách câu hỏi liên quan đến bài thi
      db.query("SELECT ID FROM CauHoi WHERE BaiThiID = ?", [baiThiId], (err, cauHoiRows) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Lỗi khi truy vấn câu hỏi:", err);
            res.status(500).json({ success: false, message: "Lỗi khi truy vấn câu hỏi" });
          });
        }

        const cauHoiIDs = cauHoiRows.map(row => row.ID);

        // 3. Xóa phương án của những câu hỏi đó
        if (cauHoiIDs.length > 0) {
          db.query("DELETE FROM PhuongAn WHERE CauHoiID IN (?)", [cauHoiIDs], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("❌ Lỗi khi xóa phương án:", err);
                res.status(500).json({ success: false, message: "Lỗi khi xóa phương án" });
              });
            }

            // 4. Xóa các câu hỏi
            db.query("DELETE FROM CauHoi WHERE BaiThiID = ?", [baiThiId], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Lỗi khi xóa câu hỏi:", err);
                  res.status(500).json({ success: false, message: "Lỗi khi xóa câu hỏi" });
                });
              }

              // 5. Xóa bài thi
              db.query("DELETE FROM BaiThi WHERE ID = ?", [baiThiId], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("❌ Lỗi khi xóa bài thi:", err);
                    res.status(500).json({ success: false, message: "Lỗi khi xóa bài thi" });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("❌ Lỗi commit:", err);
                      res.status(500).json({ success: false, message: "Lỗi commit" });
                    });
                  }

                  res.json({ success: true, message: "Xóa bài thi thành công!" });
                });
              });
            });
          });
        } else {
          // Nếu không có câu hỏi → chỉ cần xóa bài thi
          db.query("DELETE FROM BaiThi WHERE ID = ?", [baiThiId], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("❌ Lỗi khi xóa bài thi:", err);
                res.status(500).json({ success: false, message: "Lỗi khi xóa bài thi" });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Lỗi commit:", err);
                  res.status(500).json({ success: false, message: "Lỗi commit" });
                });
              }

              res.json({ success: true, message: "Xóa bài thi thành công!" });
            });
          });
        }
      });
    });
  });
});



app.post("/api/bai-lam/create", (req, res) => {
  const { TaiKhoanID, BaiThiID } = req.body;
  db.query(
    "INSERT INTO BaiLam (TaiKhoanID, BaiThiID) VALUES (?, ?)",
    [TaiKhoanID, BaiThiID],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, BaiLamID: result.insertId });
    }
  );
});


app.post("/api/bai-lam/:id/submit", async (req, res) => {
  const baiLamID = req.params.id;
  const { danhSachTraLoi } = req.body;

  let diem = 0;
  let tongCau = danhSachTraLoi.length;

  for (const item of danhSachTraLoi) {
    await new Promise((resolve) => {
      db.query(
        `INSERT INTO ChiTietBaiLam (BaiLamID, CauHoiID, PhuongAnChonID)
         VALUES (?, ?, ?)`,
        [baiLamID, item.CauHoiID, item.PhuongAnChonID],
        () => resolve()
      );
    });

    await new Promise((resolve) => {
      db.query(
        `SELECT LaDapAnDung FROM PhuongAn WHERE ID = ?`,
        [item.PhuongAnChonID],
        (err, rows) => {
          if (!err && rows[0]?.LaDapAnDung) diem++;
          resolve();
        }
      );
    });
  }

  const finalDiem = ((diem / tongCau) * 10).toFixed(2);

  db.query(
    `UPDATE BaiLam SET KetThuc = NOW(), Diem = ? WHERE ID = ?`,
    [finalDiem, baiLamID],
    () => {
      res.json({ success: true, Diem: finalDiem });
    }
  );
});




app.get('/api/lich-su-thi/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      bt.ID AS BaiThiID,
      bt.TenBaiThi,
      MAX(bl.KetThuc) AS ThoiGianThiGanNhat,
      MAX(bl.Diem) AS DiemCaoNhat,
      COUNT(bl.ID) AS SoLanThi
    FROM BaiLam bl
    JOIN BaiThi bt ON bl.BaiThiID = bt.ID
    WHERE bl.TaiKhoanID = ?
    GROUP BY bt.ID, bt.TenBaiThi
    ORDER BY ThoiGianThiGanNhat DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi truy vấn lịch sử thi:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    // Định dạng thời gian
    const formattedResults = results.map(row => ({
      BaiThiID: row.BaiThiID,
      TenBaiThi: row.TenBaiThi,
      ThoiGianThiGanNhat: row.ThoiGianThiGanNhat
        ? new Date(row.ThoiGianThiGanNhat).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Chưa thi",
      DiemCaoNhat: row.DiemCaoNhat ? `${row.DiemCaoNhat}/10` : "Chưa có",
      SoLanThi: row.SoLanThi,
    }));

    res.json({ success: true, data: formattedResults });
  });
});


app.get('/api/phuong-an/:id', (req, res) => {
  const phuongAnId = req.params.id;

  const sql = 'SELECT LaDapAnDung FROM PhuongAn WHERE ID = ?';
  db.query(sql, [phuongAnId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn phương án:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phương án" });
    }

    res.json(results[0]); // trả về { LaDapAnDung: 1 hoặc 0 }
  });
});

// ✅ PUT điểm cho bài làm
app.put('/api/bai-lam/:id/diem', (req, res) => {
  const baiLamID = req.params.id;
  const { Diem } = req.body;

  if (Diem === undefined || isNaN(Diem)) {
    return res.status(400).json({ message: "Dữ liệu điểm không hợp lệ" });
  }

  db.query(
    `UPDATE BaiLam SET Diem = ? WHERE ID = ?`,
    [parseFloat(Diem), baiLamID],
    (err) => {
      if (err) {
        console.error("❌ Lỗi cập nhật điểm:", err);
        return res.status(500).json({ message: "Lỗi máy chủ" });
      }

      res.json({ success: true, message: "Cập nhật điểm thành công" });
    }
  );
});

app.get('/api/xep-hang/tong-hop', (req, res) => {
  const sql = `
    SELECT 
      bt.ID AS BaiThiID,
      bt.TenBaiThi,
      bt.ThoiGian,
      COUNT(DISTINCT bl.TaiKhoanID) AS SoNguoiThamGia,
      ROUND(AVG(MaxDiemTheoNguoi), 2) AS DiemTrungBinh
    FROM BaiThi bt
    LEFT JOIN (
      SELECT BaiThiID, TaiKhoanID, MAX(Diem) AS MaxDiemTheoNguoi
      FROM BaiLam
      WHERE KetThuc IS NOT NULL
      GROUP BY BaiThiID, TaiKhoanID
    ) AS bl ON bt.ID = bl.BaiThiID
    GROUP BY bt.ID, bt.TenBaiThi, bt.ThoiGian
    ORDER BY bt.ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn bảng tổng hợp xếp hạng:", err);
      return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    }

    res.json({
      success: true,
      data: results.map(row => ({
        BaiThiID: row.BaiThiID,
        TenBaiThi: row.TenBaiThi,
        ThoiGian: row.ThoiGian,
        DiemTrungBinh: row.DiemTrungBinh ?? "Chưa có",
        SoNguoiThamGia: row.SoNguoiThamGia
      }))
    });
  });
});


app.get('/api/thong-ke/bai-thi', (req, res) => {
  const sql = `
    SELECT 
      bt.ID AS BaiThiID,
      bt.TenBaiThi,
      bt.ThoiGian,
      COUNT(bl.TaiKhoanID) AS SoNguoiThamGia,
      ROUND(AVG(bl.MaxDiem), 2) AS DiemTrungBinh,
      SEC_TO_TIME(ROUND(AVG(TIME_TO_SEC(bl.ThoiGianLamBai)))) AS ThoiGianTrungBinh
    FROM BaiThi bt
    LEFT JOIN (
      SELECT 
        BaiThiID, 
        TaiKhoanID, 
        MAX(Diem) AS MaxDiem,
        TIMEDIFF(MAX(KetThuc), MIN(BatDau)) AS ThoiGianLamBai
      FROM BaiLam
      WHERE KetThuc IS NOT NULL
      GROUP BY BaiThiID, TaiKhoanID
    ) bl ON bt.ID = bl.BaiThiID
    GROUP BY bt.ID, bt.TenBaiThi, bt.ThoiGian
    ORDER BY bt.ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn thống kê bài thi:", err);
      return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    }

    const data = results.map(row => ({
      BaiThiID: row.BaiThiID,
      TenBaiThi: row.TenBaiThi,
      ThoiGian: row.ThoiGian,
      DiemTrungBinh: row.DiemTrungBinh ?? "Chưa có",
      SoNguoiThamGia: row.SoNguoiThamGia,
      ThoiGianTrungBinh: row.ThoiGianTrungBinh ?? "Chưa có"
    }));

    res.json({ success: true, data });
  });
});





app.get('/api/xep-hang/:baiThiId', (req, res) => {
  const baiThiId = req.params.baiThiId;

  const sql = `
    SELECT 
      tk.ID AS TaiKhoanID,
      tk.Hoten AS Hoten,
      MAX(bl.Diem) AS Diem,
      DATE_FORMAT(MAX(bl.KetThuc), '%d/%m/%Y') AS NgayThi,
      CONCAT(
        FLOOR(MAX(TIMESTAMPDIFF(SECOND, bl.BatDau, bl.KetThuc)) / 60), 
        ' phút ',
        MOD(MAX(TIMESTAMPDIFF(SECOND, bl.BatDau, bl.KetThuc)), 60), 
        ' giây'
      ) AS ThoiGian
    FROM 
      BaiLam bl
    JOIN 
      TaiKhoan tk ON bl.TaiKhoanID = tk.ID
    WHERE 
      bl.BaiThiID = ? AND bl.KetThuc IS NOT NULL
    GROUP BY 
      bl.TaiKhoanID
    ORDER BY 
      Diem DESC;
  `;

  db.query(sql, [baiThiId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn bảng xếp hạng:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    const getTenBaiThi = `SELECT TenBaiThi FROM BaiThi WHERE ID = ? LIMIT 1`;
    db.query(getTenBaiThi, [baiThiId], (err2, rows) => {
      if (err2) {
        console.error("❌ Lỗi lấy tên bài thi:", err2);
        return res.status(500).json({ success: false, message: "Lỗi tên bài thi" });
      }

      res.json({
        success: true,
        tenBaiThi: rows[0]?.TenBaiThi || "Không rõ",
        data: results
      });
    });
  });
});


// API thống kê chi tiết bài thi
app.get('/api/thong-ke/chi-tiet', (req, res) => {
  const sql = `
    SELECT 
      bt.ID AS BaiThiID,
      bt.TenBaiThi,
      bt.TrangThai,
      COUNT(DISTINCT bl.TaiKhoanID) AS SoThiSinhThamGia,
      ROUND(AVG(bl.Diem), 2) AS DiemTrungBinh,
      SEC_TO_TIME(ROUND(AVG(TIMESTAMPDIFF(SECOND, bl.BatDau, bl.KetThuc)))) AS ThoiGianLamBaiTB
    FROM BaiThi bt
    LEFT JOIN BaiLam bl ON bt.ID = bl.BaiThiID AND bl.KetThuc IS NOT NULL
    GROUP BY bt.ID
  `;

  db.query(sql, (err, summaryResults) => {
    if (err) {
      console.error("❌ Lỗi truy vấn thống kê:", err);
      return res.status(500).json({ success: false, message: "Lỗi truy vấn thống kê" });
    }

    // Truy vấn câu sai nhiều nhất cho từng bài thi
    const cauHoiSaiSQL = `
      SELECT 
        ch.BaiThiID,
        ch.ID AS CauHoiID,
        ch.NoiDung,
        COUNT(*) AS SoLanSai
      FROM ChiTietBaiLam ctl
      JOIN PhuongAn pa ON ctl.PhuongAnChonID = pa.ID
      JOIN CauHoi ch ON ctl.CauHoiID = ch.ID
      WHERE pa.LaDapAnDung = 0
      GROUP BY ch.BaiThiID, ch.ID
    `;

    db.query(cauHoiSaiSQL, (err, cauHoiResults) => {
      if (err) {
        console.error("❌ Lỗi truy vấn câu hỏi sai nhiều:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi truy vấn câu sai" });
      }

      // Ghép dữ liệu
      const cauHoiMap = {};

      // Tìm câu sai nhiều nhất theo từng BaiThiID
      cauHoiResults.forEach(row => {
        if (!cauHoiMap[row.BaiThiID] || cauHoiMap[row.BaiThiID].SoLanSai < row.SoLanSai) {
          cauHoiMap[row.BaiThiID] = row;
        }
      });

      const result = summaryResults.map(row => ({
        BaiThiID: row.BaiThiID,
        TenBaiThi: row.TenBaiThi,
        TrangThai: row.TrangThai,
        SoThiSinhThamGia: row.SoThiSinhThamGia,
        DiemTrungBinh: row.DiemTrungBinh || "Chưa có",
        ThoiGianLamBaiTB: row.ThoiGianLamBaiTB || "Chưa có",
        CauHoiSaiNhieuNhat: cauHoiMap[row.BaiThiID]?.NoiDung || "Không có"
      }));

      res.json({ success: true, data: result });
    });
  });
});




app.get('/api/bai-thi/:id/diem-cao-nhat', (req, res) => {
  const baiThiId = req.params.id;

  const sql = `
    SELECT
      TaiKhoanID,
      MAX(Diem) AS DiemCaoNhat
    FROM BaiLam
    WHERE BaiThiID = ? AND KetThuc IS NOT NULL
    GROUP BY TaiKhoanID
  `;

  db.query(sql, [baiThiId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn điểm cao nhất:", err);
      return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    }

    res.json(results); // Trả về mảng gồm các { TaiKhoanID, DiemCaoNhat }
  });
});


app.get("/api/thong-ke/diem-theo-moc/:id", (req, res) => {
  const baiThiID = req.params.id;

  const sql = `
    SELECT 
      FLOOR(MaxDiem) AS DiemLamTron,
      COUNT(*) AS SoLuot
    FROM (
      SELECT TaiKhoanID, MAX(Diem) AS MaxDiem
      FROM BaiLam
      WHERE BaiThiID = ? AND KetThuc IS NOT NULL
      GROUP BY TaiKhoanID
    ) AS DiemTheoNguoi
    GROUP BY FLOOR(MaxDiem)
    ORDER BY DiemLamTron ASC
  `;

  db.query(sql, [baiThiID], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi thống kê điểm cao nhất theo mốc:", err);
      return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    }

    // Khởi tạo mảng từ 0 đến 10
    const fullRange = Array.from({ length: 11 }, (_, i) => ({
      diem: i,
      soLuot: 0
    }));

    // Cập nhật số lượt vào mảng nếu có dữ liệu
    results.forEach(row => {
      const diem = row.DiemLamTron;
      if (diem >= 0 && diem <= 10) {
        fullRange[diem].soLuot = row.SoLuot;
      }
    });

    res.json({ success: true, data: fullRange });
  });
});

// API để kiểm tra tên đăng nhập
// API để kiểm tra tên đăng nhập
app.post("/api/check-username", (req, res) => {
  const { username } = req.body;

  // Sử dụng câu lệnh SELECT COUNT(*) để kiểm tra tên đăng nhập đã tồn tại trong bảng TaiKhoan
  const sql = `SELECT COUNT(*) AS count FROM TaiKhoan WHERE Tendangnhap = ?`;

  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }

    if (results[0].count > 0) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

    res.status(200).json({ success: true, message: "Tên đăng nhập hợp lệ" });
  });
});



app.get('/api/profile-image/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT Profile FROM TaiKhoan WHERE ID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0 || !results[0].Profile) {
      return res.status(404).send('No image found');
    }

    const img = results[0].Profile;
    res.set('Content-Type', 'image/jpeg'); // hoặc 'image/png' nếu ảnh bạn lưu là PNG
    res.send(img);
  });
});

// API lấy danh sách bài thi
// API lấy danh sách bài thi
app.get("/api/bai-thi", (req, res) => {
  const sql = "SELECT ID, TenBaiThi, ThoiGian, TrangThai FROM BaiThi ORDER BY ID ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách bài thi:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    res.json(results);
  });
});




const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // lưu file trong RAM dưới dạng buffer

app.put('/api/users/:id', upload.single('profileImage'), (req, res) => {
  const userId = req.params.id;
  const { hoten, email, ngaysinh, sodienthoai, diachi } = req.body;

  let query = '';
  let params = [];

  if (req.file) {
    // Có ảnh upload
    query = `
      UPDATE TaiKhoan
      SET Hoten = ?, Email = ?, Ngaysinh = ?, Sodienthoai = ?, Diachi = ?, Profile = ?
      WHERE ID = ?
    `;
    params = [
      hoten,
      email,
      ngaysinh,
      sodienthoai,
      diachi,
      req.file.buffer, // ảnh dạng Buffer
      userId,
    ];
  } else {
    // Không upload ảnh, chỉ update thông tin text
    query = `
      UPDATE TaiKhoan
      SET Hoten = ?, Email = ?, Ngaysinh = ?, Sodienthoai = ?, Diachi = ?
      WHERE ID = ?
    `;
    params = [hoten, email, ngaysinh, sodienthoai, diachi, userId];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server khi cập nhật' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json({ message: 'Cập nhật thông tin thành công' });
  });
});







app.listen(5000, () => {
  console.log('🚀 Backend đang chạy tại http://localhost:5000');
});
