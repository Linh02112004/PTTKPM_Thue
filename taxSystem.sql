-- Tạo cơ sở dữ liệu
CREATE DATABASE tax_system;

-- Sử dụng cơ sở dữ liệu
USE tax_system;

-- Tạo bảng users
CREATE TABLE users (
    id CHAR(10) PRIMARY KEY, 
    full_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender ENUM('Nam', 'Nu') NOT NULL,
    address VARCHAR(255) NOT NULL,
    dependent INT NULL,
    phone VARCHAR(10) NOT NULL UNIQUE,
    cccd VARCHAR(12) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department ENUM('marketing', 'sales', 'nhân sự', 'kinh doanh') NOT NULL,
    position ENUM('nhân viên') NOT NULL
);

CREATE TABLE user_roles (
    id CHAR(10), 
    user_type ENUM('ke-toan', 'nhan-vien', 'truong-phong') NOT NULL,
    PRIMARY KEY (id, user_type),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE monthTax (
    id CHAR(10), 
    month TINYINT NOT NULL, -- Tháng sẽ giới hạn từ 1-12 bằng ứng dụng
    year YEAR NOT NULL, -- Dùng kiểu dữ liệu YEAR thay vì INT
    salary DECIMAL(15,2) NOT NULL,
    tax DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (id, month, year),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE yearTax (
    id CHAR(10), 
    year YEAR NOT NULL,
    salary DECIMAL(15,2) NOT NULL,
    tax DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (id, year),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
)


