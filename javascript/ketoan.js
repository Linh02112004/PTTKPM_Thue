function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none'); // Ẩn tất cả các tab

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = 'block'; // Hiển thị tab được chọn

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active')); // Xóa "active" khỏi tất cả nút
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

// Xử lý ảnh
function loadPhoto(event) {
    const profilePic = document.getElementById('profile-pic');
    profilePic.style.backgroundImage = `url(${URL.createObjectURL(event.target.files[0])})`;
}

function openPhotoInput() {
    const photoInput = document.getElementById('photo-input');
    photoInput.click();
}

function confirmDelete() {
    return confirm("Bạn có chắc chắn muốn xóa nhân viên này?");
}

function openCreateAccountForm() {
    document.getElementById("create-account-form").style.display = "block";
}

function closeCreateAccountForm() {
    document.getElementById("create-account-form").style.display = "none";
}

document.getElementById('department-select').addEventListener('change', function () {
    loadEmployees(this.value);
});

// 1.Quản lý nhân viên
function loadEmployees() {
    const department = document.getElementById('department-select').value;
    fetch(`ketoan.php?action=get_employees&department=${department}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('employee-table-body');
            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9">Không có nhân viên nào trong phòng ban này.</td></tr>';
                return;
            }

            data.forEach(employee => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${employee.id || '-'}</td>
                        <td>${employee.full_name || '-'}</td>
                        <td>${employee.dob || '-'}</td>
                        <td>${employee.address || '-'}</td>
                        <td>${employee.phone || '-'}</td>
                        <td>${employee.dependent || '-'}</td>
                        <td>${employee.gender || '-'}</td>
                        <td>
                            <img src="${employee.avatar || '#'}" alt="Ảnh" style="width: 50px; height: 50px;">
                        </td>
                        <td>
                            <button onclick="editEmployee('${employee.id}')" style="background: none; border: none; cursor: pointer; margin-right: 10px;">
                                <i class="fas fa-edit" style="color: #007bff;"></i>
                            </button>

                            <button onclick="deleteEmployee('${employee.id}')" style="background: none; border: none; cursor: pointer;">
                                <i class="fas fa-trash-alt" style="color: red;"></i>
                            </button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu nhân viên:', error);
        });
}

// Gọi loadEmployees() khi trang load
window.onload = function () {
    loadEmployees();
};

function editEmployee(id) {
    alert(`Chỉnh sửa nhân viên: ${id}`);
    // Thêm logic chỉnh sửa ở đây
}

function deleteEmployee(id) {
    if (confirm('Bạn có chắc muốn xóa nhân viên này không?')) {
        fetch('ketoan.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=delete_employee&id=${id}`
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadEmployees(document.getElementById('department-select').value);
            })
            .catch(error => console.error('Lỗi khi xóa nhân viên:', error));
    }
}

window.onload = () => loadEmployees('all');

document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
});

// 2. Quản lý tài khoản
function loadAccounts() {
    fetch('ketoan.php?action=get_accounts')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('account-table-body');
            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">Không có tài khoản nào.</td></tr>';
                return;
            }

            data.forEach(account => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${account.full_name}</td>
                        <td>${account.id}</td>
                        <td>${account.department}</td>
                        <td>${account.position}</td>
                        <td>${account.cccd}</td>
                        <td>
                            <button onclick="deleteAccount('${account.id}')">Xóa</button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => console.error('Lỗi khi tải danh sách tài khoản:', error));
}

function deleteAccount(id) {
    if (confirm('Bạn có chắc muốn xóa tài khoản này không?')) {
        fetch('ketoan.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=delete_account&id=${id}`
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadAccounts();
            })
            .catch(error => console.error('Lỗi khi xóa tài khoản:', error));
    }
}

// 3. Thiết lập giảm trừ
// Lấy dữ liệu giảm trừ theo năm
function fetchDeductions() {
    const year = document.getElementById('deduction-year').value;

    if (!year) {
        alert("Vui lòng nhập năm!");
        return;
    }

    fetch(`ketoan.php?action=get_deductions&year=${year}`)
        .then(response => response.json())
        .then(data => {
            renderDeductionTable(year, data);
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert("Có lỗi xảy ra khi tải dữ liệu!");
        });
}

