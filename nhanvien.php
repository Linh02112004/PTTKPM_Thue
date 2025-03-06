<?php
session_start();
include 'connectDB.php';

if (!isset($_SESSION['user']['id'])) {
    echo "<script>alert('Bạn chưa đăng nhập! Vui lòng đăng nhập lại.'); window.location.href = 'login.php';</script>";
    exit;
}

$user_id = $_SESSION['user']['id'];

// Lấy thông tin người dùng từ database
$sql = "SELECT * FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $full_name = trim(htmlspecialchars($_POST['name']));
  $dob = $_POST['birthdate'];
  $gender = $_POST['gender'];
  $address = trim(htmlspecialchars($_POST['address']));
  $dependent = intval($_POST['dependents']);
  $phone = trim(htmlspecialchars($_POST['phone']));

  // Kiểm tra giới tính hợp lệ
  if (!in_array($gender, ['Nam', 'Nữ'])) {
      echo "<script>alert('Giới tính không hợp lệ! Vui lòng chọn Nam hoặc Nữ.');</script>";
  } else {
      // Kiểm tra dữ liệu không rỗng
      if ($full_name && $dob && $gender && $address && $phone) {
          $update_stmt = $conn->prepare("UPDATE users SET full_name = ?, dob = ?, gender = ?, address = ?, dependent = ?, phone = ? WHERE id = ?");
          $update_stmt->bind_param("ssssiss", $full_name, $dob, $gender, $address, $dependent, $phone, $user_id);

          if ($update_stmt->execute()) {
              // Load lại thông tin từ database sau khi cập nhật
              $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
              $stmt->bind_param("s", $user_id);
              $stmt->execute();
              $result = $stmt->get_result();
              $user = $result->fetch_assoc();

              // Cập nhật lại session với thông tin mới
              $_SESSION['user']['full_name'] = $user['full_name'];
              $_SESSION['user']['dob'] = $user['dob'];
              $_SESSION['user']['gender'] = $user['gender'];
              $_SESSION['user']['address'] = $user['address'];
              $_SESSION['user']['dependent'] = $user['dependent'];
              $_SESSION['user']['phone'] = $user['phone'];

              echo "<script>alert('Thông tin đã được cập nhật thành công!');</script>";
              echo "<script>window.location.href = 'nhanvien.php';</script>";
          } else {
              echo "<script>alert('Cập nhật thất bại!');</script>";
          }
      } else {
          echo "<script>alert('Vui lòng điền đầy đủ thông tin!');</script>";
      }
  }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phần mềm tính thuế</title>
  <link rel="icon" href="./Anh/header/anh1.jpg" type="image/jpeg">
  <link rel="stylesheet" href="./styles/nhanvien.css">
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="profile-pic" id="profile-pic"></div>
      <a class="update-photo" onclick="updatePhoto()">Cập nhật ảnh</a>
      <p>Nhân viên</p>
      <button class="button active" onclick="setActiveButton(this)">Nhập thông tin</button>
      <button class="button " onclick="setActiveButton(this)">Xem lương và thuế cá nhân</button>
      <button class="button" onclick="setActiveButton(this)">Tính thử thuế</button>
      <form id="logoutForm" action="logout.php" method="post">
        <button class="button" type="submit">Đăng xuất</button>
      </form>    
    </div>
    
    <div class="content">
      <div id="info-section">
        <!-- Phần nhập thông tin -->
            <form class="updateForm" method="POST" action="">
              <div class="input-group">
                <label for="name">Họ và tên:</label>
    <input type="text" id="name" name="name" value="<?= htmlspecialchars($user['full_name'] ?? '') ?>" required>
  </div>
  <div class="input-group">
    <label for="employee-id">Mã số nhân viên:</label>
    <input type="text" id="employee-id" name="employee_id" value="<?= htmlspecialchars($user['id'] ?? '') ?>" readonly>
  </div>
  <div class="input-group">
    <label for="address">Địa chỉ hiện tại:</label>
    <input type="text" id="address" name="address" value="<?= htmlspecialchars($user['address'] ?? '') ?>">
  </div>
  <div class="input-group">
    <label for="phone">Số điện thoại:</label>
    <input type="text" id="phone" name="phone" value="<?= htmlspecialchars($user['phone'] ?? '') ?>">
  </div>
  <div class="input-group">
    <label for="birthdate">Ngày tháng năm sinh:</label>
    <input type="date" id="birthdate" name="birthdate" value="<?= htmlspecialchars($user['dob'] ?? '') ?>">
  </div>
  <div class="input-group">
    <label for="dependents">Nhập số người phụ thuộc:</label>
    <input type="number" id="dependents" name="dependents" value="<?= htmlspecialchars($user['dependent'] ?? '') ?>" min="0">
  </div>
  <div class="input-group">
    <label>Giới tính:</label>
    <div class="radio-group">
        <label>
            <input type="radio" name="gender" value="Nam" <?= (isset($user['gender']) && trim($user['gender']) === 'Nam') ? 'checked' : '' ?> required>
            <span></span>Nam
        </label>
        <label>
            <input type="radio" name="gender" value="Nữ" <?= (isset($user['gender']) && trim($user['gender']) === 'Nữ') ? 'checked' : '' ?> required>
            <span></span>Nữ
        </label>
    </div>
