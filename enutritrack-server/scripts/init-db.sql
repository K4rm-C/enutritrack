\c enutritrack;

-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas básicas si no existen (para compatibilidad cuando se ejecuta antes de TypeORM)
CREATE TABLE IF NOT EXISTS especialidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas faltantes si no existen (para compatibilidad con modelos TypeORM modernos)
-- Estas columnas pueden no existir si el script se ejecuta antes de que TypeORM sincronice el esquema
ALTER TABLE cuentas ADD COLUMN IF NOT EXISTS email_1 VARCHAR(255);
ALTER TABLE cuentas ADD COLUMN IF NOT EXISTS email_2 VARCHAR(255);

ALTER TABLE perfil_admin ADD COLUMN IF NOT EXISTS telefono_1 VARCHAR(20);
ALTER TABLE perfil_admin ADD COLUMN IF NOT EXISTS telefono_2 VARCHAR(20);

ALTER TABLE perfil_doctor ADD COLUMN IF NOT EXISTS telefono_1 VARCHAR(20);
ALTER TABLE perfil_doctor ADD COLUMN IF NOT EXISTS telefono_2 VARCHAR(20);

ALTER TABLE perfil_usuario ADD COLUMN IF NOT EXISTS telefono_1 VARCHAR(20);
ALTER TABLE perfil_usuario ADD COLUMN IF NOT EXISTS telefono_2 VARCHAR(20);

