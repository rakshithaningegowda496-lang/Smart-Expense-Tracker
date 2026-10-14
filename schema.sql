-- ========================================================
-- ExpenseFlow: Employee Expense & Salary Tracking System
-- Target Database: MySQL 8.0+
-- File: schema.sql (Production Real-Time Schema)
-- ========================================================

CREATE DATABASE IF NOT EXISTS expense_flow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_flow_db;

-- 1. Users Table (Authentication & Role Management with Hashed Passwords)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Cryptographic Salt & Hash (PBKDF2-SHA512)
    role ENUM('EMPLOYEE', 'MANAGER') NOT NULL,
    ref_id VARCHAR(50) NOT NULL, -- References employee_id or manager_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Sessions Table (Stateful Auth Tokens)
CREATE TABLE sessions (
    token VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role ENUM('EMPLOYEE', 'MANAGER') NOT NULL,
    ref_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Employees Table
CREATE TABLE employees (
    employee_id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    monthly_salary DECIMAL(12, 2) NOT NULL,
    annual_salary DECIMAL(12, 2) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Managers Table
CREATE TABLE managers (
    manager_id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Expenses Table
CREATE TABLE expenses (
    expense_id VARCHAR(50) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    category ENUM('Petrol/Fuel', 'Food', 'Travel', 'Hotel', 'Office Supplies', 'Mobile/Internet', 'Other') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    photo_path LONGTEXT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    approved_by VARCHAR(50) NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expenses_emp (employee_id),
    INDEX idx_expenses_status (status),
    INDEX idx_expenses_date (date),
    CONSTRAINT fk_expenses_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Notifications Table
CREATE TABLE notifications (
    notification_id VARCHAR(50) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    expense_id VARCHAR(50) NULL,
    message TEXT NOT NULL,
    notification_type ENUM('APPROVED', 'REJECTED', 'INFO') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_emp (employee_id),
    INDEX idx_notifications_read (is_read),
    CONSTRAINT fk_notifications_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_expense FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- NOTE: Demo mock seed data has been removed for production real-time use.
-- Real accounts are created through the Registration API (/api/auth/register).
