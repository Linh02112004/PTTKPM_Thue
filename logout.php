<?php
session_start();
session_destroy(); // Hủy toàn bộ session

// Xóa cookie (nếu có)
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

header("Location: index.html"); // Chuyển về trang đăng nhập
exit();
?>
