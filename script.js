function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
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
                            <button onclick="deleteEmployee('${employee.id}')">Xóa</button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu nhân viên:', error);
        });
}

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

window.onload = () => loadAccounts();

// 3. Thiết lập giảm trừ
function setupDeduction() {
    const month = document.getElementById('deduction-month').value;
    const year = document.getElementById('deduction-year').value;
    const selfDeduction = document.getElementById('self-deduction').value;
    const dependentDeduction = document.getElementById('dependent-deduction').value;

    // Kiểm tra dữ liệu
    if (!month || !year || !selfDeduction || !dependentDeduction) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    // Gửi dữ liệu bằng Fetch API
    fetch('ketoan.php?action=setup_deduction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            month,
            year,
            selfDeduction,
            dependentDeduction,
        })
    })
        .then(response => response.text())
        .then(data => {
            alert(data); // Hiển thị kết quả trả về từ PHP
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi gửi dữ liệu!');
        });
}
// 4. Tính lương và thuế
function loadEmployeeSalaries() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;

    if (!month || !year || !department) {
        alert("Vui lòng chọn đầy đủ tháng, năm và phòng ban!");
        return;
    }

    fetch(`ketoan.php?action=get_salaries&month=${month}&year=${year}&department=${department}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu từ server!');
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('salaryTableBody');
            tableBody.innerHTML = '';

            if (data.length === 0 || data.error) {
                tableBody.innerHTML = `<tr><td colspan="5">${data.error || 'Không có dữ liệu nhân viên!'}</td></tr>`;
                return;
            }

            data.forEach(employee => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.full_name}</td>
                        <td>
                            <input type="number" id="salary-${employee.id}" placeholder="Nhập lương" 
                                oninput="calculateTax('${employee.id}', ${employee.selfDeduction}, ${employee.dependentDeduction}, ${employee.dependent})">
                        </td>
                        <td id="tax-${employee.id}">0</td>
                        <td id="netSalary-${employee.id}">0</td>
                    </tr>`;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách nhân viên:', error);
        });
}


function calculateTax(employeeId, selfDeduction, dependentDeduction, dependent) {
    const salaryInput = document.getElementById(`salary-${employeeId}`);
    const salary = parseFloat(salaryInput.value) || 0;

    const deductionsForDependents = dependentDeduction * dependent;
    const tncn = salary - selfDeduction - deductionsForDependents;

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

    document.getElementById(`tax-${employeeId}`).innerText = taxAmount.toFixed(2);
    document.getElementById(`netSalary-${employeeId}`).innerText = netSalary.toFixed(2);
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
        const salary = parseFloat(document.getElementById(`salary-${id}`).value) || 0;
        const tax = parseFloat(document.getElementById(`tax-${id}`).innerText) || 0;
        const netSalary = parseFloat(document.getElementById(`netSalary-${id}`).innerText) || 0;

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
        })
        .catch(error => {
            console.error('Lỗi khi lưu lương:', error);
            alert('Có lỗi xảy ra khi lưu dữ liệu!');
        });
}
