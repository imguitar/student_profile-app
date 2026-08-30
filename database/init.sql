CREATE DATABASE IF NOT EXISTS university
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE university;

-- Force the Docker entrypoint's mysql client to read this UTF-8 seed file
-- correctly. Without this, Thai text can be converted as Latin-1 on import.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_code VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  faculty VARCHAR(150) NOT NULL,
  major VARCHAR(150) NOT NULL,
  year_level TINYINT UNSIGNED NOT NULL,
  gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  date_of_birth DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_code (student_code),
  UNIQUE KEY uq_students_email (email),
  CONSTRAINT chk_students_year CHECK (year_level BETWEEN 1 AND 8),
  CONSTRAINT chk_students_gpa CHECK (gpa BETWEEN 0.00 AND 4.00)
);

INSERT INTO students
  (student_code, first_name, last_name, email, phone, faculty, major, year_level, gpa, date_of_birth)
VALUES
  ('66010001', 'กิตติพงศ์', 'แสงทอง', 'kittipong@example.ac.th', '0812345678', 'วิศวกรรมศาสตร์', 'วิศวกรรมคอมพิวเตอร์', 3, 3.42, '2004-03-12'),
  ('67020015', 'พิมพ์ชนก', 'วงศ์วัฒนา', 'pimchanok@example.ac.th', '0898765432', 'วิทยาศาสตร์', 'วิทยาการคอมพิวเตอร์', 2, 3.78, '2005-07-25'),
  ('65030042', 'ธนภัทร', 'ศรีสุข', 'thanapat@example.ac.th', '0861122334', 'บริหารธุรกิจ', 'การตลาด', 4, 3.15, '2003-11-08'),
  ('68040007', 'ณัฐชา', 'พงษ์ไพศาล', 'natcha@example.ac.th', NULL, 'มนุษยศาสตร์', 'ภาษาอังกฤษ', 1, 3.66, '2006-01-19'),
  ('66050028', 'วรเมธ', 'บุญช่วย', 'woramet@example.ac.th', '0923456781', 'ศึกษาศาสตร์', 'คณิตศาสตร์', 3, 2.95, '2004-09-30');
