let previousData = {
  name: document.getElementById('name').value,
  employeeId: document.getElementById('employee-id').value,
  address: document.getElementById('address').value,
  phone: document.getElementById('phone').value,
  birthdate: document.getElementById('birthdate').value,
  dependents: document.getElementById('dependents').value,
  gender: document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : ''
};

function setActiveButton(button) {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
}

function showNotification() {
  document.getElementById('notification').style.display = 'block';
}

function updateInfo() {
  previousData = {
    name: document.getElementById('name').value,
    employeeId: document.getElementById('employee-id').value,
    address: document.getElementById('address').value,
    phone: document.getElementById('phone').value,
    birthdate: document.getElementById('birthdate').value,
    dependents: document.getElementById('dependents').value,
    gender: document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : ''
  };
  document.getElementById('notification').style.display = 'none';
}

function cancelUpdate() {
  document.getElementById('name').value = previousData.name;
  document.getElementById('employee-id').value = previousData.employeeId;
  document.getElementById('address').value = previousData.address;
  document.getElementById('phone').value = previousData.phone;
  document.getElementById('birthdate').value = previousData.birthdate;
  document.getElementById('dependents').value = previousData.dependents;

  let genderInputs = document.querySelectorAll('input[name="gender"]');
  genderInputs.forEach(input => {
    input.checked = (input.value === previousData.gender);
  });

  document.getElementById('notification').style.display = 'none';
}

function updatePhoto() {
  document.getElementById('photo-upload').click();
}

function loadPhoto(event) {
  const profilePic = document.getElementById('profile-pic');
  profilePic.style.backgroundImage = `url(${URL.createObjectURL(event.target.files[0])})`;
}

function setActiveButton(button) {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  // Hiển thị phần tương ứng
  const infoSection = document.getElementById('info-section');
  const salarySection = document.getElementById('salary-section');

  if (button.innerText === "Nhập thông tin") {
    infoSection.style.display = 'block';
    salarySection.style.display = 'none';
  } else if (button.innerText === "Xem lương và thuế cá nhân") {
    infoSection.style.display = 'none';
    salarySection.style.display = 'block';
  } else {
    infoSection.style.display = 'none';
    salarySection.style.display = 'none';
  }
}

function searchSalary() {
  const year = parseInt(document.getElementById('search-year').value);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Tháng bắt đầu từ 0

  const tableBody = document.querySelector('#salary-table tbody');
  tableBody.innerHTML = ''; // Xóa các hàng hiện tại

  if (year < currentYear) {
    // Hiển thị toàn bộ 12 tháng
    for (let month = 1; month <= 12; month++) {
      const row = `<tr>
                      <td>${month}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td><span class="eye-icon" onclick="showDetail(${month})">👁️</span></td>
                    </tr>`;
      tableBody.insertAdjacentHTML('beforeend', row);
    }
  } else if (year === currentYear) {
    // Hiển thị đến tháng hiện tại
    for (let month = 1; month <= currentMonth; month++) {
      const row = `<tr>
                      <td>${month}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td><span class="eye-icon" onclick="showDetail(${month})">👁️</span></td>
                    </tr>`;
      tableBody.insertAdjacentHTML('beforeend', row);
    }
  }

  document.getElementById('salary-table').style.display = 'table';
}

function showDetail(month) {
  // Hiển thị chi tiết lương cho tháng đã chọn
  const detailTableBody = document.getElementById('detail-table-body');
  detailTableBody.innerHTML = '';

  // Khởi tạo các biến với giá trị trống
  const employeeName = ""; // Trống
  const salary = ""; // Trống
  const deductions = ""; // Trống
  const taxDue = ""; // Trống

  const row = `<tr>
                  <td>${month}</td>
                  <td>${employeeName}</td>
                  <td>${salary}</td>
                  <td>${deductions}</td>
                  <td>${taxDue}</td>
                </tr>`;
  detailTableBody.insertAdjacentHTML('beforeend', row);

  document.getElementById('detail-modal').classList.add('active');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('active');
}

function calculateTaxYear() {
  // Lấy năm từ trường tìm kiếm
  const year = document.getElementById('search-year').value;
  const employeeId = document.getElementById('employee-id').value;

  // Cập nhật thông tin vào modal
  document.getElementById('taxYear').textContent = year; // Hiển thị năm đã tìm kiếm
  document.getElementById('employeeId').textContent = '';
  document.getElementById('taxCode').textContent = '';
  document.getElementById('fullName').textContent = '';
  document.getElementById('taxDue').textContent = '';
  document.getElementById('taxPaid').textContent = '';
  document.getElementById('taxRefund').textContent = '';

  document.getElementById('modal').classList.add('active');
}

