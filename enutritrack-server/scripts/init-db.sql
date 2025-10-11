\c enutritrack;

-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear cuenta de administrador por defecto
-- Contraseña: admin123 (ya hasheada con bcrypt)
INSERT INTO cuentas (id, email, password_hash, tipo_cuenta, activa, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin@enutritrack.com',
  '$2b$10$maEqA0.WZZU7LzvTDQ8CWOmzosuH.KqMcR2WpdFQinFNXUpa/CYxi',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Crear perfil de admin por defecto
INSERT INTO perfil_admin (id, cuenta_id, nombre, departamento, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  c.id,
  'Administrador',
  'TI',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM cuentas c
WHERE c.email = 'admin@enutritrack.com'
  AND NOT EXISTS (
    SELECT 1 FROM perfil_admin pa WHERE pa.cuenta_id = c.id
  );