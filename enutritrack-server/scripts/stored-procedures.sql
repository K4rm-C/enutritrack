-- ========================================
-- STORED PROCEDURES PARA DASHBOARD DE SUPERUSUARIO
-- ========================================
-- Estos procedimientos permiten al superusuario gestionar
-- pacientes, doctores y administradores sin pasar por microservicios
-- ========================================

-- ========================================
-- PROCEDIMIENTOS PARA PACIENTES
-- ========================================

-- Obtener todos los pacientes con informacion detallada
CREATE OR REPLACE FUNCTION sp_get_all_patients()
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    genero VARCHAR,
    fecha_nacimiento DATE,
    edad INTEGER,
    altura NUMERIC,
    telefono VARCHAR,
    doctor_id UUID,
    doctor_nombre VARCHAR,
    cuenta_activa BOOLEAN,
    created_at TIMESTAMP,
    ultimo_peso NUMERIC,
    fecha_ultimo_peso TIMESTAMP,
    objetivo_peso NUMERIC,
    nivel_actividad VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.nombre,
        c.email,
        pu.genero::VARCHAR,
        pu.fecha_nacimiento,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pu.fecha_nacimiento))::INTEGER AS edad,
        pu.altura,
        pu.telefono,
        pu.doctor_id,
        pd.nombre AS doctor_nombre,
        c.activa AS cuenta_activa,
        pu.created_at,
        (SELECT hp.peso FROM historial_peso hp WHERE hp.usuario_id = pu.id ORDER BY hp.fecha_registro DESC LIMIT 1) AS ultimo_peso,
        (SELECT hp.fecha_registro FROM historial_peso hp WHERE hp.usuario_id = pu.id ORDER BY hp.fecha_registro DESC LIMIT 1) AS fecha_ultimo_peso,
        (SELECT ou.peso_objetivo FROM objetivo_usuario ou WHERE ou.usuario_id = pu.id AND ou.vigente = TRUE ORDER BY ou.fecha_establecido DESC LIMIT 1) AS objetivo_peso,
        (SELECT ou.nivel_actividad::VARCHAR FROM objetivo_usuario ou WHERE ou.usuario_id = pu.id AND ou.vigente = TRUE ORDER BY ou.fecha_establecido DESC LIMIT 1) AS nivel_actividad
    FROM perfil_usuario pu
    INNER JOIN cuentas c ON pu.cuenta_id = c.id
    LEFT JOIN perfil_doctor pd ON pu.doctor_id = pd.id
    ORDER BY pu.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Obtener detalles completos de un paciente
