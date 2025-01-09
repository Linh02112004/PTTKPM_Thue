window.onload = function() {
  switchTab('tab-employee-management');
};

// Dữ liệu mẫu cho tab "Xem quyết toán thuế"
const taxData = {
    marketing: [
      { name: "Trần Quang Minh", id: "MS001", taxId: "123456789", salary: 12000000, tax: 1200000 },
      { name: "Nguyễn Thị Hoa", id: "MS002", taxId: "987654321", salary: 15000000, tax: 1500000 }
    ],
    sales: [
      { name: "Lê Văn A", id: "MS003", taxId: "234567890", salary: 13000000, tax: 1300000 },
      { name: "Phan Thị B", id: "MS004", taxId: "876543210", salary: 14000000, tax: 1400000 }
    ],
    hr: [
      { name: "Trần Thị C", id: "MS005", taxId: "345678901", salary: 16000000, tax: 1600000 },
      { name: "Nguyễn Văn D", id: "MS006", taxId: "765432109", salary: 18000000, tax: 1800000 }
    ],
    business: [
      { name: "Lê Thị E", id: "MS007", taxId: "456789012", salary: 17000000, tax: 1700000 },
      { name: "Phan Quang F", id: "MS008", taxId: "654321098", salary: 20000000, tax: 2000000 }
    ]
  };
  
  // Cập nhật bảng Quyết toán thuế
  function updateTaxTable() {
    const department = document.getElementById("departmentInput").value;
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
  
    const employees = taxData[department] || [];
    if (employees.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6">Không có nhân viên trong phòng ban này</td></tr>`;
      return;
    }
  
    employees.forEach((employee, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${employee.name}</td>
        <td>${employee.id}</td>
        <td>${employee.taxId}</td>
        <td>${employee.salary.toLocaleString()}</td>
        <td>${employee.tax.toLocaleString()}</td>
      `;
      tableBody.appendChild(row);
    });
  
    const totalSalary = employees.reduce((sum, employee) => sum + employee.salary, 0);
    const totalTax = employees.reduce((sum, employee) => sum + employee.tax, 0);
  
    document.getElementById('total-salary').innerText = `Tổng lương: ${totalSalary.toLocaleString()}`;
    document.getElementById('total-tax').innerText = `Tổng thuế: ${totalTax.toLocaleString()}`;
  }
  
  // Lắng nghe sự kiện thay đổi phòng ban trong tab "Quyết toán thuế"
  document.getElementById("departmentInput").addEventListener("change", updateTaxTable);
  
  // Khởi tạo bảng khi trang tải
  updateTaxTable();
  
  // Dữ liệu mẫu cho tab "Quản lý nhân viên"
  const employeeData = {
    marketing: [
      { name: "Trần Quang Minh", id: "MS001", dob: "12/12/1997", address: "HN", phone: "0987654321", dependents: 2, gender: "Nam", image: "image.png" },
      { name: "Nguyễn Thị Hoa", id: "MS002", dob: "01/03/1995", address: "HN", phone: "0987654322", dependents: 1, gender: "Nữ", image: "image.png" }
    ],
    sales: [],
    hr: [],
    business: [],
  };
  
  // Cập nhật bảng Quản lý nhân viên
  function updateEmployeeTable() {
    const department = document.getElementById("department-select").value;
    const tableBody = document.getElementById("employee-table-body");
    tableBody.innerHTML = "";
  
    const employees = employeeData[department] || [];
    if (employees.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9">Không có nhân viên trong phòng ban này</td></tr>`;
      return;
    }
  
    employees.forEach((employee, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.id}</td>
        <td>${employee.dob}</td>
        <td>${employee.address}</td>
        <td>${employee.phone}</td>
        <td>${employee.dependents}</td>
        <td>${employee.gender}</td>
        <td><img src="${employee.image}" alt="Ảnh" style="width: 50px; height: 50px;"></td>
        <td>
          <button onclick="editDependents(${index})" class="icon-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteEmployee(${index})" class="icon-btn">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  // Chỉnh sửa số người phụ thuộc
  function editDependents(index) {
    const department = document.getElementById("department-select").value;
    const employee = employeeData[department][index];
    const newDependents = prompt(`Sửa số người phụ thuộc của ${employee.name}:`, employee.dependents);
    if (newDependents !== null) {
      employee.dependents = parseInt(newDependents, 10) || 0;
      updateEmployeeTable();
    }
  }
  
  // Xóa nhân viên
  function deleteEmployee(index) {
    const department = document.getElementById("department-select").value;
    const employee = employeeData[department][index];
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${employee.name}?`)) {
      employeeData[department].splice(index, 1);
      updateEmployeeTable();
    }
  }
  
  // Lắng nghe sự kiện thay đổi phòng ban trong tab "Quản lý nhân viên"
  document.getElementById("department-select").addEventListener("change", updateEmployeeTable);
  
  // Khởi tạo bảng khi trang tải
  updateEmployeeTable();
  
  // Xử lý ảnh
  function loadPhoto(event) {
    const profilePic = document.getElementById('profile-pic');
    profilePic.style.backgroundImage = `url(${URL.createObjectURL(event.target.files[0])})`;
  }
  
  function openPhotoInput() {
    const photoInput = document.getElementById('photo-input');
    photoInput.click();
  }
  
  // Chuyển đổi tab
  function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none'); // Ẩn tất cả các tab
  
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = 'block'; // Hiển thị tab được chọn
  
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active')); // Xóa "active" khỏi tất cả nút
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
  }
  
  // Tính toán thuế
  function search() {
    const yearInput = document.getElementById('yearInput').value;
  
    if (!yearInput) {
      alert('Vui lòng nhập năm!');
      return;
    }
  
    const tableContainer = document.getElementById('table-container');
    const footer = document.getElementById('footer');
    tableContainer.style.display = 'block';
    footer.style.display = 'block';
  
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ
  
    for (let i = 0; i < 5; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      `;
      tableBody.appendChild(tr);
    }
  
    document.getElementById('total-salary').innerText = `Tổng lương: 0`;
    document.getElementById('total-tax').innerText = `Tổng thuế: 0`;
  }
  
  // Dữ liệu tài khoản
  const accountData = [];
  
  // Hiển thị hộp nhập thông tin tài khoản
  function openCreateAccountForm() {
    document.getElementById("create-account-form").style.display = "block";
  }
  
  // Đóng hộp nhập thông tin tài khoản
  function closeCreateAccountForm() {
    document.getElementById("create-account-form").style.display = "none";
    resetCreateAccountForm(); // Reset form khi đóng
  }
  
  // Reset form tạo tài khoản
  function resetCreateAccountForm() {
    document.getElementById("new-name").value = "";
    document.getElementById("new-id").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("new-role").value = "Nhân viên";
    document.getElementById("new-department").value = "marketing";
    document.getElementById("new-cccd").value = "";
  }
  
  // Tạo tài khoản mới
  function createAccount() {
    const name = document.getElementById("new-name").value;
    const id = document.getElementById("new-id").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    const department = document.getElementById("new-department").value;
    const cccd = document.getElementById("new-cccd").value;
  
    // Kiểm tra ràng buộc CCCD
    if (!name || !id || !password || !cccd || cccd.length !== 12 || !/^\d+$/.test(cccd)) {
      alert("Vui lòng nhập đủ thông tin và đảm bảo CCCD là 12 chữ số.");
      return;
    }
  
    const account = { name, id, password, role, department, cccd };
    accountData.push(account);
    updateAccountTable();
  
    // Đóng form sau khi tạo xong
    closeCreateAccountForm();
    alert("Tài khoản mới đã được tạo!");
  }
  
  // Cập nhật bảng danh sách tài khoản
  function updateAccountTable() {
    const tableBody = document.getElementById("account-table-body");
    tableBody.innerHTML = ""; // Xóa tất cả các dòng hiện tại trong bảng
  
    // Lặp qua từng tài khoản trong danh sách và tạo dòng mới cho mỗi tài khoản
    accountData.forEach((account, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${account.name}</td>
        <td>${account.id}</td>
        <td>${account.department}</td>
        <td>${account.role}</td>
        <td>${account.cccd}</td>
        <td>
          <button onclick="editAccount(${index})"><i class="fas fa-eye"></i></button>
          <button onclick="deleteAccount(${index})"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tableBody.appendChild(row); // Thêm dòng vào bảng
    });
  }
  
  
  // Xóa tài khoản
  function deleteAccount(index) {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa tài khoản này?");
    if (confirmDelete) {
      accountData.splice(index, 1); // Xóa tài khoản
      updateAccountTable();
      alert("Tài khoản đã bị xóa!");
    }
  }
  
  // Chỉnh sửa tài khoản
  function editAccount(index) {
    const account = accountData[index];
    document.getElementById("new-name").value = account.name;
    document.getElementById("new-id").value = account.id;
    document.getElementById("new-password").value = account.password;
    document.getElementById("new-role").value = account.role;
    document.getElementById("new-department").value = account.department;
    document.getElementById("new-cccd").value = account.cccd;
  
    openCreateAccountForm();
  
    // Thay đổi hành động nút "Lưu" để cập nhật tài khoản
    const saveButton = document.querySelector("#create-account-form button[onclick='createAccount()']");
    saveButton.textContent = "Cập nhật";
    saveButton.setAttribute("onclick", `updateAccount(${index})`);
  }
  
  // Cập nhật tài khoản sau khi chỉnh sửa
  function updateAccount(index) {
    const name = document.getElementById("new-name").value;
    const id = document.getElementById("new-id").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    const department = document.getElementById("new-department").value;
    const cccd = document.getElementById("new-cccd").value;
  
    if (!name || !id || !password || !cccd || cccd.length !== 12 || !/^\d+$/.test(cccd)) {
      alert("Vui lòng nhập đủ thông tin và đảm bảo CCCD là 12 chữ số.");
      return;
    }
  
    accountData[index] = { name, id, password, role, department, cccd }; // Cập nhật tài khoản
    updateAccountTable();
  
    // Đổi nút "Cập nhật" trở lại "Lưu"
    const saveButton = document.querySelector("#create-account-form button[onclick^='updateAccount']");
    saveButton.textContent = "Lưu";
    saveButton.setAttribute("onclick", "createAccount()");
  
    closeCreateAccountForm();
    alert("Tài khoản đã được cập nhật!");
  }
  
  // Hàm để kiểm tra và chỉ cho phép nhập số
  function validateCCCD(event) {
    const cccdInput = event.target;
    let value = cccdInput.value;
  
    // Chỉ cho phép nhập các ký tự số và giới hạn tối đa 12 ký tự
    value = value.replace(/\D/g, ''); // Loại bỏ tất cả ký tự không phải số
    if (value.length > 12) {
      value = value.slice(0, 12); // Giới hạn chiều dài chỉ 12 ký tự
    }
  
    // Cập nhật giá trị của trường CCCD
    cccdInput.value = value;
  }

function setupDeduction() {
  const month = document.getElementById('deduction-month').value;
  const year = document.getElementById('deduction-year').value;
  const selfDeduction = parseFloat(document.getElementById('self-deduction').value) || 0;
  const dependentDeduction = parseFloat(document.getElementById('dependent-deduction').value) || 0;

  if (!month || !year) {
      alert('Vui lòng chọn tháng và nhập năm!');
      return;
  }

  if (selfDeduction < 0 || dependentDeduction < 0) {
      alert('Mức giảm trừ không được nhỏ hơn 0!');
      return;
  }

  alert('Mức thiết lập vừa được cập nhật vào hệ thống!');
  console.log('Thiết lập giảm trừ:', {
      month,
      year,
      selfDeduction,
      dependentDeduction,
  });
}

function searchEmployees() {
  const month = document.getElementById("monthInput").value;
  const year = document.getElementById("yearInputs").value;
  const department = document.getElementById("departmentSalaryInput").value;

  // Kiểm tra xem tất cả các trường đã được điền chưa
  if (!month || !year || !department) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
  }

  const employees = taxData[department] || [];
  const tableBody = document.getElementById("employee-table-body");
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  if (employees.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">Không có nhân viên trong phòng ban này.</td></tr>`;
  } else {
      employees.forEach(employee => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${employee.name}</td>
              <td>${employee.id}</td>
              <td>${employee.taxId}</td>
              <td>
                <input type="number" id="salary-${employee.id}" class="salary-input"
                  placeholder="Nhập lương" min="0" 
                  oninput="calculateTaxForEmployee('${employee.id}')">
              </td>
              <td id="tax-${employee.id}">Chưa tính</td>
          `;
          tableBody.appendChild(row);
      });
      document.getElementById("employee-table-container").style.display = "block";
  }
}

function calculateTaxForEmployee(employeeId) {
    const salaryInput = document.getElementById(`salary-${employeeId}`);
    const salary = parseFloat(salaryInput.value) || 0; // Lấy giá trị lương

    // Giả sử bạn biết số người phụ thuộc từ đâu đó, ở đây đặt là 0
    const dependent = 0; 
    const deductionsForDependents = 4400000 * dependent; 
    const tncn = salary - 11000000 - deductionsForDependents;

    let taxAmount = 0;

    // Tính thuế theo công thức
    if (tncn <= 0) {
        taxAmount = 0;
    } else if (tncn <= 5000000) {
        taxAmount = tncn * 0.05;
    } else if (tncn <= 10000000) {
        taxAmount = tncn * 0.10 - 250000;
    } else if (tncn <= 18000000) {
        taxAmount = tncn * 0.15 - 750000;
    } else if (tncn <= 32000000) {
        taxAmount = tncn * 0.20 - 1650000;
    } else if (tncn <= 52000000) {
        taxAmount = tncn * 0.25 - 3250000;
    } else if (tncn <= 80000000) {
        taxAmount = tncn * 0.30 - 5850000;
    } else {
        taxAmount = tncn * 0.35 - 9850000;
    }

    // Cập nhật bảng với số thuế
    const taxCell = document.getElementById(`tax-${employeeId}`);
    taxCell.innerText = `${taxAmount.toFixed(2)} VND`;
}