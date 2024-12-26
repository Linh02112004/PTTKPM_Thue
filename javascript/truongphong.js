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
      { name: "Trần Quang Minh", id: "MS001", dob: "12/12/1997", address: "HN", phone: "0987654321", dependents: 2, gender: "Nam", image: "image.png", salary: 12000000, taxId: "123456789" },
      { name: "Nguyễn Thị Hoa", id: "MS002", dob: "01/03/1995", address: "HN", phone: "0987654322", dependents: 1, gender: "Nữ", image: "image.png", salary: 15000000, taxId: "987654321" }
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
  
  function viewSalaryAndTax() {
    const month = document.getElementById('month-view').value;
    const year = document.getElementById('year-view').value;
  
    if (!year) {
        alert('Vui lòng nhập năm!');
        return;
    }
  
    // Xử lý logic tìm kiếm (ví dụ: gọi API hoặc cập nhật dữ liệu mẫu)
    const tableContainer = document.getElementById('salary-tax-table-container');
    const tableBody = document.getElementById('salary-tax-table-body');
  
    // Dữ liệu mẫu (thay bằng dữ liệu thực từ hệ thống)
    const sampleData = [
        { name: 'Nguyễn Văn A', msnv: '001', taxCode: '123456', salary: 20000000, tax: 2000000 },
        { name: 'Trần Thị B', msnv: '002', taxCode: '654321', salary: 25000000, tax: 2500000 },
    ];
  
    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
  
    // Biến để tính tổng
    let totalSalary = 0;
    let totalTax = 0;
  
    // Thêm dữ liệu mới vào bảng và tính tổng
    sampleData.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.msnv}</td>
            <td>${item.taxCode}</td>
            <td>${item.salary.toLocaleString()} VND</td>
            <td>${item.tax.toLocaleString()} VND</td>
        </tr>`;
        tableBody.innerHTML += row;
  
        totalSalary += item.salary;
        totalTax += item.tax;
    });
  
    // Hiển thị thông tin tổng hợp
    document.getElementById('summary-department-name').textContent = `tháng ${month}, năm ${year}`;
    document.getElementById('summary-salary').textContent = totalSalary.toLocaleString();
    document.getElementById('summary-tax').textContent = totalTax.toLocaleString();
  
    // Hiển thị bảng
    tableContainer.style.display = 'block';
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