CREATE OR REPLACE FUNCTION sp_get_patient_details(p_patient_id UUID)
RETURNS TABLE (
    -- Datos basicos
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    genero VARCHAR,
    fecha_nacimiento DATE,
    edad INTEGER,
    altura NUMERIC,
    telefono VARCHAR,
    doctor_id UUID,
    doctor_nombre VARCHAR,
    cuenta_activa BOOLEAN,
    -- Estadisticas de peso
    peso_actual NUMERIC,
    peso_objetivo NUMERIC,
    peso_inicial NUMERIC,
    cambio_peso NUMERIC,
    -- Objetivos
    nivel_actividad VARCHAR,
    calorias_objetivo INTEGER,
    -- Conteos de registros
    total_registros_comida BIGINT,
    total_actividades_fisicas BIGINT,
    total_recomendaciones BIGINT,
    -- Alergias y condiciones
    alergias TEXT[],
    condiciones_medicas TEXT[],
    medicamentos TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.nombre,
        c.email,
        pu.genero::VARCHAR,
        pu.fecha_nacimiento,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pu.fecha_nacimiento))::INTEGER AS edad,
        pu.altura,
        pu.telefono,
        pu.doctor_id,
        pd.nombre AS doctor_nombre,
        c.activa AS cuenta_activa,
        -- Peso
        (SELECT hp.peso FROM historial_peso hp WHERE hp.usuario_id = pu.id ORDER BY hp.fecha_registro DESC LIMIT 1) AS peso_actual,
        (SELECT ou.peso_objetivo FROM objetivo_usuario ou WHERE ou.usuario_id = pu.id AND ou.vigente = TRUE ORDER BY ou.fecha_establecido DESC LIMIT 1) AS peso_objetivo,
        (SELECT hp.peso FROM historial_peso hp WHERE hp.usuario_id = pu.id ORDER BY hp.fecha_registro ASC LIMIT 1) AS peso_inicial,
        COALESCE(
            (SELECT hp1.peso FROM historial_peso hp1 WHERE hp1.usuario_id = pu.id ORDER BY hp1.fecha_registro DESC LIMIT 1) -
            (SELECT hp2.peso FROM historial_peso hp2 WHERE hp2.usuario_id = pu.id ORDER BY hp2.fecha_registro ASC LIMIT 1),
            0
        ) AS cambio_peso,
        -- Objetivos
        (SELECT ou.nivel_actividad::VARCHAR FROM objetivo_usuario ou WHERE ou.usuario_id = pu.id AND ou.vigente = TRUE ORDER BY ou.fecha_establecido DESC LIMIT 1) AS nivel_actividad,
        (SELECT ou.calorias_objetivo FROM objetivo_usuario ou WHERE ou.usuario_id = pu.id AND ou.vigente = TRUE ORDER BY ou.fecha_establecido DESC LIMIT 1) AS calorias_objetivo,
        -- Conteos
        (SELECT COUNT(*)::BIGINT FROM registro_comida rc WHERE rc.usuario_id = pu.id) AS total_registros_comida,
        (SELECT COUNT(*)::BIGINT FROM actividad_fisica af WHERE af.usuario_id = pu.id) AS total_actividades_fisicas,
        (SELECT COUNT(*)::BIGINT FROM recomendacion r WHERE r.usuario_id = pu.id) AS total_recomendaciones,
        -- Alergias y condiciones
        COALESCE(ARRAY(SELECT a.nombre FROM alergias a WHERE a.usuario_id = pu.id), ARRAY[]::TEXT[]) AS alergias,
        COALESCE(ARRAY(SELECT cm.nombre FROM condiciones_medicas cm WHERE cm.usuario_id = pu.id), ARRAY[]::TEXT[]) AS condiciones_medicas,
        COALESCE(ARRAY(SELECT m.nombre FROM medicamentos m WHERE m.usuario_id = pu.id), ARRAY[]::TEXT[]) AS medicamentos
    FROM perfil_usuario pu
    INNER JOIN cuentas c ON pu.cuenta_id = c.id
    LEFT JOIN perfil_doctor pd ON pu.doctor_id = pd.id
    WHERE pu.id = p_patient_id;
END;
$$ LANGUAGE plpgsql;

-- Actualizar doctor asignado a un paciente
CREATE OR REPLACE FUNCTION sp_update_patient_doctor(
    p_patient_id UUID,
    p_doctor_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE perfil_usuario
    SET doctor_id = p_doctor_id
    WHERE id = p_patient_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Activar/Desactivar paciente (toggle de estado de cuenta)
CREATE OR REPLACE FUNCTION sp_toggle_patient_status(p_patient_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_cuenta_id UUID;
BEGIN
    -- Obtener cuenta_id del paciente
    SELECT cuenta_id INTO v_cuenta_id
    FROM perfil_usuario
    WHERE id = p_patient_id;
    
    IF v_cuenta_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Hacer toggle del estado de la cuenta
    UPDATE cuentas
    SET activa = NOT activa
    WHERE id = v_cuenta_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PROCEDIMIENTOS PARA DOCTORES
-- ========================================

-- Obtener todos los doctores con informacion detallada
CREATE OR REPLACE FUNCTION sp_get_all_doctors()
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    especialidad VARCHAR,
    cedula_profesional VARCHAR,
    telefono VARCHAR,
    cuenta_activa BOOLEAN,
    created_at TIMESTAMP,
    total_pacientes BIGINT,
    pacientes_activos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pd.id,
        pd.nombre,
        c.email,
        pd.especialidad,
        pd.cedula_profesional,
        pd.telefono,
        c.activa AS cuenta_activa,
        pd.created_at,
        COUNT(pu.id) AS total_pacientes,
        COUNT(pu.id) FILTER (WHERE cu.activa = TRUE) AS pacientes_activos
    FROM perfil_doctor pd
    INNER JOIN cuentas c ON pd.cuenta_id = c.id
    LEFT JOIN perfil_usuario pu ON pd.id = pu.doctor_id
    LEFT JOIN cuentas cu ON pu.cuenta_id = cu.id
    GROUP BY pd.id, pd.nombre, c.email, pd.especialidad, pd.cedula_profesional, pd.telefono, c.activa, pd.created_at
    ORDER BY pd.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Obtener pacientes de un doctor especifico
CREATE OR REPLACE FUNCTION sp_get_doctor_patients(p_doctor_id UUID)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    genero VARCHAR,
    edad INTEGER,
    telefono VARCHAR,
    cuenta_activa BOOLEAN,
    ultima_actividad TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.nombre,
        c.email,
        pu.genero::VARCHAR,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pu.fecha_nacimiento))::INTEGER AS edad,
        pu.telefono,
        c.activa AS cuenta_activa,
        GREATEST(
            (SELECT MAX(rc.fecha) FROM registro_comida rc WHERE rc.usuario_id = pu.id),
            (SELECT MAX(af.fecha) FROM actividad_fisica af WHERE af.usuario_id = pu.id)
        ) AS ultima_actividad
    FROM perfil_usuario pu
    INNER JOIN cuentas c ON pu.cuenta_id = c.id
    WHERE pu.doctor_id = p_doctor_id
    ORDER BY pu.nombre;