-- Insertar especialidades de ejemplo con IDs fijos para asegurar consistencia
INSERT INTO especialidades (id, nombre, descripcion, created_at)
VALUES 
    ('4f671de1-075a-4842-ac74-817b5b974652', 'Medicina General', 'Atencion medica general y preventiva', CURRENT_TIMESTAMP),
    ('8861e869-93de-4209-bbc6-5b79f6e605aa', 'Nutricion', 'Especialidad en nutricion y dietetica', CURRENT_TIMESTAMP),
    ('581313fb-683b-41ca-b66a-907e99e7ee2a', 'Endocrinologia', 'Trastornos del sistema endocrino', CURRENT_TIMESTAMP),
    ('6ce306f7-2ed3-4540-bf23-f5bdf1b59dd6', 'Cardiologia', 'Enfermedades del corazon y sistema cardiovascular', CURRENT_TIMESTAMP),
    ('ac7e8a61-82bf-4c51-840c-88170d2238d8', 'Pediatria', 'Atencion medica para ninos y adolescentes', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insertar generos de ejemplo con IDs fijos para asegurar consistencia
INSERT INTO generos (id, nombre, descripcion, created_at)
VALUES 
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Masculino', 'Genero masculino', CURRENT_TIMESTAMP),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Femenino', 'Genero femenino', CURRENT_TIMESTAMP),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Otro', 'Otro genero no especificado', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Crear cuenta de administrador por defecto
-- Contraseña: admin123 (ya hasheada con bcrypt)
INSERT INTO cuentas (id, email, email_1, email_2, password_hash, tipo_cuenta, activa, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin@enutritrack.com',
  NULL,
  NULL,
  '$2b$10$maEqA0.WZZU7LzvTDQ8CWOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Crear perfil de admin por defecto
INSERT INTO perfil_admin (id, cuenta_id, nombre, departamento, telefono, telefono_1, telefono_2, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  c.id,
  'Administrador',
  'TI',
  NULL,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM cuentas c
WHERE c.email = 'admin@enutritrack.com'
  AND NOT EXISTS (
    SELECT 1 FROM perfil_admin pa WHERE pa.cuenta_id = c.id
  );

-- Insertar datos de ejemplo completos: 5 doctores con 4 pacientes cada uno
-- Password para doctores: doctor123 (ya hasheada con bcrypt)
-- Password para usuarios: usuario123 (ya hasheada con bcrypt)

-- Crear 5 cuentas de doctores
INSERT INTO cuentas (id, email, email_1, email_2, password_hash, tipo_cuenta, activa, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), 'dr.perez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'doctor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'dr.garcia@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'doctor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'dr.lopez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'doctor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'dr.martinez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'doctor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'dr.rodriguez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'doctor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Crear perfiles de doctores
INSERT INTO perfil_doctor (id, cuenta_id, admin_id, nombre, especialidad_id, cedula_profesional, telefono, telefono_1, telefono_2, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  c.id,
  pa.id,
  CASE 
    WHEN c.email = 'dr.perez@enutritrack.com' THEN 'Dr. Juan Carlos Perez'
    WHEN c.email = 'dr.garcia@enutritrack.com' THEN 'Dra. Maria Elena Garcia'
    WHEN c.email = 'dr.lopez@enutritrack.com' THEN 'Dr. Carlos Alberto Lopez'
    WHEN c.email = 'dr.martinez@enutritrack.com' THEN 'Dra. Ana Sofia Martinez'
    WHEN c.email = 'dr.rodriguez@enutritrack.com' THEN 'Dr. Luis Fernando Rodriguez'
  END,
  CASE 
    WHEN c.email = 'dr.perez@enutritrack.com' THEN '8861e869-93de-4209-bbc6-5b79f6e605aa'::uuid  -- Nutricion
    WHEN c.email = 'dr.garcia@enutritrack.com' THEN '4f671de1-075a-4842-ac74-817b5b974652'::uuid  -- Medicina General
    WHEN c.email = 'dr.lopez@enutritrack.com' THEN '581313fb-683b-41ca-b66a-907e99e7ee2a'::uuid  -- Endocrinologia
    WHEN c.email = 'dr.martinez@enutritrack.com' THEN '6ce306f7-2ed3-4540-bf23-f5bdf1b59dd6'::uuid  -- Cardiologia
    WHEN c.email = 'dr.rodriguez@enutritrack.com' THEN 'ac7e8a61-82bf-4c51-840c-88170d2238d8'::uuid  -- Pediatria
  END,
  CASE 
    WHEN c.email = 'dr.perez@enutritrack.com' THEN '12345678'
    WHEN c.email = 'dr.garcia@enutritrack.com' THEN '23456789'
    WHEN c.email = 'dr.lopez@enutritrack.com' THEN '34567890'
    WHEN c.email = 'dr.martinez@enutritrack.com' THEN '45678901'
    WHEN c.email = 'dr.rodriguez@enutritrack.com' THEN '56789012'
  END,
  CASE 
    WHEN c.email = 'dr.perez@enutritrack.com' THEN '555-1001'
    WHEN c.email = 'dr.garcia@enutritrack.com' THEN '555-1002'
    WHEN c.email = 'dr.lopez@enutritrack.com' THEN '555-1003'
    WHEN c.email = 'dr.martinez@enutritrack.com' THEN '555-1004'
    WHEN c.email = 'dr.rodriguez@enutritrack.com' THEN '555-1005'
  END,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM cuentas c
CROSS JOIN perfil_admin pa
WHERE c.tipo_cuenta = 'doctor'
  AND NOT EXISTS (
    SELECT 1 FROM perfil_doctor pd WHERE pd.cuenta_id = c.id
  );

-- Crear 20 cuentas de usuarios (4 por doctor)
INSERT INTO cuentas (id, email, email_1, email_2, password_hash, tipo_cuenta, activa, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), 'maria.garcia@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'juan.rodriguez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'ana.lopez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'carlos.martinez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'lucia.fernandez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'pedro.gonzalez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'sofia.herrera@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'diego.torres@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'isabella.morales@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'mateo.jimenez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'valentina.ramirez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'santiago.castro@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'camila.ortiz@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'alejandro.vargas@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'natalia.delgado@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'sebastian.flores@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'valeria.gutierrez@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'daniel.ruiz@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'emma.aguilar@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'maximiliano.medina@enutritrack.com', NULL, NULL, '$2b$10$KqMcR2WpdFQinFNXUpa/CYxiOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi', 'usuario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Crear perfiles de usuarios (4 por doctor)
INSERT INTO perfil_usuario (id, cuenta_id, doctor_id, nombre, fecha_nacimiento, genero_id, altura, telefono, telefono_1, telefono_2, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  c.id,
  pd.id,
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN 'Maria Garcia'
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN 'Juan Rodriguez'
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN 'Ana Lopez'
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN 'Carlos Martinez'
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN 'Lucia Fernandez'
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN 'Pedro Gonzalez'
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN 'Sofia Herrera'
    WHEN c.email = 'diego.torres@enutritrack.com' THEN 'Diego Torres'
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN 'Isabella Morales'
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN 'Mateo Jimenez'
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN 'Valentina Ramirez'
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN 'Santiago Castro'
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN 'Camila Ortiz'
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN 'Alejandro Vargas'
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN 'Natalia Delgado'
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN 'Sebastian Flores'
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN 'Valeria Gutierrez'
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN 'Daniel Ruiz'
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN 'Emma Aguilar'
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN 'Maximiliano Medina'
  END,
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN '1990-05-15'::date
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN '1985-08-22'::date
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN '1992-12-03'::date
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN '1988-03-17'::date
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN '1995-07-11'::date
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN '1987-11-28'::date
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN '1993-04-09'::date
    WHEN c.email = 'diego.torres@enutritrack.com' THEN '1989-09-14'::date
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN '1996-01-25'::date
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN '1991-06-18'::date
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN '1994-10-07'::date
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN '1986-02-13'::date
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN '1997-05-30'::date
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN '1984-08-16'::date
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN '1998-12-21'::date
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN '1983-03-05'::date
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN '1999-07-08'::date
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN '1982-11-12'::date
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN '2000-04-26'::date
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN '1981-09-19'::date
  END,
  CASE 
    WHEN c.email IN ('maria.garcia@enutritrack.com', 'ana.lopez@enutritrack.com', 'lucia.fernandez@enutritrack.com', 'sofia.herrera@enutritrack.com', 'isabella.morales@enutritrack.com', 'valentina.ramirez@enutritrack.com', 'camila.ortiz@enutritrack.com', 'natalia.delgado@enutritrack.com', 'valeria.gutierrez@enutritrack.com', 'emma.aguilar@enutritrack.com') THEN 'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid  -- Femenino
    ELSE 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid  -- Masculino
  END,
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN 165.5
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN 175.2
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN 162.8
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN 180.1
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN 158.3
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN 177.9
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN 164.7
    WHEN c.email = 'diego.torres@enutritrack.com' THEN 172.4
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN 160.9
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN 178.6
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN 163.2
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN 176.8
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN 159.4
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN 181.3
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN 157.6
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN 174.7
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN 161.8
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN 179.2
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN 156.9
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN 182.1
  END,
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN '555-2001'
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN '555-2002'
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN '555-2003'
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN '555-2004'
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN '555-2005'
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN '555-2006'
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN '555-2007'
    WHEN c.email = 'diego.torres@enutritrack.com' THEN '555-2008'
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN '555-2009'
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN '555-2010'
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN '555-2011'
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN '555-2012'
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN '555-2013'
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN '555-2014'
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN '555-2015'
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN '555-2016'
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN '555-2017'
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN '555-2018'
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN '555-2019'
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN '555-2020'
  END,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM cuentas c
CROSS JOIN (
  SELECT pd.id, pd.nombre, ROW_NUMBER() OVER (ORDER BY pd.nombre) as rn
  FROM perfil_doctor pd
) pd
WHERE c.tipo_cuenta = 'usuario'
  AND NOT EXISTS (
    SELECT 1 FROM perfil_usuario pu WHERE pu.cuenta_id = c.id
  )
  AND (
    (c.email IN ('maria.garcia@enutritrack.com', 'juan.rodriguez@enutritrack.com', 'ana.lopez@enutritrack.com', 'carlos.martinez@enutritrack.com') AND pd.rn = 1) OR
    (c.email IN ('lucia.fernandez@enutritrack.com', 'pedro.gonzalez@enutritrack.com', 'sofia.herrera@enutritrack.com', 'diego.torres@enutritrack.com') AND pd.rn = 2) OR
    (c.email IN ('isabella.morales@enutritrack.com', 'mateo.jimenez@enutritrack.com', 'valentina.ramirez@enutritrack.com', 'santiago.castro@enutritrack.com') AND pd.rn = 3) OR
    (c.email IN ('camila.ortiz@enutritrack.com', 'alejandro.vargas@enutritrack.com', 'natalia.delgado@enutritrack.com', 'sebastian.flores@enutritrack.com') AND pd.rn = 4) OR
    (c.email IN ('valeria.gutierrez@enutritrack.com', 'daniel.ruiz@enutritrack.com', 'emma.aguilar@enutritrack.com', 'maximiliano.medina@enutritrack.com') AND pd.rn = 5)
  );

-- Crear registros de historial de peso (peso actual) para cada usuario
INSERT INTO historial_peso (id, usuario_id, peso, fecha_registro, notas)
SELECT 
  uuid_generate_v4(),
  pu.id,
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN 65.5
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN 78.2
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN 58.8
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN 85.1
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN 52.3
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN 82.9
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN 64.7
    WHEN c.email = 'diego.torres@enutritrack.com' THEN 77.4
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN 55.9
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN 83.6
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN 63.2
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN 81.8
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN 54.4
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN 86.3
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN 52.6
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN 79.7
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN 56.8
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN 84.2
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN 51.9
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN 87.1
  END,
  CURRENT_TIMESTAMP,
  'Peso inicial registrado'
FROM perfil_usuario pu
JOIN cuentas c ON pu.cuenta_id = c.id
WHERE c.tipo_cuenta = 'usuario';

-- Crear objetivos de usuario para cada usuario
INSERT INTO objetivo_usuario (id, usuario_id, peso_objetivo, nivel_actividad, fecha_establecido, vigente)
SELECT 
  uuid_generate_v4(),
  pu.id,
  -- Peso objetivo
  CASE 
    WHEN c.email = 'maria.garcia@enutritrack.com' THEN 60.0
    WHEN c.email = 'juan.rodriguez@enutritrack.com' THEN 75.0
    WHEN c.email = 'ana.lopez@enutritrack.com' THEN 55.0
    WHEN c.email = 'carlos.martinez@enutritrack.com' THEN 80.0
    WHEN c.email = 'lucia.fernandez@enutritrack.com' THEN 50.0
    WHEN c.email = 'pedro.gonzalez@enutritrack.com' THEN 78.0
    WHEN c.email = 'sofia.herrera@enutritrack.com' THEN 62.0
    WHEN c.email = 'diego.torres@enutritrack.com' THEN 75.0
    WHEN c.email = 'isabella.morales@enutritrack.com' THEN 52.0
    WHEN c.email = 'mateo.jimenez@enutritrack.com' THEN 80.0
    WHEN c.email = 'valentina.ramirez@enutritrack.com' THEN 60.0
    WHEN c.email = 'santiago.castro@enutritrack.com' THEN 78.0
    WHEN c.email = 'camila.ortiz@enutritrack.com' THEN 52.0
    WHEN c.email = 'alejandro.vargas@enutritrack.com' THEN 82.0
    WHEN c.email = 'natalia.delgado@enutritrack.com' THEN 50.0
    WHEN c.email = 'sebastian.flores@enutritrack.com' THEN 76.0
    WHEN c.email = 'valeria.gutierrez@enutritrack.com' THEN 54.0
    WHEN c.email = 'daniel.ruiz@enutritrack.com' THEN 80.0
    WHEN c.email = 'emma.aguilar@enutritrack.com' THEN 49.0
    WHEN c.email = 'maximiliano.medina@enutritrack.com' THEN 83.0
  END,
  -- Nivel de actividad
  CASE 
    WHEN c.email IN ('maria.garcia@enutritrack.com', 'carlos.martinez@enutritrack.com', 'sofia.herrera@enutritrack.com', 'mateo.jimenez@enutritrack.com', 'alejandro.vargas@enutritrack.com') THEN 'sedentario'::nivel_actividad_enum
    WHEN c.email IN ('juan.rodriguez@enutritrack.com', 'lucia.fernandez@enutritrack.com', 'diego.torres@enutritrack.com', 'valentina.ramirez@enutritrack.com', 'natalia.delgado@enutritrack.com') THEN 'moderado'::nivel_actividad_enum
    WHEN c.email IN ('ana.lopez@enutritrack.com', 'pedro.gonzalez@enutritrack.com', 'isabella.morales@enutritrack.com', 'santiago.castro@enutritrack.com', 'sebastian.flores@enutritrack.com') THEN 'activo'::nivel_actividad_enum
    WHEN c.email IN ('camila.ortiz@enutritrack.com', 'valeria.gutierrez@enutritrack.com', 'daniel.ruiz@enutritrack.com', 'emma.aguilar@enutritrack.com', 'maximiliano.medina@enutritrack.com') THEN 'muy_activo'::nivel_actividad_enum
  END,
  CURRENT_TIMESTAMP,
  true
FROM perfil_usuario pu
JOIN cuentas c ON pu.cuenta_id = c.id
WHERE c.tipo_cuenta = 'usuario';

-- ========================================
-- NUEVAS TABLAS PARA CITAS MÉDICAS Y ALERTAS
-- ========================================

-- Tabla tipos_consulta
CREATE TABLE IF NOT EXISTS tipos_consulta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla estados_cita
CREATE TABLE IF NOT EXISTS estados_cita (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    es_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla categorias_alerta
CREATE TABLE IF NOT EXISTS categorias_alerta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla tipos_alerta
CREATE TABLE IF NOT EXISTS tipos_alerta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    categoria_id UUID NOT NULL REFERENCES categorias_alerta(id),
    es_automatica BOOLEAN DEFAULT false,
    config_validacion JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla niveles_prioridad_alerta
CREATE TABLE IF NOT EXISTS niveles_prioridad_alerta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_numerico INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla estados_alerta
CREATE TABLE IF NOT EXISTS estados_alerta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla citas_medicas
CREATE TABLE IF NOT EXISTS citas_medicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfil_usuario(id),
    doctor_id UUID NOT NULL REFERENCES perfil_doctor(id),
    tipo_consulta_id UUID NOT NULL REFERENCES tipos_consulta(id),
    estado_cita_id UUID NOT NULL REFERENCES estados_cita(id),
    fecha_hora_programada TIMESTAMP NOT NULL,
    fecha_hora_inicio TIMESTAMP,
    fecha_hora_fin TIMESTAMP,
    motivo TEXT,
    observaciones TEXT,
    diagnostico TEXT,
    tratamiento_recomendado TEXT,
    proxima_cita_sugerida DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla citas_medicas_vitales
CREATE TABLE IF NOT EXISTS citas_medicas_vitales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cita_medica_id UUID NOT NULL REFERENCES citas_medicas(id) ON DELETE CASCADE,
    peso NUMERIC(5,2),
    altura NUMERIC(5,2),
    tension_arterial_sistolica INTEGER,
    tension_arterial_diastolica INTEGER,
    frecuencia_cardiaca INTEGER,
    temperatura NUMERIC(4,2),
    saturacion_oxigeno INTEGER,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla citas_medicas_documentos
CREATE TABLE IF NOT EXISTS citas_medicas_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cita_medica_id UUID NOT NULL REFERENCES citas_medicas(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(100),
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano_bytes BIGINT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfil_usuario(id),
    doctor_id UUID REFERENCES perfil_doctor(id),
    tipo_alerta_id UUID NOT NULL REFERENCES tipos_alerta(id),
    nivel_prioridad_id UUID NOT NULL REFERENCES niveles_prioridad_alerta(id),
    estado_alerta_id UUID NOT NULL REFERENCES estados_alerta(id),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    recomendacion_id UUID REFERENCES recomendacion(id),
    fecha_deteccion TIMESTAMP DEFAULT now(),
    fecha_resolucion TIMESTAMP,
    resuelta_por UUID REFERENCES perfil_doctor(id),
    notas_resolucion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla alertas_acciones
CREATE TABLE IF NOT EXISTS alertas_acciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES perfil_doctor(id),
    accion_tomada VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_accion TIMESTAMP DEFAULT now()
);

-- Tabla configuracion_alertas_automaticas
CREATE TABLE IF NOT EXISTS configuracion_alertas_automaticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfil_usuario(id),
    tipo_alerta_id UUID NOT NULL REFERENCES tipos_alerta(id),
    doctor_id UUID REFERENCES perfil_doctor(id),
    esta_activa BOOLEAN DEFAULT true,
    umbral_configuracion JSONB,
    frecuencia_verificacion_horas INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, tipo_alerta_id)
);

-- Modificar tabla recomendacion para agregar nuevos campos
ALTER TABLE recomendacion ADD COLUMN IF NOT EXISTS cita_medica_id UUID REFERENCES citas_medicas(id);
ALTER TABLE recomendacion ADD COLUMN IF NOT EXISTS alerta_generadora_id UUID REFERENCES alertas(id);

-- Insertar datos de catálogos básicos

-- Tipos de consulta
INSERT INTO tipos_consulta (id, nombre, descripcion, duracion_minutos, created_at)
VALUES 
    (uuid_generate_v4(), 'Consulta General', 'Consulta médica general de rutina', 30, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Primera Vez', 'Primera consulta con el médico', 45, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Control de Seguimiento', 'Consulta de seguimiento y control', 20, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Urgencia', 'Consulta médica de urgencia', 60, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Nutrición', 'Consulta especializada en nutrición', 45, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Estados de cita
INSERT INTO estados_cita (id, nombre, descripcion, es_final, created_at)
VALUES 
    (uuid_generate_v4(), 'Programada', 'Cita programada y pendiente', false, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'En Proceso', 'Consulta en desarrollo', false, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Completada', 'Consulta completada exitosamente', true, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Cancelada', 'Cita cancelada por el paciente o médico', true, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'No Asistió', 'Paciente no se presentó a la cita', true, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Reprogramada', 'Cita reprogramada para otra fecha', false, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Categorías de alerta
INSERT INTO categorias_alerta (id, nombre, descripcion, created_at)
VALUES 
    (uuid_generate_v4(), 'Peso', 'Alertas relacionadas con cambios de peso', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Nutrición', 'Alertas relacionadas con hábitos nutricionales', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Actividad Física', 'Alertas relacionadas con actividad física', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Medicamentos', 'Alertas relacionadas con medicamentos', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Salud General', 'Alertas generales de salud', CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Niveles de prioridad de alerta
INSERT INTO niveles_prioridad_alerta (id, nombre, descripcion, nivel_numerico, created_at)
VALUES 
    (uuid_generate_v4(), 'Baja', 'Alerta de prioridad baja', 1, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Media', 'Alerta de prioridad media', 2, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Alta', 'Alerta de prioridad alta', 3, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Crítica', 'Alerta de prioridad crítica', 4, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Estados de alerta
INSERT INTO estados_alerta (id, nombre, descripcion, created_at)
VALUES 
    (uuid_generate_v4(), 'Pendiente', 'Alerta detectada, pendiente de revisión', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'En Revisión', 'Alerta siendo revisada por el médico', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Resuelta', 'Alerta resuelta por el médico', CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Descarte', 'Alerta descartada como falsa alarma', CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de alerta (dependen de categorias_alerta)
INSERT INTO tipos_alerta (nombre, descripcion, categoria_id, es_automatica, config_validacion, created_at)
SELECT 
    'Pérdida de Peso Abrupta',
    'Alerta cuando se detecta pérdida de peso significativa en poco tiempo',
    ca.id,
    true,
    '{"condiciones":[{"tabla":"historial_peso","campos_evaluacion":["peso"],"operacion":"calcular_perdida_porcentual","parametros":{"umbral_porcentaje":5.0,"periodo_dias":7,"minimo_registros":2}}],"mensaje_template":"Se ha detectado una pérdida de peso del {porcentaje}% en los últimos {dias} días","nivel_prioridad_default":"alta"}'::jsonb,
    CURRENT_TIMESTAMP
FROM categorias_alerta ca WHERE ca.nombre = 'Peso'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_alerta (nombre, descripcion, categoria_id, es_automatica, config_validacion, created_at)
SELECT 
    'Falta de Registro Nutricional',
    'Alerta cuando no se registra ingesta de alimentos por más de 3 días',
    ca.id,
    true,
    '{"condiciones":[{"tabla":"registro_comida","campos_evaluacion":["fecha_registro"],"operacion":"verificar_falta_registro","parametros":{"dias_limite":3}}],"mensaje_template":"No se han registrado alimentos en los últimos {dias} días","nivel_prioridad_default":"media"}'::jsonb,
    CURRENT_TIMESTAMP
FROM categorias_alerta ca WHERE ca.nombre = 'Nutrición'
ON CONFLICT (nombre) DO NOTHING;