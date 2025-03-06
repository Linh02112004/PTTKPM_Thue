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

// Load thông tin phòng ban của trưởng phòng
function loadDepartment() {
  fetch('truongphong.php?action=get_department')
    .then(response => response.json())
    .then(data => {
      if (data.department) {
        document.getElementById('department-name').textContent = data.department;
      } else {
        alert('Không tìm thấy thông tin phòng ban!');
      }
    })
    .catch(error => console.error('Lỗi khi tải thông tin phòng ban:', error));
}

// Load danh sách nhân viên trong phòng ban
function loadEmployees() {
  fetch('truongphong.php?action=get_employees')
    .then(response => response.json())
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
    .catch(error => console.error('Lỗi khi tải dữ liệu nhân viên:', error));
}

function viewSalaryAndTax() {
  if (event) event.preventDefault();

  // Lấy giá trị từ form
  const month = document.getElementById('month').value;
  const year = document.getElementById('year').value;

  // Kiểm tra nhập liệu
  if (!month || !year) {
    alert("Vui lòng chọn tháng và năm!");
    return;
  }

  // Gọi AJAX để lấy dữ liệu từ PHP
  fetch(`truongphong.php?action=get_salaries&month=${month}&year=${year}`)
    .then(response => response.text())
    .then(data => {
      // Kiểm tra nếu có dữ liệu thì đổ vào bảng
      const tableBody = document.getElementById("salary-tax-table-body");
      tableBody.innerHTML = data || "<tr><td colspan='5'>Không có dữ liệu nhân viên!</td></tr>";
    })
    .catch(error => {
      console.error('Lỗi khi tải dữ liệu:', error);
      document.getElementById("salary-tax-table-body").innerHTML = "<tr><td colspan='5'>Lỗi tải dữ liệu!</td></tr>";
    });
}


// Gọi loadEmployees() và loadDepartment() khi trang load
window.onload = function () {
  loadDepartment();
  loadEmployees();
};