END;
$$ LANGUAGE plpgsql;

-- Crear nuevo doctor
CREATE OR REPLACE FUNCTION sp_create_doctor(
    p_nombre VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_especialidad VARCHAR,
    p_cedula_profesional VARCHAR,
    p_telefono VARCHAR,
    p_admin_cuenta_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_cuenta_id UUID;
    v_doctor_id UUID;
    v_admin_id UUID;
BEGIN
    -- Obtener perfil_admin.id desde la cuenta_id del admin
    SELECT id INTO v_admin_id
    FROM perfil_admin
    WHERE cuenta_id = p_admin_cuenta_id;
    
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Perfil de administrador no encontrado para cuenta_id: %', p_admin_cuenta_id;
    END IF;
    
    -- Crear cuenta para el doctor
    INSERT INTO cuentas (email, password_hash, tipo_cuenta, activa)
    VALUES (p_email, p_password, 'doctor', TRUE)
    RETURNING id INTO v_cuenta_id;
    
    -- Crear perfil de doctor
    INSERT INTO perfil_doctor (cuenta_id, admin_id, nombre, especialidad, cedula_profesional, telefono)
    VALUES (v_cuenta_id, v_admin_id, p_nombre, p_especialidad, p_cedula_profesional, p_telefono)
    RETURNING id INTO v_doctor_id;
    
    RETURN v_doctor_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PROCEDIMIENTOS PARA ADMINISTRADORES
-- ========================================

-- Obtener todos los administradores
CREATE OR REPLACE FUNCTION sp_get_all_admins()
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    cuenta_activa BOOLEAN,
    created_at TIMESTAMP,
    total_doctores_creados BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        pa.nombre,
        c.email,
        c.activa AS cuenta_activa,
        pa.created_at,
        COUNT(pd.id) AS total_doctores_creados
    FROM perfil_admin pa
    INNER JOIN cuentas c ON pa.cuenta_id = c.id
    LEFT JOIN perfil_doctor pd ON pa.id = pd.admin_id
    GROUP BY pa.id, pa.nombre, c.email, c.activa, pa.created_at
    ORDER BY pa.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Obtener detalles de un administrador
CREATE OR REPLACE FUNCTION sp_get_admin_details(p_email VARCHAR)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    cuenta_activa BOOLEAN,
    created_at TIMESTAMP,
    total_doctores_creados BIGINT,
    doctores_activos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        pa.nombre,
        c.email,
        c.activa AS cuenta_activa,
        pa.created_at,
        COUNT(pd.id) AS total_doctores_creados,
        COUNT(pd.id) FILTER (WHERE cd.activa = TRUE) AS doctores_activos
    FROM perfil_admin pa
    INNER JOIN cuentas c ON pa.cuenta_id = c.id
    LEFT JOIN perfil_doctor pd ON pa.id = pd.admin_id
    LEFT JOIN cuentas cd ON pd.cuenta_id = cd.id
    WHERE c.email = p_email
    GROUP BY pa.id, pa.nombre, c.email, c.activa, pa.created_at;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PROCEDIMIENTOS PARA DASHBOARD (ESTADISTICAS)
-- ========================================

-- Obtener estadisticas generales para el dashboard
CREATE OR REPLACE FUNCTION sp_get_dashboard_stats()
RETURNS TABLE (
    total_admins BIGINT,
    total_doctores BIGINT,
    total_pacientes BIGINT,
    pacientes_activos BIGINT,
    nuevos_pacientes_semana BIGINT,
    nuevos_doctores_semana BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM perfil_admin) AS total_admins,
        (SELECT COUNT(*) FROM perfil_doctor) AS total_doctores,
        (SELECT COUNT(*) FROM perfil_usuario) AS total_pacientes,
        (SELECT COUNT(*) FROM perfil_usuario pu INNER JOIN cuentas c ON pu.cuenta_id = c.id WHERE c.activa = TRUE) AS pacientes_activos,
        (SELECT COUNT(*) FROM perfil_usuario WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS nuevos_pacientes_semana,
        (SELECT COUNT(*) FROM perfil_doctor WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS nuevos_doctores_semana;
END;
$$ LANGUAGE plpgsql;

-- Obtener distribucion de pacientes por genero
CREATE OR REPLACE FUNCTION sp_get_patients_by_gender()
RETURNS TABLE (
    masculino BIGINT,
    femenino BIGINT,
    otro BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE genero = 'M') AS masculino,
        COUNT(*) FILTER (WHERE genero = 'F') AS femenino,
        COUNT(*) FILTER (WHERE genero = 'O') AS otro
    FROM perfil_usuario;
END;
$$ LANGUAGE plpgsql;

-- Obtener registros recientes (ultimos pacientes y doctores)
CREATE OR REPLACE FUNCTION sp_get_recent_registrations()
RETURNS TABLE (
    tipo VARCHAR,
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    (
        SELECT 
            'paciente'::VARCHAR AS tipo,
            pu.id,
            pu.nombre,
            c.email,
            pu.created_at
        FROM perfil_usuario pu
        INNER JOIN cuentas c ON pu.cuenta_id = c.id
        ORDER BY pu.created_at DESC
        LIMIT 5
    )
    UNION ALL
    (
        SELECT 
            'doctor'::VARCHAR AS tipo,
            pd.id,
            pd.nombre,
            c.email,
            pd.created_at
        FROM perfil_doctor pd
        INNER JOIN cuentas c ON pd.cuenta_id = c.id
        ORDER BY pd.created_at DESC
        LIMIT 5
    )
    ORDER BY created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS Y DOCUMENTACION
-- ========================================
COMMENT ON FUNCTION sp_get_all_patients() IS 'Obtiene listado completo de pacientes con informacion resumida';
COMMENT ON FUNCTION sp_get_patient_details(UUID) IS 'Obtiene detalles completos de un paciente especifico';
COMMENT ON FUNCTION sp_update_patient_doctor(UUID, UUID) IS 'Actualiza el doctor asignado a un paciente';
COMMENT ON FUNCTION sp_toggle_patient_status(UUID) IS 'Activa o desactiva la cuenta de un paciente (toggle)';
COMMENT ON FUNCTION sp_get_all_doctors() IS 'Obtiene listado completo de doctores con estadisticas';
COMMENT ON FUNCTION sp_get_doctor_patients(UUID) IS 'Obtiene pacientes asignados a un doctor';
COMMENT ON FUNCTION sp_create_doctor(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) IS 'Crea un nuevo doctor con su cuenta (recibe cuenta_id del admin)';
COMMENT ON FUNCTION sp_get_all_admins() IS 'Obtiene listado completo de administradores';
COMMENT ON FUNCTION sp_get_admin_details(VARCHAR) IS 'Obtiene detalles de un administrador especifico';
COMMENT ON FUNCTION sp_get_dashboard_stats() IS 'Obtiene estadisticas generales para el dashboard';
COMMENT ON FUNCTION sp_get_patients_by_gender() IS 'Obtiene distribucion de pacientes por genero';
COMMENT ON FUNCTION sp_get_recent_registrations() IS 'Obtiene ultimos pacientes y doctores registrados';

