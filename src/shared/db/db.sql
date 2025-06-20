CREATE database IF NOT EXISTS backdsw;

USE backdsw;

-- Tabla Category
CREATE TABLE Category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    usertype VARCHAR(100) NOT NULL
);

-- Tabla Locality
CREATE TABLE Locality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL
);

-- Tabla Coupon
CREATE TABLE Coupon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discount DECIMAL(5,2) NOT NULL,
    expiringDate DATE NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- Insert en Category
INSERT INTO Category (description, usertype)
VALUES ('Administrador', 'admin');

-- Insert en Locality
INSERT INTO Locality (name, postal_code, province)
VALUES ('Rosario', '2000', 'Santa Fe');

-- Insert en Coupon
INSERT INTO Coupon (discount, expiringDate, status)
VALUES (15.50, '2025-12-31', 'activo');