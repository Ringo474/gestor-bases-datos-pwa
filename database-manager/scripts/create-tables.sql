-- Script para crear las tablas necesarias si decides usar una base de datos real
-- Este script es opcional ya que la aplicación usa localStorage por defecto

CREATE TABLE IF NOT EXISTS databases (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    password_hash VARCHAR(255) NOT NULL,
    edit_password_hash VARCHAR(255) NOT NULL,
    recovery_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_fields (
    id VARCHAR(50) PRIMARY KEY,
    database_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('text', 'number', 'date', 'boolean') NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    field_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS persons (
    id VARCHAR(50) PRIMARY KEY,
    database_id VARCHAR(50) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad INT GENERATED ALWAYS AS (YEAR(CURDATE()) - YEAR(fecha_nacimiento) - 
        (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d'))) STORED,
    custom_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dni_per_database (database_id, dni)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_persons_database_id ON persons(database_id);
CREATE INDEX idx_persons_dni ON persons(dni);
CREATE INDEX idx_persons_nombre ON persons(nombre);
CREATE INDEX idx_persons_apellido ON persons(apellido);
CREATE INDEX idx_custom_fields_database_id ON custom_fields(database_id);
