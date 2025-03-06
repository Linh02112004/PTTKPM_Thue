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

function calculateTax($salary, $selfDeduction, $dependentDeduction, $dependent) {
    $deductionsForDependents = $dependentDeduction * $dependent;
    $tncn = $salary - $selfDeduction - $deductionsForDependents;

    $taxAmount = 0;

    if ($tncn > 0) {
        if ($tncn <= 5000000) {
            $taxAmount = $tncn * 0.05;
        } elseif ($tncn <= 10000000) {
            $taxAmount = $tncn * 0.10 - 250000;
        } elseif ($tncn <= 18000000) {
            $taxAmount = $tncn * 0.15 - 750000;
        } elseif ($tncn <= 32000000) {
            $taxAmount = $tncn * 0.20 - 1650000;
        } elseif ($tncn <= 52000000) {
            $taxAmount = $tncn * 0.25 - 3250000;
        } elseif ($tncn <= 80000000) {
            $taxAmount = $tncn * 0.30 - 5850000;
        } else {
            $taxAmount = $tncn * 0.35 - 9850000;
        }
    }

    $netSalary = $salary - $taxAmount;

    return [
        'tax' => $taxAmount,
        'netSalary' => $netSalary
    ];
}

switch ($action) {
    // 1. Quản lý nhân viên (Xem và xóa)
    // Lấy danh sách nhân viên
    case 'get_employees':
        header('Content-Type: application/json'); 
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
    
    // 3.Thiết lập giảm trừ
    // Lấy dữ liệu giảm trừ theo năm
case 'get_deductions':
    if (isset($_GET['year'])) {
        $year = intval($_GET['year']);
        $result = $conn->query("SELECT month, selfDeduction, dependentDeduction FROM deduction WHERE year = $year");

        $deductions = [];
        while ($row = $result->fetch_assoc()) {
            $deductions[] = $row;
        }

        echo json_encode($deductions);
    }
    break;

// Thiết lập giảm trừ cho 12 tháng
case 'setup_all_deductions':
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $deductions = json_decode(file_get_contents("php://input"), true);

        if (is_array($deductions)) {
            foreach ($deductions as $deduction) {
                $month = $deduction['month'];
                $year = $deduction['year'];
                $selfDeduction = $deduction['selfDeduction'];
                $dependentDeduction = $deduction['dependentDeduction'];

                // Kiểm tra tồn tại: Cập nhật nếu có, thêm mới nếu chưa có
                $stmt = $conn->prepare("INSERT INTO deduction (month, year, selfDeduction, dependentDeduction) 
                                        VALUES (?, ?, ?, ?) 
                                        ON DUPLICATE KEY UPDATE 
                                        selfDeduction = VALUES(selfDeduction), 
                                        dependentDeduction = VALUES(dependentDeduction)");

                $stmt->bind_param("iidd", $month, $year, $selfDeduction, $dependentDeduction);
                $stmt->execute();
                $stmt->close();
            }

            echo "Thiết lập giảm trừ thành công!";
        } else {
            echo "Dữ liệu không hợp lệ!";
        }
    }
    break;

    // 4. Tính lương và thuế
    case 'get_salaries':
        header('Content-Type: text/html'); 
    
        $month = $_GET['month'] ?? null;
        $year = $_GET['year'] ?? null;
        $department = $_GET['department'] ?? 'all';
    
        if (!$month || !$year || !$department) {
            echo "<tr><td colspan='5'>Thiếu thông tin tháng, năm hoặc phòng ban!</td></tr>";
            exit;
        }
    
        // Lấy mức giảm trừ
        $stmtDeduction = $conn->prepare("SELECT selfDeduction, dependentDeduction FROM deduction WHERE month = ? AND year = ? LIMIT 1");
        $stmtDeduction->bind_param("ii", $month, $year);
        $stmtDeduction->execute();
        $deductionResult = $stmtDeduction->get_result();
        $deduction = $deductionResult->fetch_assoc();
    
        if (!$deduction) {
            echo "<tr><td colspan='5'>Chưa thiết lập mức giảm trừ cho tháng và năm này.</td></tr>";
            exit;
        }
    
        $selfDeduction = $deduction['selfDeduction'];
        $dependentDeduction = $deduction['dependentDeduction'];
    
        // Lấy danh sách nhân viên và lương đã lưu (nếu có)
        if ($department === 'all') {
            $stmt = $conn->prepare("
                SELECT u.id, u.full_name, u.dependent, 
                       m.salary, m.tax, m.netSalary 
                FROM users u 
                LEFT JOIN monthTax m 
                ON u.id = m.id AND m.month = ? AND m.year = ?
            ");
            $stmt->bind_param("ii", $month, $year);
        } else {
            $stmt = $conn->prepare("
                SELECT u.id, u.full_name, u.dependent, 
                       m.salary, m.tax, m.netSalary 
                FROM users u 
                LEFT JOIN monthTax m 
                ON u.id = m.id AND m.month = ? AND m.year = ?
                WHERE u.department = ?
            ");
            $stmt->bind_param("iis", $month, $year, $department);
        }
    
        $stmt->execute();
        $result = $stmt->get_result();
            
        echo "<tbody id='salaryTableBody'>";
    
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $salary = $row['salary'] ?? 0;
                $dependent = $row['dependent'] ?? 0;
        
                // Tính thuế và lương ròng bằng PHP
                $taxResult = calculateTax($salary, $selfDeduction, $dependentDeduction, $dependent);
                $tax = $taxResult['tax'];
                $netSalary = $taxResult['netSalary'];
        
                echo "<tr>
                    <td>{$row['id']}</td>
                    <td>{$row['full_name']}</td>
                    <td>
                        <input type='number' id='salary-{$row['id']}' 
                            placeholder='Nhập lương' 
                            value='{$salary}' 
                            oninput='calculateTax(\"{$row['id']}\", {$selfDeduction}, {$dependentDeduction}, {$row['dependent']})'>
                    </td>
                    <td id='tax-{$row['id']}'>" . number_format($tax, 2) . "</td>
                    <td id='netSalary-{$row['id']}'>" . number_format($netSalary, 2) . "</td>
                </tr>";
            }
        } else {
            echo "<tr><td colspan='5'>Không có dữ liệu nhân viên!</td></tr>";
        }
    
        echo "</tbody>";
        break;    

    case 'save_salaries':
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['salaries']) || empty($data['salaries'])) {
            echo json_encode(['error' => 'Không có dữ liệu để lưu!']);
            exit;
        }
        
        $stmt = $conn->prepare("REPLACE INTO monthTax (id, month, year, salary, tax, netSalary) VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($data['salaries'] as $employee) {
            $id = $employee['id'];
            $month = $employee['month'];
            $year = $employee['year'];
            $salary = $employee['salary'];
            $tax = $employee['tax'];
            $netSalary = $employee['netSalary'];
        
            $stmt->bind_param("siiddd", $id, $month, $year, $salary, $tax, $netSalary);
            $stmt->execute();
        }
        
        echo json_encode(['message' => 'Dữ liệu lương đã được lưu thành công!']);
        break;    

    // 5. Xem quyết toán thuế
    case 'get_annual_tax':
        $format = $_GET['format'] ?? 'json';
        $year = isset($_GET['year']) ? intval($_GET['year']) : null;
        $department = $_GET['department'] ?? 'all';
        $currentYear = date("Y");
    
        if (!$year || $year >= $currentYear) {
            echo json_encode([
                "status" => "error",
                "message" => "Chưa hết năm để xem quyết toán thuế! Chỉ có thể xem năm <= " . ($currentYear - 1) . "."
            ]);
            exit();
        }
    
        if (!$department) {
            echo json_encode([
                "status" => "error",
                "message" => "Thiếu thông tin phòng ban!"
            ]);
            exit();
        }
    
        $stmtDeduction = $conn->prepare("SELECT selfDeduction, dependentDeduction FROM deduction WHERE year = ? LIMIT 1");
        $stmtDeduction->bind_param("i", $year);
        $stmtDeduction->execute();
        $deductionResult = $stmtDeduction->get_result();
        $deduction = $deductionResult->fetch_assoc();
    
        if (!$deduction) {
            echo "<tr><td colspan='5'>Chưa thiết lập mức giảm trừ cho năm $year.</td></tr>";
            exit;
        }
    
        $selfDeduction = $deduction['selfDeduction'];
        $dependentDeduction = $deduction['dependentDeduction'];
    
        if ($department === 'all') {
            $stmt = $conn->prepare("SELECT u.id, u.full_name, u.dependent, COUNT(m.month) AS monthCount, SUM(m.salary) AS totalSalary, SUM(y.tax) AS totalTax FROM users u LEFT JOIN monthTax m ON u.id = m.id AND m.year = ? LEFT JOIN yearTax y ON u.id = y.id AND y.year = ? GROUP BY u.id");
            $stmt->bind_param("ii", $year, $year);
        } else {
            $stmt = $conn->prepare("SELECT u.id, u.full_name, u.dependent, COUNT(m.month) AS monthCount, SUM(m.salary) AS totalSalary, SUM(y.tax) AS totalTax FROM users u LEFT JOIN monthTax m ON u.id = m.id AND m.year = ? LEFT JOIN yearTax y ON u.id = y.id AND y.year = ? WHERE u.department = ? GROUP BY u.id");
            $stmt->bind_param("iis", $year, $year, $department);
        }
    
        $stmt->execute();
        $result = $stmt->get_result();
        $employees = [];
    
        while ($row = $result->fetch_assoc()) {
            if ($row['monthCount'] < 12) {
                echo "<tr><td colspan='5'>Chưa đủ dữ liệu để quyết toán cho năm $year.</td></tr>";
                exit;
            }
    
            $netSalary = ($row['totalSalary'] - $row['totalTax']);
    
            $employees[] = [
                'id' => $row['id'],
                'full_name' => $row['full_name'],
                'dependent' => $row['dependent'] ?? 0,
                'totalSalary' => $row['totalSalary'] ?? 0,
                'totalTax' => $row['totalTax'] ?? 0,
                'netSalary' => $netSalary,
                'selfDeduction' => $selfDeduction,'dependentDeduction' => $dependentDeduction
            ];
        }
    
        if (empty($employees)) {
            echo "<tr><td colspan='5'>Không tìm thấy bản ghi lương nào cho năm $year.</td></tr>";
            exit;
        }
    
        if ($format === 'html') {
            echo "<tbody id='annualTaxTableBody'>";
            foreach ($employees as $employee) {
                echo "<tr>
                        <td>{$employee['id']}</td>
                        <td>{$employee['full_name']}</td>
                        <td>" . number_format($employee['totalSalary'], 2) . " VND</td>
                        <td>" . number_format($employee['totalTax'], 2) . " VND</td>
                        <td>" . number_format($employee['netSalary'], 2) . " VND</td>
                      </tr>";
            }
            echo "</tbody>";
        } else {
            echo json_encode($employees);
        }
        $stmt->close();
        break;
    
    // Lưu quyết toán thuế năm
    case 'save_annual_tax':
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['taxes']) || empty($data['taxes'])) {
            echo json_encode(['error' => 'Không có dữ liệu để lưu!']);
            exit;
        }

        $stmt = $conn->prepare("REPLACE INTO yearTax (id, year, totalSalary, totalTax, netSalary) VALUES (?, ?, ?, ?, ?)");

        foreach ($data['taxes'] as $employee) {
            $id = $employee['id'];
            $year = $employee['year'];
            $totalSalary = $employee['totalSalary'];
            $totalTax = $employee['totalTax'];
            $netSalary = $employee['netSalary'];

            $stmt->bind_param("siddd", $id, $year, $totalSalary, $totalTax, $netSalary);
            $stmt->execute();
        }

        echo json_encode(['message' => 'Dữ liệu quyết toán thuế đã được lưu thành công!']);
        break;
    
    default:
        echo "Chọn hành động hợp lệ!";
        break;
}
$conn->close();

?>