function validateCCCD() {
    const cccd = document.getElementById('cccd').value;
    const errorMessage = document.getElementById('cccd-error');
    if (cccd.length !== 12 || !/^\d+$/.test(cccd)) {
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

function checkFormInputs() {
    const userType = document.getElementById('user-type').value;
    const cccd = document.getElementById('cccd').value;
    const password = document.getElementById('password').value;

    if (!cccd) {
        alert("Vui lòng nhập CCCD!");
        document.getElementById('cccd').focus();
        return false;
    }
    if (!password) {
        alert("Vui lòng nhập mật khẩu!");
        document.getElementById('password').focus();
        return false;
    }
    return true; // Tất cả các ô đã được điền
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.querySelector('.welcome-message').style.display = 'none';
}

function login() {
    if (checkFormInputs()) { // Gọi hàm kiểm tra dữ liệu đầu vào
        const userType = document.getElementById('user-type').value;

        // Điều hướng đến trang dựa trên loại người dùng
        if (userType === 'nhan-vien') {
            window.location.href = 'nhanvien.html';
        } else if (userType === 'truong-phong') {
            window.location.href = 'truongphong.html';
        } else if (userType === 'ke-toan') {
            window.location.href = 'ketoan.html';
        }
    }
}