// Hiển thị bảng 12 tháng và dữ liệu đã lưu
function renderDeductionTable(year, data) {
    const tbody = document.getElementById('annualTaxTableBody');
    tbody.innerHTML = "";

    for (let month = 1; month <= 12; month++) {
        const row = document.createElement('tr');

        const deduction = data.find(item => item.month == month) || { selfDeduction: '', dependentDeduction: '' };

        row.innerHTML = `
            <td>${month}</td>
            <td>${year}</td>
            <td><input type="number" class="deduction-input" id="self-${month}" value="${deduction.selfDeduction}" min="0"></td>
            <td><input type="number" class="deduction-input" id="dependent-${month}" value="${deduction.dependentDeduction}" min="0"></td>
        `;

        tbody.appendChild(row);
    }
}

// Gửi dữ liệu giảm trừ đã thiết lập
function setupAllDeductions() {
    const year = document.getElementById('deduction-year').value;
    if (!year) {
        alert("Vui lòng nhập năm!");
        return;
    }

    const deductions = [];
    for (let month = 1; month <= 12; month++) {
        const selfDeduction = document.getElementById(`self-${month}`).value || 0;
        const dependentDeduction = document.getElementById(`dependent-${month}`).value || 0;

        deductions.push({ month, year, selfDeduction, dependentDeduction });
    }

    // Gửi dữ liệu đến PHP
    fetch('ketoan.php?action=setup_all_deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deductions)
    })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi thiết lập dữ liệu!');
        });
}

// 4. Tính lương và thuế
function loadSalaries() {
    if (event) event.preventDefault();

    // Lấy giá trị từ form
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;

    // Gọi AJAX để lấy dữ liệu từ PHP
    fetch(`ketoan.php?action=get_salaries&month=${month}&year=${year}&department=${department}`)
        .then(response => response.text())
        .then(data => {
            // Kiểm tra nếu có dữ liệu thì đổ vào bảng
            const tableBody = document.getElementById("salaryTableBody");
            tableBody.innerHTML = data || "<tr><td colspan='5'>Không có dữ liệu nhân viên!</td></tr>";
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
            document.getElementById("salaryTableBody").innerHTML = "<tr><td colspan='5'>Lỗi tải dữ liệu!</td></tr>";
        });
}

function calculateTax(employeeId, selfDeduction, dependentDeduction, dependent) {
    const salaryInput = document.getElementById(`salary-${employeeId}`);
    const salary = parseFloat(salaryInput.value) || 0;
    console.log(`Lương nhập vào cho nhân viên ${employeeId}: ${salary}`);

    const deductionsForDependents = dependentDeduction * dependent;
    const tncn = salary - selfDeduction - deductionsForDependents;
    console.log(`Thu nhập chịu thuế: ${tncn}`);

    let taxAmount = 0;

    if (tncn > 0) {
        if (tncn <= 5000000) taxAmount = tncn * 0.05;
        else if (tncn <= 10000000) taxAmount = tncn * 0.10 - 250000;
        else if (tncn <= 18000000) taxAmount = tncn * 0.15 - 750000;
        else if (tncn <= 32000000) taxAmount = tncn * 0.20 - 1650000;
        else if (tncn <= 52000000) taxAmount = tncn * 0.25 - 3250000;
        else if (tncn <= 80000000) taxAmount = tncn * 0.30 - 5850000;
        else taxAmount = tncn * 0.35 - 9850000;
    }

    const netSalary = salary - taxAmount;

    if (document.getElementById(`tax-${employeeId}`)) {
        document.getElementById(`tax-${employeeId}`).innerText = taxAmount.toFixed(2);
        document.getElementById(`netSalary-${employeeId}`).innerText = netSalary.toFixed(2);
    } else {
        console.error(`Không tìm thấy phần tử thuế hoặc lương cho ID ${employeeId}`);
    }

}

function saveSalaries() {
    const rows = document.querySelectorAll('#salaryTableBody tr');
    const salaryData = [];
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    if (!month || !year) {
        alert("Vui lòng chọn tháng và năm!");
        return;
    }

    rows.forEach(row => {
        const id = row.cells[0].innerText;
        const salary = parseFloat(document.getElementById(`salary-${id}`).value.replace(/,/g, '')) || 0;
        const tax = parseFloat(document.getElementById(`tax-${id}`).innerText.replace(/,/g, '')) || 0;
        const netSalary = parseFloat(document.getElementById(`netSalary-${id}`).innerText.replace(/,/g, '')) || 0;

        if (salary > 0) {
            salaryData.push({ id, month, year, salary, tax, netSalary });
        }
    });

    if (salaryData.length === 0) {
        alert("Không có dữ liệu để lưu hoặc lương chưa được nhập!");
        return;
    }

    fetch('ketoan.php?action=save_salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaries: salaryData })
    })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi khi gửi dữ liệu đến máy chủ!');
            return response.json();
        })
        .then(result => {
            alert(result.message || 'Dữ liệu đã được lưu thành công!');
            loadEmployeeSalaries(); // Load lại bảng ngay sau khi lưu
        })
        .catch(error => {
            console.error('Lỗi khi lưu lương:', error);
        });
}

