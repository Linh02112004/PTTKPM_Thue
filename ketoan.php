<?php
session_start();
require 'connectDB.php';

if (isset($_GET['action'])) {
    $action = $_GET['action'];
} elseif (isset($_POST['action'])) {
    $action = $_POST['action'];
} else {
    $action = '';
}

switch ($action) {
    // 1. Quản lý nhân viên (Xem và xóa)
    // Lấy danh sách nhân viên
    case 'get_employees':
        $department = $_GET['department'] ?? 'all';
        
        if ($department === 'all') {
            $stmt = $conn->prepare("SELECT * FROM users");
        } else {
            $stmt = $conn->prepare("SELECT * FROM users WHERE department = ?");
            $stmt->bind_param("s", $department);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
        
        echo json_encode($employees);
        break;
    
    // Xóa nhân viên
    case 'delete_employee':
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
            $id = $_POST['id'];
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("s", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Xóa nhân viên thành công!"]);
            } else {
                echo json_encode(["success" => false, "message" => "Lỗi khi xóa nhân viên!"]);
            }
        }
        break;

    // 2. Quản lý tài khoản
    case 'create_account': 
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Lấy dữ liệu từ form
            $id = $_POST['id'];
            $full_name = $_POST['full_name'];
            $password = $_POST['password']; 
            $department = $_POST['department'];
            $position = $_POST['position'];
            $phone = $_POST['phone'];
            $cccd = $_POST['cccd'];
            $role = $_POST['role']; // Vai trò cho bảng user_roles

            // Kiểm tra các trường không được để trống
            if (empty($id) || empty($full_name) || empty($password) || empty($department) || empty($position) || empty($phone) || empty($cccd) || empty($role)) {
                echo "<script>alert('Vui lòng nhập đầy đủ thông tin!'); window.history.back();</script>";
                exit();
            }

            // Kiểm tra độ dài và định dạng
            if (!preg_match('/^\d{10}$/', $phone)) {
                echo "<script>alert('Số điện thoại phải là 10 chữ số!'); window.history.back();</script>";
                exit();
            }

            if (!preg_match('/^\d{12}$/', $cccd)) {
                echo "<script>alert('CCCD phải là 12 chữ số!'); window.history.back();</script>";
                exit();
            }

            // Kiểm tra trùng số điện thoại hoặc CCCD
            $stmt_check = $conn->prepare("SELECT id FROM users WHERE phone = ? OR cccd = ?");
            $stmt_check->bind_param("ss", $phone, $cccd);
            $stmt_check->execute();
            $stmt_check->store_result();
            if ($stmt_check->num_rows > 0) {
                echo "<script>alert('Số điện thoại hoặc CCCD đã tồn tại!'); window.history.back();</script>";
                exit();
            }
            $stmt_check->close();

            // Chèn vào bảng users
            $stmt_user = $conn->prepare("INSERT INTO users (id, full_name, password, department, position, phone, cccd) 
                                         VALUES (?, ?, PASSWORD(?), ?, ?, ?, ?)");
            $stmt_user->bind_param("sssssss", $id, $full_name, $password, $department, $position, $phone, $cccd);

            if ($stmt_user->execute()) {
                // Chèn vào bảng user_roles
                $stmt_role = $conn->prepare("INSERT INTO user_roles (id, user_type) VALUES (?, ?)");
                $stmt_role->bind_param("ss", $id, $role);

                if ($stmt_role->execute()) {
                    echo "<script>alert('Tạo tài khoản thành công!'); window.location.href = 'ketoan.html';</script>";
                } else {
                    echo "<script>alert('Lỗi khi thêm vai trò người dùng!'); window.history.back();</script>";
                }

                $stmt_role->close();
            } else {
                echo "<script>alert('Lỗi khi tạo tài khoản!'); window.history.back();</script>";
            }

            $stmt_user->close();
        }
        break; 

    case 'get_accounts':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $result = $conn->query("SELECT id, full_name, department, position, cccd FROM users");
    
            $accounts = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $accounts[] = $row;
                }
            }
    
            header('Content-Type: application/json');
            echo json_encode($accounts);
        }
        break;
    

    // 3. Thiết lập giảm trừ
    case 'setup_deduction':
    if ($_GET['action'] === 'setup_deduction' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $month = $_POST['month'];
        $year = $_POST['year'];
        $selfDeduction = $_POST['selfDeduction'];
        $dependentDeduction = $_POST['dependentDeduction'];
    
        // Sử dụng biến $conn thay vì $mysqli
        $stmt = $conn->prepare("INSERT INTO deduction (month, year, selfDeduction, dependentDeduction) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iidd", $month, $year, $selfDeduction, $dependentDeduction);
    
        if ($stmt->execute()) {
            echo "Thiết lập giảm trừ thành công!";
        } else {
            echo "Lỗi khi thiết lập giảm trừ: " . $stmt->error;
        }
    
        $stmt->close();
    }
    break;
    
    // 4. Tính lương và thuế
    case 'calculate_tax':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $salary = $_POST['salary'];
            $month = $_POST['month'];
            $year = $_POST['year'];
            $dependent = $_POST['dependent'];

            // Tính thuế theo biểu thuế lũy tiến
            $deductionsForDependents = 4400000 * $dependent;
            $tncn = $salary - 11000000 - $deductionsForDependents;

            if ($tncn <= 0) {
                $tax = 0;
            } elseif ($tncn <= 5000000) {
                $tax = $tncn * 0.05;
            } elseif ($tncn <= 10000000) {
                $tax = $tncn * 0.10 - 250000;
            } elseif ($tncn <= 18000000) {
                $tax = $tncn * 0.15 - 750000;
            } elseif ($tncn <= 32000000) {
                $tax = $tncn * 0.20 - 1650000;
            } elseif ($tncn <= 52000000) {
                $tax = $tncn * 0.25 - 3250000;
            } elseif ($tncn <= 80000000) {
                $tax = $tncn * 0.30 - 5850000;
            } else {
                $tax = $tncn * 0.35 - 9850000;
            }

            $stmt = $conn->prepare("INSERT INTO monthTax (id, month, year, salary, tax) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("siidd", $id, $month, $year, $salary, $tax);

            if ($stmt->execute()) {
                echo "Lưu lương và thuế thành công!";
            } else {
                echo "Lỗi khi lưu dữ liệu!";
            }
        }
        break;

    // 5. Xem quyết toán thuế
    case 'view_tax_summary':
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['department']) && isset($_GET['year'])) {
            $department = $_GET['department'];
            $year = $_GET['year'];

            $stmt = $conn->prepare("SELECT u.full_name, u.id, y.salary, y.tax 
                                    FROM users u 
                                    JOIN yearTax y ON u.id = y.id 
                                    WHERE u.department = ? AND y.year = ?");
            $stmt->bind_param("si", $department, $year);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $stt = 1;
                $totalSalary = 0;
                $totalTax = 0;

                while ($row = $result->fetch_assoc()) {
                    $netSalary = $row['salary'] - $row['tax'];
                    $totalSalary += $row['salary'];
                    $totalTax += $row['tax'];

                    echo "<tr>
                            <td>{$stt}</td>
                            <td>{$row['full_name']}</td>
                            <td>{$row['id']}</td>
                            <td>{$row['id']}</td>
                            <td>" . number_format($row['salary'], 0, ',', '.') . " VND</td>
                            <td>" . number_format($row['tax'], 0, ',', '.') . " VND</td>
                            <td>" . number_format($netSalary, 0, ',', '.') . " VND</td>
                        </tr>";
                    $stt++;
                }

                echo "<script>
                    document.getElementById('total-salary').innerText = 'Tổng lương: " . number_format($totalSalary, 0, ',', '.') . " VND';
                    document.getElementById('total-tax').innerText = 'Tổng thuế: " . number_format($totalTax, 0, ',', '.') . " VND';
                    document.getElementById('total-net-salary').innerText = 'Tổng lương thực nhận: " . number_format($totalSalary - $totalTax, 0, ',', '.') . " VND';
                </script>";
            } else {
                echo "<tr><td colspan='7'>Không có dữ liệu quyết toán thuế.</td></tr>";
            }
        }
        break;

    default:
        echo "Chọn hành động hợp lệ!";
        break;
}
$conn->close();

?>
