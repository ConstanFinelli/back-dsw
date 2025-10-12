-- ============================================
-- CREAR NEGOCIOS Y CANCHAS
-- Ejecutar en MySQL Workbench
-- ============================================

USE backdsw;

-- ============================================
-- 1. CREAR USUARIOS DUEÑOS DE NEGOCIOS
-- ============================================
-- Password para todos: "password123" (hasheado con bcrypt)
INSERT INTO user (name, surname, email, password, category_id, created_at, updated_at)
VALUES 
('Juan', 'Pérez', 'juan.perez@canchas.com', '$2a$10$rZ5qH8xQX9Y7K3vL2wN8.OqGxJ5F4hZ3mK7pL9nQ2rT4sU6vW8xY0', 
 (SELECT id FROM category WHERE usertype = 'business_owner'), NOW(), NOW()),
 
('María', 'González', 'maria.gonzalez@deportes.com', '$2a$10$rZ5qH8xQX9Y7K3vL2wN8.OqGxJ5F4hZ3mK7pL9nQ2rT4sU6vW8xY0',
 (SELECT id FROM category WHERE usertype = 'business_owner'), NOW(), NOW()),
 
('Carlos', 'Rodríguez', 'carlos.rodriguez@futbol.com', '$2a$10$rZ5qH8xQX9Y7K3vL2wN8.OqGxJ5F4hZ3mK7pL9nQ2rT4sU6vW8xY0',
 (SELECT id FROM category WHERE usertype = 'business_owner'), NOW(), NOW());

-- ============================================
-- 2. CREAR LOCALIDADES (INCLUYENDO ROSARIO)
-- ============================================
INSERT INTO locality (name, postal_code, province)
VALUES 
('Rosario', '2000', 'Santa Fe'),
('Funes', '2132', 'Santa Fe'),
('Villa Gobernador Gálvez', '2124', 'Santa Fe');

-- ============================================
-- 3. CREAR NEGOCIOS (COMPLEJOS DEPORTIVOS)
-- ============================================
INSERT INTO business (owner_id, locality_id, business_name, address, average_rating, reservation_deposit_percentage, active, activated_at)
VALUES 
((SELECT id FROM user WHERE email = 'juan.perez@canchas.com'),
 (SELECT id FROM locality WHERE name = 'Rosario' LIMIT 1),
 'Complejo Deportivo La Cancha',
 'Av. Pellegrini 1234',
 4.5,
 0.30,
 1,
 NOW()),

((SELECT id FROM user WHERE email = 'maria.gonzalez@deportes.com'),
 (SELECT id FROM locality WHERE name = 'Funes' LIMIT 1),
 'Fútbol 5 El Crack',
 'Calle San Martín 567',
 4.8,
 0.25,
 1,
 NOW()),

((SELECT id FROM user WHERE email = 'carlos.rodriguez@futbol.com'),
 (SELECT id FROM locality WHERE name = 'Villa Gobernador Gálvez' LIMIT 1),
 'Canchas Premium VGG',
 'Bv. 27 de Febrero 890',
 4.2,
 0.35,
 1,
 NOW());

-- ============================================
-- 4. CREAR CANCHAS
-- ============================================

-- Canchas para "Complejo Deportivo La Cancha"
INSERT INTO pitch (rating, size, ground_type, roof, price, business_id, created_at, updated_at)
VALUES 
(5, 'grande', 'césped sintético', 1, 15000.00, 
 (SELECT id FROM business WHERE business_name = 'Complejo Deportivo La Cancha'), NOW(), NOW()),
 
(4, 'mediano', 'césped sintético', 1, 12000.00, 
 (SELECT id FROM business WHERE business_name = 'Complejo Deportivo La Cancha'), NOW(), NOW()),
 
(4, 'pequeño', 'césped natural', 0, 8000.00, 
 (SELECT id FROM business WHERE business_name = 'Complejo Deportivo La Cancha'), NOW(), NOW());

-- Canchas para "Fútbol 5 El Crack"
INSERT INTO pitch (rating, size, ground_type, roof, price, business_id, created_at, updated_at)
VALUES 
(5, 'mediano', 'césped sintético', 1, 13500.00, 
 (SELECT id FROM business WHERE business_name = 'Fútbol 5 El Crack'), NOW(), NOW()),
 
(5, 'mediano', 'césped sintético', 0, 11000.00, 
 (SELECT id FROM business WHERE business_name = 'Fútbol 5 El Crack'), NOW(), NOW()),
 
(4, 'pequeño', 'césped sintético', 1, 9000.00, 
 (SELECT id FROM business WHERE business_name = 'Fútbol 5 El Crack'), NOW(), NOW());

-- Canchas para "Canchas Premium VGG"
INSERT INTO pitch (rating, size, ground_type, roof, price, business_id, created_at, updated_at)
VALUES 
(5, 'grande', 'césped natural', 0, 18000.00, 
 (SELECT id FROM business WHERE business_name = 'Canchas Premium VGG'), NOW(), NOW()),
 
(4, 'mediano', 'cemento', 1, 10000.00, 
 (SELECT id FROM business WHERE business_name = 'Canchas Premium VGG'), NOW(), NOW()),
 
(3, 'pequeño', 'cemento', 0, 6000.00, 
 (SELECT id FROM business WHERE business_name = 'Canchas Premium VGG'), NOW(), NOW());

-- ============================================
-- 5. VERIFICAR DATOS INSERTADOS
-- ============================================
SELECT '=== RESUMEN ===' AS '';
SELECT CONCAT('Negocios: ', COUNT(*)) FROM business;
SELECT CONCAT('Canchas: ', COUNT(*)) FROM pitch;

SELECT 
    b.business_name AS 'Negocio',
    p.size AS 'Tamaño',
    p.ground_type AS 'Tipo de Suelo',
    IF(p.roof = 1, 'Con techo', 'Sin techo') AS 'Techo',
    CONCAT('$', FORMAT(p.price, 0)) AS 'Precio',
    p.rating AS 'Rating'
FROM pitch p
JOIN business b ON p.business_id = b.id
ORDER BY b.business_name, p.size DESC;