// Gắn sự kiện cho nút "Xem quyết toán thuế"
document.getElementById('searchTaxBtn').addEventListener('click', loadAnnualTax);

// 5. Quyết toán thuế
function loadAnnualTax(event) {
    if (event) event.preventDefault();

    const year = document.getElementById('yearTax').value;
    const department = document.getElementById('department').value;
    const currentYear = new Date().getFullYear();

    if (year >= currentYear) {
        alert(`Chưa hết năm để xem quyết toán thuế!\nChỉ có thể xem năm <= ${currentYear - 1}.`);
        return;
    }

    fetch(`ketoan.php?action=get_annual_tax&year=${year}&department=${department}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("annualTaxTableBody");
            tableBody.innerHTML = "";

            if (data.error) {
                tableBody.innerHTML = `<tr><td colspan='5'>${data.error}</td></tr>`;
                return;
            }

            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5'>Không có dữ liệu quyết toán thuế!</td></tr>";
                return;
            }

            data.forEach(employee => {
                const totalSalary = parseFloat(employee.totalSalary) || 0;
                const selfDeduction = parseFloat(employee.selfDeduction) * 12;
                const dependentDeduction = parseFloat(employee.dependentDeduction) * 12;
                const dependent = employee.dependent || 0;

                // Tính thuế và lương thực nhận
                const tax = calculateAnnualTax(totalSalary, selfDeduction, dependentDeduction, dependent);
                const netSalary = totalSalary - tax;

                tableBody.innerHTML += `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.full_name}</td>
                        <td>${totalSalary.toLocaleString()} VND</td>
                        <td>${tax.toLocaleString()} VND</td>
                        <td>${netSalary.toLocaleString()} VND</td>
                    </tr>`;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
            document.getElementById("annualTaxTableBody").innerHTML = "<tr><td colspan='5'>Lỗi tải dữ liệu!</td></tr>";
        });
}

function calculateAnnualTax(totalSalary, selfDeduction, dependentDeduction, dependent) {
    const taxableIncome = totalSalary - selfDeduction - (dependentDeduction * dependent);

    if (taxableIncome <= 60000000) return taxableIncome * 0.05;
    else if (taxableIncome <= 120000000) return 60000000 * 0.05 + (taxableIncome - 60000000) * 0.10;
    else if (taxableIncome <= 216000000) return 60000000 * 0.05 + 60000000 * 0.10 + (taxableIncome - 120000000) * 0.15;
    else if (taxableIncome <= 384000000) return 60000000 * 0.05 + 60000000 * 0.10 + 96000000 * 0.15 + (taxableIncome - 216000000) * 0.20;
    else if (taxableIncome <= 624000000) return 60000000 * 0.05 + 60000000 * 0.10 + 96000000 * 0.15 + 168000000 * 0.20 + (taxableIncome - 384000000) * 0.25;
    else if (taxableIncome <= 960000000) return 60000000 * 0.05 + 60000000 * 0.10 + 96000000 * 0.15 + 168000000 * 0.20 + 240000000 * 0.25 + (taxableIncome - 624000000) * 0.30;
    else return 60000000 * 0.05 + 60000000 * 0.10 + 96000000 * 0.15 + 168000000 * 0.20 + 240000000 * 0.25 + 336000000 * 0.30 + (taxableIncome - 960000000) * 0.35;
}

function saveAnnualTax() {
    const rows = document.querySelectorAll('#annualTaxTableBody tr');
    const taxData = [];
    const year = document.getElementById('year').value;

    rows.forEach(row => {
        const id = row.cells[0].innerText;
        const totalSalary = parseFloat(row.cells[2].innerText) || 0;
        const totalTax = parseFloat(row.cells[3].innerText) || 0;
        const netSalary = parseFloat(row.cells[4].innerText) || 0;

        taxData.push({ id, year, totalSalary, totalTax, netSalary });
    });

    fetch('ketoan.php?action=save_annual_tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxes: taxData })
    }).then(response => response.json())
        .then(result => alert(result.message))
        .catch(error => console.error('Lỗi khi lưu:', error));
}