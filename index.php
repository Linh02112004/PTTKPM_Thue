<?php
session_start();
require 'connectDB.php'; // Kết nối database

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $cccd = $_POST['cccd'];
    $password = $_POST['password'];

    if (empty($cccd) || empty($password)) {
        echo "<script>alert('Vui lòng nhập đầy đủ CCCD và mật khẩu!'); window.history.back();</script>";
        exit;
    }

    // Kiểm tra người dùng với CCCD và mật khẩu sử dụng PASSWORD() của MySQL
    $stmt = $conn->prepare("SELECT * FROM users WHERE cccd = ? AND password = PASSWORD(?)");
    $stmt->bind_param("ss", $cccd, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['user'] = $user;

        // Lấy danh sách vai trò của người dùng từ bảng user_roles
        $stmt_roles = $conn->prepare("SELECT user_type FROM user_roles WHERE id = ? AND user_type = ?");
        $stmt_roles->bind_param("ss", $user['id'], $_POST['user-type']);
        $stmt_roles->execute();
        $result_roles = $stmt_roles->get_result();

        if ($result_roles->num_rows > 0) {
            $selectedRole = $_POST['user-type'];
            
            // Điều hướng theo vai trò người dùng đã chọn
            if ($selectedRole === 'ke-toan') {
                echo "<script>window.location.href = 'ketoan.html';</script>";
            } elseif ($selectedRole === 'truong-phong') {
                echo "<script>window.location.href = 'truongphong.html';</script>";
            } elseif ($selectedRole === 'nhan-vien') {
                echo "<script>window.location.href = 'nhanvien.html';</script>";
            }
            exit;
        } else {
            echo "<script>alert('Bạn không có quyền truy cập với vai trò này!'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('Sai CCCD hoặc không tìm thấy tài khoản!'); window.history.back();</script>";
    }
}
?>