</div>
  <div class="update-button-container">
    <button class="update-button" type="submit">Cập nhật</button>
  </div>
            </form>
      </div>

      <div id="salary-section" style="display: none;">
        <!-- Phần xem lương và thuế cá nhân -->
        <div class="header">
          <button class="calculate-button" onclick="calculateTaxYear()">Quyết toán thuế</button>
          <div>
              <label for="search-year">Năm:</label>
              <input type="text" id="search-year" placeholder="Nhập năm">
              <button class="search-button" onclick="searchSalary()">Tìm kiếm</button>
          </div>
      </div>

        <table id="salary-table" style="display: none;">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Số lương</th>
              <th>Thuế cần nộp</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <!-- Các hàng sẽ được thêm qua JavaScript -->
          </tbody>
        </table>
      </div>    

      <div id="tax-section" style="display: none;">
        <div class="input-group">
          <label for="salary">Nhập số lương:</label>
          <input type="number" id="salary" placeholder="Nhập số lương" required>
        </div>
        <div class="input-group">
          <label for="dependent">Nhập số người phụ thuộc:</label>
          <input type="number" id="dependent" value="0" required>
        </div>
        <div class="calculate-button-container">
          <button class="calculate-button" onclick="calculateTax()">Tính thuế</button>
        </div>
        <div id="tax-result">
          <h3>Số thuế bạn phải nộp là:</h3>
          <p id="tax-amount" style="font-weight: bold; font-size: 1.2em;"></p>
          <p id="tax-amount-words" style="font-style: italic;"></p>
          <p id="tax-details" style="margin-top: 10px;"></p>
      </div>
      </div>
    </div>
  </div>

  <div class="notification" id="notification">
    <p>Bạn vừa cập nhật thông tin cá nhân. Bạn có muốn lưu thay đổi không?</p>
    <button class="confirm-button" onclick="updateInfo()">Có</button>
    <button class="cancel-button" onclick="cancelUpdate()">Không</button>
  </div>

  <input type="file" id="photo-upload" style="display: none;" accept="image/*" onchange="loadPhoto(event)">

  <div id="detail-modal" class="modal">
    <h3>Chi tiết lương tháng</h3>
    <table>
      <thead>
        <tr>
          <th>Tháng</th>
          <th>Họ tên</th>
          <th>Lương</th>
          <th>Các khoản giảm trừ</th>
          <th>Thuế cần nộp</th>
        </tr>
      </thead>
      <tbody id="detail-table-body">
        <!-- Dữ liệu sẽ được thêm vào đây qua JavaScript -->
      </tbody>
    </table>
    <button onclick="closeDetailModal()">Đóng</button>
  </div>

  <div id="modal" class="modal">
    <h3>Thông tin quyết toán thuế</h3>
    <div>
      <label>Năm:</label>
      <span id="taxYear"></span><br>
      <label>Mã số nhân viên:</label>
      <span id="employeeId"></span><br>
      <label>Mã số thuế:</label>
      <span id="taxCode"></span><br>
      <label>Họ tên:</label>
      <span id="fullName"></span><br>
      <label>Thuế còn thiếu:</label>
      <span id="taxDue"></span><br>
      <label>Thuế đã tạm nộp:</label>
      <span id="taxPaid"></span><br>
      <label>Thuế hoàn trả:</label>
      <span id="taxRefund"></span><br>
    </div>
    <button onclick="closeModal()">Đóng</button>
  </div>

  <!-- Script -->
  <script src="./javascript/nhanvien.js"></script>
  
</body>
</html>