function setActiveButton(button) {
  const sections = ['info-section', 'salary-section', 'tax-section'];
  sections.forEach(section => {
    document.getElementById(section).style.display = 'none';
  });
  const activeSection = button.textContent === 'Nhập thông tin' ? 'info-section' :
    button.textContent === 'Xem lương và thuế cá nhân' ? 'salary-section' :
      'tax-section';
  document.getElementById(activeSection).style.display = 'block';

  const buttons = document.querySelectorAll('.button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function calculateTax() {
  const salary = parseFloat(document.getElementById('salary').value) || 0;
  const dependent = parseFloat(document.getElementById('dependent').value) || 0;

  // Kiểm tra xem dependent có hợp lệ không
  if (isNaN(dependent) || dependent < 0) {
    alert("Số phụ thuộc không hợp lệ.");
    return;
  }

  // Tính toán các khoản giảm trừ cho phụ thuộc
  const deductionsForDependents = 4400000 * dependent;
  const tncn = salary - 11000000 - deductionsForDependents;

  let taxAmount = 0;
  let taxFormula = '';

  // Tính thuế dựa trên thu nhập chịu thuế
  if (tncn <= 0) {
    taxAmount = 0;
    taxFormula = "TNCN phải chịu thuế <= 0, không có thuế phải nộp.";
  } else if (tncn <= 5000000) {
    taxAmount = tncn * 0.05;
    taxFormula = `Số thuế phải nộp = 5% * ${tncn.toFixed(2)} = ${taxAmount.toFixed(2)} VND`;
  } else if (tncn <= 10000000) {
    taxAmount = tncn * 0.10 - 250000;
    taxFormula = `Số thuế phải nộp = 10% * ${tncn.toFixed(2)} - 250,000 = ${taxAmount.toFixed(2)} VND`;
  } else if (tncn <= 18000000) {
    taxAmount = tncn * 0.15 - 750000;
    taxFormula = `Số thuế phải nộp = 15% * ${tncn.toFixed(2)} - 750,000 = ${taxAmount.toFixed(2)} VND`;
  } else if (tncn <= 32000000) {
    taxAmount = tncn * 0.20 - 1650000;
    taxFormula = `Số thuế phải nộp = 20% * ${tncn.toFixed(2)} - 1,650,000 = ${taxAmount.toFixed(2)} VND`;
  } else if (tncn <= 52000000) {
    taxAmount = tncn * 0.25 - 3250000;
    taxFormula = `Số thuế phải nộp = 25% * ${tncn.toFixed(2)} - 3,250,000 = ${taxAmount.toFixed(2)} VND`;
  } else if (tncn <= 80000000) {
    taxAmount = tncn * 0.30 - 5850000;
    taxFormula = `Số thuế phải nộp = 30% * ${tncn.toFixed(2)} - 5,850,000 = ${taxAmount.toFixed(2)} VND`;
  } else {
    taxAmount = tncn * 0.35 - 9850000;
    taxFormula = `Số thuế phải nộp = 35% * ${tncn.toFixed(2)} - 9,850,000 = ${taxAmount.toFixed(2)} VND`;
  }

  taxAmount = Math.max(taxAmount, 0);

  // Cập nhật kết quả
  document.getElementById('tax-amount').textContent = taxAmount.toFixed(2) + " VND";
  document.getElementById('tax-amount-words').textContent = convertNumberToWords(taxAmount) + " đồng";

  document.getElementById('tax-details').innerHTML =
    `TNCN phải chịu thuế = ${salary} - 11,000,000 - (4,400,000 * ${dependent}) = ${tncn.toFixed(2)} VND <br>` +
    taxFormula;

  document.getElementById('tax-result').style.display = 'block';
}

function convertNumberToWords(num) {
  if (num === 0) return "Không";

  // Tách phần nguyên và phần lẻ
  const [integerPart, decimalPart] = num.toFixed(2).toString().split(".");
  const integerWords = convertIntegerToWords(parseInt(integerPart));

  let words = integerWords;

  // Xử lý phần lẻ (nếu có)
  if (decimalPart && parseInt(decimalPart) > 0) { // Chỉ xử lý nếu phần lẻ > 0
    const decimalNumber = parseInt(decimalPart); // Chuyển phần lẻ thành số nguyên
    const decimalWords = convertChunkToWords(decimalNumber); // Đọc phần lẻ như số nguyên

    // Xử lý trường hợp phần lẻ bắt đầu bằng 0 (ví dụ 0.04 sẽ đọc là phẩy không bảy đồng)
    if (decimalPart[0] === "0") {
      words += ` phẩy không ${decimalWords}`;
    } else {
      words += ` phẩy ${decimalWords}`;
    }
  }

  return words.trim();
}

// Hàm chuyển đổi phần nguyên
function convertIntegerToWords(num) {
  if (num === 0) return "Không";

  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const scales = ["", "nghìn", "triệu", "tỷ"];
  const chunks = [];
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0 || chunks.length > 0) {
      chunks.push(convertChunkToWords(chunk) + (scales[scaleIndex] ? " " + scales[scaleIndex] : ""));
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return chunks.reverse().join(" ").trim();
}

// Hàm chuyển đổi chữ số đơn lẻ
function convertDigitToWord(digit) {
  const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  return units[digit];
}

// Hàm chuyển đổi phần nguyên nhỏ (hàng trăm, chục, đơn vị)
function convertChunkToWords(chunk) {
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
  const hundreds = ["", "một trăm", "hai trăm", "ba trăm", "bốn trăm", "năm trăm", "sáu trăm", "bảy trăm", "tám trăm", "chín trăm"];

  const hundred = Math.floor(chunk / 100);
  const ten = Math.floor((chunk % 100) / 10);
  const unit = chunk % 10;

  let words = "";

  // Xử lý hàng trăm
  if (hundred > 0) {
    words += hundreds[hundred] + " ";
  }

  // Xử lý hàng chục và đơn vị
  if (ten > 1) {
    words += tens[ten] + " ";
    if (unit > 0) {
      words += units[unit] + " ";
    }
  } else if (ten === 1) {
    words += tens[ten] + " ";
    if (unit > 0) {
      words += units[unit] + " ";
    }
  } else if (unit > 0) {
    if (hundred > 0) {
      words += "linh ";
    }
    words += units[unit] + " ";
  }

  return words.trim();
}