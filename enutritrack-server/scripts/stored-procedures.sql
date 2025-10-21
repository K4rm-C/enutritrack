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
    email_1 VARCHAR,
    email_2 VARCHAR,
    genero VARCHAR,
    fecha_nacimiento DATE,
    edad INTEGER,
    altura NUMERIC,
    telefono VARCHAR,
    telefono_1 VARCHAR,
    telefono_2 VARCHAR,
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
        c.email_1,
        c.email_2,
        g.nombre AS genero,
        pu.fecha_nacimiento,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pu.fecha_nacimiento))::INTEGER AS edad,
        pu.altura,
        pu.telefono,
        pu.telefono_1,
        pu.telefono_2,
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
    LEFT JOIN generos g ON pu.genero_id = g.id
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
DECLARE
    v_rows_affected INTEGER;
BEGIN
    -- Verificar que el paciente existe
    IF NOT EXISTS (SELECT 1 FROM perfil_usuario WHERE id = p_patient_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que el doctor existe (si se proporciona un doctor_id)
    IF p_doctor_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM perfil_doctor WHERE id = p_doctor_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar el doctor del paciente
    UPDATE perfil_usuario
    SET doctor_id = p_doctor_id
    WHERE id = p_patient_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    -- Retornar true si se afectó al menos una fila
    RETURN v_rows_affected > 0;
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

-- Actualizar información de un doctor
CREATE OR REPLACE FUNCTION sp_update_doctor(
    p_doctor_id UUID,
    p_nombre VARCHAR,
    p_cedula_profesional VARCHAR,
    p_especialidad_id UUID,
    p_telefono VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_rows_affected INTEGER;
BEGIN
    -- Verificar que el doctor existe
    IF NOT EXISTS (SELECT 1 FROM perfil_doctor WHERE id = p_doctor_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que la especialidad existe (si se proporciona una especialidad_id y no es NULL)
    IF p_especialidad_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM especialidades WHERE id = p_especialidad_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar todos los campos del doctor
    UPDATE perfil_doctor
    SET 
        nombre = p_nombre,
        cedula_profesional = p_cedula_profesional,
        especialidad_id = p_especialidad_id,
        telefono = p_telefono
    WHERE id = p_doctor_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    -- Retornar true si se afectó al menos una fila
    RETURN v_rows_affected > 0;
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
    email_1 VARCHAR,
    email_2 VARCHAR,
    especialidad VARCHAR,
    cedula_profesional VARCHAR,
    telefono VARCHAR,
    telefono_1 VARCHAR,
    telefono_2 VARCHAR,
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
        c.email_1,
        c.email_2,
        e.nombre AS especialidad,
        pd.cedula_profesional,
        pd.telefono,
        pd.telefono_1,
        pd.telefono_2,
        c.activa AS cuenta_activa,
        pd.created_at,
        COUNT(pu.id) AS total_pacientes,
        COUNT(pu.id) FILTER (WHERE cu.activa = TRUE) AS pacientes_activos
    FROM perfil_doctor pd
    INNER JOIN cuentas c ON pd.cuenta_id = c.id
    LEFT JOIN especialidades e ON pd.especialidad_id = e.id
    LEFT JOIN perfil_usuario pu ON pd.id = pu.doctor_id
    LEFT JOIN cuentas cu ON pu.cuenta_id = cu.id
    GROUP BY pd.id, pd.nombre, c.email, c.email_1, c.email_2, e.nombre, pd.cedula_profesional, pd.telefono, pd.telefono_1, pd.telefono_2, c.activa, pd.created_at
    ORDER BY pd.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Obtener pacientes de un doctor especifico
CREATE OR REPLACE FUNCTION sp_get_doctor_patients(p_doctor_id UUID)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    email VARCHAR,
    email_1 VARCHAR,
    email_2 VARCHAR,
    genero VARCHAR,
    edad INTEGER,
    telefono VARCHAR,
    telefono_1 VARCHAR,
    telefono_2 VARCHAR,
    cuenta_activa BOOLEAN,
    ultima_actividad TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.nombre,
        c.email,
        c.email_1,
        c.email_2,
        g.nombre AS genero,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pu.fecha_nacimiento))::INTEGER AS edad,
        pu.telefono,
        pu.telefono_1,
        pu.telefono_2,
        c.activa AS cuenta_activa,
        GREATEST(
            (SELECT MAX(rc.fecha) FROM registro_comida rc WHERE rc.usuario_id = pu.id),
            (SELECT MAX(af.fecha) FROM actividad_fisica af WHERE af.usuario_id = pu.id)
        ) AS ultima_actividad
    FROM perfil_usuario pu
    INNER JOIN cuentas c ON pu.cuenta_id = c.id
    LEFT JOIN generos g ON pu.genero_id = g.id
    WHERE pu.doctor_id = p_doctor_id
    ORDER BY pu.nombre;
END;
$$ LANGUAGE plpgsql;

-- Eliminar función anterior si existe (para cambiar nombre del parámetro)
DROP FUNCTION IF EXISTS sp_create_doctor(VARCHAR, VARCHAR, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID);

-- Crear nuevo doctor
CREATE OR REPLACE FUNCTION sp_create_doctor(
    p_nombre VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_especialidad_id UUID,
    p_cedula_profesional VARCHAR,
    p_telefono VARCHAR,
    p_telefono_1 VARCHAR,
    p_telefono_2 VARCHAR,
    p_admin_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_cuenta_id UUID;
    v_doctor_id UUID;
BEGIN
    -- Verificar que el admin existe
    IF NOT EXISTS (SELECT 1 FROM perfil_admin WHERE id = p_admin_id) THEN
        RAISE EXCEPTION 'Perfil de administrador no encontrado para admin_id: %', p_admin_id;
    END IF;
    
    -- Crear cuenta para el doctor
    INSERT INTO cuentas (email, password_hash, tipo_cuenta, activa)
    VALUES (p_email, p_password, 'doctor', TRUE)
    RETURNING id INTO v_cuenta_id;
    
    -- Crear perfil de doctor usando directamente el admin_id
    INSERT INTO perfil_doctor (cuenta_id, admin_id, nombre, especialidad_id, cedula_profesional, telefono, telefono_1, telefono_2)
    VALUES (v_cuenta_id, p_admin_id, p_nombre, p_especialidad_id, p_cedula_profesional, p_telefono, p_telefono_1, p_telefono_2)
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

CREATE OR REPLACE FUNCTION obtener_historial_medico_completo(
    p_usuario_id UUID
)
RETURNS TABLE(
    usuario_nombre VARCHAR,
    usuario_email VARCHAR,
    condiciones JSONB,
    alergias JSONB,
    medicamentos JSONB,
    fecha_actualizacion TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.nombre AS usuario_nombre, u.email AS usuario_email, hm.condiciones, hm.alergias, hm.medicamentos, hm.updated_at AS fecha_actualizacion
    FROM historial_medico hm
    JOIN users u ON hm."usuarioId" = u.id
    WHERE hm."usuarioId" = p_usuario_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION analisis_progreso_peso(
    p_usuario_id UUID
)
RETURNS TABLE(
    peso_actual NUMERIC,
    objetivo_peso NUMERIC,
    diferencia_peso NUMERIC,
    recomendaciones_activas BIGINT,
    ultima_recomendacion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.peso_actual, u.objetivo_peso, (u.peso_actual - u.objetivo_peso) AS diferencia_peso, COUNT(r.id) AS recomendaciones_activas, MAX(r.contenido) AS ultima_recomendacion
    FROM users u
    LEFT JOIN recomendacion r ON u.id = r.usuario_id AND r.activa = true
    WHERE u.id = p_usuario_id
    GROUP BY u.id, u.peso_actual, u.objetivo_peso;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reporte_consumo_mensual(
    p_usuario_id UUID,
    p_mes INTEGER,
    p_ano INTEGER
)
RETURNS TABLE(
    tipo_comida registro_comida_tipo_enum,
    total_comidas BIGINT,
    promedio_calorias NUMERIC,
    total_proteinas NUMERIC,
    total_carbohidratos NUMERIC,
    total_grasas NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT rc.tipo_comida, COUNT(rc.id) AS total_comidas, AVG(rc.calorias) AS promedio_calorias, SUM(rc.proteinas_g) AS total_proteinas, SUM(rc.carbohidratos_g) AS total_carbohidratos, SUM(rc.grasas_g) AS total_grasas
    FROM registro_comida rc
    WHERE rc."usuarioId" = p_usuario_id
        AND EXTRACT(MONTH FROM rc.fecha) = p_mes
        AND EXTRACT(YEAR FROM rc.fecha) = p_ano
    GROUP BY rc.tipo_comida
    ORDER BY total_comidas DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dashboard_estadisticas_generales(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    total_usuarios BIGINT,
    total_doctores BIGINT,
    total_comidas_registradas BIGINT,
    total_actividades_registradas BIGINT,
    promedio_calorias_diarias NUMERIC,
    usuario_mas_activo VARCHAR,
    comida_mas_comun registro_comida_tipo_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) AS total_usuarios,
        (SELECT COUNT(*) FROM doctors) AS total_doctores,
        COUNT(rc.id) AS total_comidas_registradas,
        COUNT(af.id) AS total_actividades_registradas,
        AVG(rc.calorias) AS promedio_calorias_diarias,
        (SELECT u.nombre FROM users u 
         JOIN actividad_fisica af ON u.id = af."usuarioId" 
         WHERE DATE(af.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
         GROUP BY u.id, u.nombre 
         ORDER BY COUNT(af.id) DESC 
         LIMIT 1) AS usuario_mas_activo,
        (SELECT rc2.tipo_comida FROM registro_comida rc2
         WHERE DATE(rc2.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
         GROUP BY rc2.tipo_comida
         ORDER BY COUNT(*) DESC
         LIMIT 1) AS comida_mas_comun
    FROM registro_comida rc
    CROSS JOIN actividad_fisica af
    WHERE DATE(rc.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
        AND DATE(af.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_usuarios_por_patron_medico(
    p_patron_medico TEXT
)
RETURNS TABLE(
    usuario_id UUID,
    usuario_nombre VARCHAR,
    usuario_email VARCHAR,
    condiciones JSONB,
    alergias JSONB,
    medicamentos JSONB,
    doctor_asignado VARCHAR,
    ultima_actualizacion TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id AS usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email, hm.condiciones, hm.alergias, hm.medicamentos, d.nombre AS doctor_asignado, hm.updated_at AS ultima_actualizacion
    FROM users u
    JOIN historial_medico hm ON u.id = hm."usuarioId"
    LEFT JOIN doctors d ON u.doctor_id = d.id
    WHERE hm.condiciones::TEXT ILIKE '%' || p_patron_medico || '%'
        OR hm.alergias::TEXT ILIKE '%' || p_patron_medico || '%'
        OR hm.medicamentos::TEXT ILIKE '%' || p_patron_medico || '%'
    ORDER BY hm.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_usuarios_por_perfil(
    p_patron_nombre TEXT DEFAULT NULL,
    p_nivel_actividad nivel_actividad_enum DEFAULT NULL,
    p_genero VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    usuario_id UUID,
    nombre VARCHAR,
    email VARCHAR,
    fecha_nacimiento DATE,
    genero VARCHAR,
    nivel_actividad nivel_actividad_enum,
    peso_actual NUMERIC,
    objetivo_peso NUMERIC,
    doctor_asignado VARCHAR,
    total_comidas_registradas BIGINT,
    total_actividades_registradas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id AS usuario_id, u.nombre, u.email, u.fecha_nacimiento, u.genero, u.nivel_actividad, u.peso_actual, u.objetivo_peso, d.nombre AS doctor_asignado,
        COUNT(rc.id) AS total_comidas_registradas,
        COUNT(af.id) AS total_actividades_registradas
    FROM users u
    LEFT JOIN doctors d ON u.doctor_id = d.id
    LEFT JOIN registro_comida rc ON u.id = rc."usuarioId"
    LEFT JOIN actividad_fisica af ON u.id = af."usuarioId"
    WHERE (p_patron_nombre IS NULL OR u.nombre ILIKE '%' || p_patron_nombre || '%')
        AND (p_nivel_actividad IS NULL OR u.nivel_actividad = p_nivel_actividad)
        AND (p_genero IS NULL OR u.genero = p_genero)
    GROUP BY u.id, u.nombre, u.email, u.fecha_nacimiento, u.genero, u.nivel_actividad, 
             u.peso_actual, u.objetivo_peso, d.nombre
    ORDER BY u.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_staff_por_patron(
    p_patron_nombre TEXT
)
RETURNS TABLE(
    tipo_staff TEXT,
    staff_id UUID,
    nombre VARCHAR,
    email VARCHAR,
    fecha_creacion TIMESTAMP,
    total_usuarios_asignados BIGINT,
    doctor_admin VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'ADMIN' AS tipo_staff, a.id AS staff_id, a.nombre, a.email, a.created_at AS fecha_creacion, COUNT(d.id) AS total_usuarios_asignados, NULL AS doctor_admin
    FROM admins a
    LEFT JOIN doctors d ON a.id = d.admin_id
    WHERE a.nombre ILIKE '%' || p_patron_nombre || '%'
        OR a.email ILIKE '%' || p_patron_nombre || '%'
    GROUP BY a.id, a.nombre, a.email, a.created_at
    
    UNION ALL 
    SELECT 'DOCTOR' AS tipo_staff, d.id AS staff_id, d.nombre, d.email, d.created_at AS fecha_creacion, COUNT(u.id) AS total_usuarios_asignados, a.nombre AS doctor_admin
    FROM doctors d
    LEFT JOIN users u ON d.id = u.doctor_id
    LEFT JOIN admins a ON d.admin_id = a.id
    WHERE d.nombre ILIKE '%' || p_patron_nombre || '%'
        OR d.email ILIKE '%' || p_patron_nombre || '%'
    GROUP BY d.id, d.nombre, d.email, d.created_at, a.nombre
    ORDER BY tipo_staff, total_usuarios_asignados DESC;
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
COMMENT ON FUNCTION sp_create_doctor(VARCHAR, VARCHAR, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) IS 'Crea un nuevo doctor con su cuenta (recibe admin_id del perfil_admin)';
COMMENT ON FUNCTION sp_get_all_admins() IS 'Obtiene listado completo de administradores';
COMMENT ON FUNCTION sp_get_admin_details(VARCHAR) IS 'Obtiene detalles de un administrador especifico';
COMMENT ON FUNCTION sp_get_dashboard_stats() IS 'Obtiene estadisticas generales para el dashboard';
COMMENT ON FUNCTION sp_get_patients_by_gender() IS 'Obtiene distribucion de pacientes por genero';
COMMENT ON FUNCTION sp_get_recent_registrations() IS 'Obtiene ultimos pacientes y doctores registrados';

