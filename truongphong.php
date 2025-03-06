<?php 
session_start();
require 'connectDB.php';

if (!isset($_SESSION['user']['id'])) {
    echo "<script>alert('Bạn chưa đăng nhập! Vui lòng đăng nhập lại.'); window.location.href = 'login.php';</script>";
    exit;
}

$user_id = $_SESSION['user']['id'];

// Lấy thông tin người dùng từ database
$sql = "SELECT full_name, department FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Không tìm thấy thông tin trưởng phòng!']);
    exit;
}

$department = $user['department'];

if (isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $action = '';
}

switch ($action) {
    // Lấy danh sách nhân viên trong phòng ban của trưởng phòng
    case 'get_employees':
        header('Content-Type: application/json');
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE department = ?");
        $stmt->bind_param("s", $department);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
        
        echo json_encode($employees);
        break;

    // Lấy thông tin phòng ban của trưởng phòng
    case 'get_department':
        header('Content-Type: application/json');
        echo json_encode(['department' => $department]);
        break;

        case 'get_salaries':
            header('Content-Type: text/html'); 
        
            $month = $_GET['month'] ?? null;
            $year = $_GET['year'] ?? null;
            
            if (!$month || !$year) {
                echo "<tr><td colspan='5'>Thiếu thông tin tháng hoặc năm!</td></tr>";
                exit;
            }
        
            $stmt = $conn->prepare(
                "SELECT u.id, u.full_name, m.salary, m.tax, m.netSalary 
                FROM users u 
                LEFT JOIN monthTax m ON u.id = m.id AND m.month = ? AND m.year = ?
                WHERE u.department = ?"
            );
            $stmt->bind_param("iis", $month, $year, $department);
            $stmt->execute();
            $result = $stmt->get_result();
            
            echo "<tbody id='salary-tax-table-body'>";
        
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    echo "<tr>
                            <td>" . htmlspecialchars($row['id']) . "</td>
                            <td>" . htmlspecialchars($row['full_name']) . "</td>
                            <td>" . number_format($row['salary'], 2) . "</td>
                            <td>" . number_format($row['tax'], 2) . "</td>
                            <td>" . number_format($row['netSalary'], 2) . "</td>
                          </tr>";
                }

            } else {
                echo "<tr><td colspan='5'>Không có dữ liệu nhân viên!</td></tr>";
            }
        
            echo "</tbody>";
            break;    

    default:
        echo "Chọn hành động hợp lệ!";
        break;
}

$conn->close();
?>
