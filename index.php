<?php
session_start();
require 'connectDB.php'; // Kết nối database

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $cccd = $_POST['cccd'];
    $password = $_POST['password'];
    $userType = $_POST['user-type'];

    if (empty($cccd) || empty($password)) {
        echo "<script>alert('Vui lòng nhập đầy đủ CCCD và mật khẩu!'); window.history.back();</script>";
        exit;
    }

    // Kiểm tra đăng nhập với mật khẩu đã mã hóa bằng PASSWORD()
    $stmt = $conn->prepare("SELECT * FROM users WHERE cccd = ? AND user_type = ? AND password = PASSWORD(?)");
    $stmt->bind_param("sss", $cccd, $userType, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['user'] = $user;

        // Điều hướng theo loại người dùng đến trang HTML
        if ($userType === 'nhan-vien') {
            echo "<script>window.location.href = 'nhanvien.html';</script>";
        } elseif ($userType === 'truong-phong') {
            echo "<script>window.location.href = 'truongphong.html';</script>";
        } elseif ($userType === 'ke-toan') {
            echo "<script>window.location.href = 'ketoan.html';</script>";
        }
        exit;
    } else {
        echo "<script>alert('Sai CCCD hoặc mật khẩu!'); window.history.back();</script>";
    }
}
?>
