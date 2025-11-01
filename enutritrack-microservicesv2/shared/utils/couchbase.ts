// shared/utils/couchbase.ts
import couchbase from 'couchbase';

// Configuración de Couchbase
const couchbaseConfig = {
    connectionString: 'couchbase://localhost',
    username: 'Alfredo',
    password: 'alfredo124',
    bucketName: 'enutritrack'
};

// Clúster y bucket
let cluster: couchbase.Cluster;
let bucket: couchbase.Bucket;
let collection: couchbase.Collection;

/**
 * Conecta a Couchbase
 */
export const connectToCouchbase = async (): Promise<void> => {
    try {
        cluster = await couchbase.connect(couchbaseConfig.connectionString, {
            username: couchbaseConfig.username,
            password: couchbaseConfig.password
        });

        bucket = cluster.bucket(couchbaseConfig.bucketName);
        collection = bucket.defaultCollection();

        console.log('✅ Conectado a Couchbase');
    } catch (error) {
        console.error('❌ Error conectando a Couchbase:', error);
        throw error;
    }
};

/**
 * Obtiene la colección por defecto
 */
export const getCollection = (): couchbase.Collection => {
    if (!collection) {
        throw new Error('Couchbase no está conectado');
    }
    return collection;
};

/**
 * Obtiene el bucket
 */
export const getBucket = (): couchbase.Bucket => {
    if (!bucket) {
        throw new Error('Couchbase no está conectado');
    }
    return bucket;
};

/**
 * Obtiene el clúster
 */
export const getCluster = (): couchbase.Cluster => {
    if (!cluster) {
        throw new Error('Couchbase no está conectado');
    }
    return cluster;
};

/**
 * Operaciones básicas de CRUD
 */
export const couchbaseUtils = {
    /**
     * Inserta un documento
     */
    insert: async (key: string, document: any): Promise<void> => {
        const col = getCollection();
        await col.insert(key, document);
    },

    /**
     * Obtiene un documento
     */
    get: async (key: string): Promise<any> => {
        const col = getCollection();
        const result = await col.get(key);
        return result.content;
    },

    /**
     * Actualiza un documento
     */
    update: async (key: string, document: any): Promise<void> => {
        const col = getCollection();
        await col.upsert(key, document);
    },

    /**
     * Elimina un documento
     */
    remove: async (key: string): Promise<void> => {
        const col = getCollection();
        await col.remove(key);
    },

    /**
     * Ejecuta una consulta N1QL
     */
    query: async (query: string, parameters: any = {}): Promise<any[]> => {
        const cluster = getCluster();
        const result = await cluster.query(query, { parameters });
        return result.rows;
    },

    /**
     * Busca documentos por campo
     */
    findByField: async (field: string, value: any, limit: number = 100): Promise<any[]> => {
        const query = `
            SELECT * FROM \`${couchbaseConfig.bucketName}\` 
            WHERE ${field} = $1
            LIMIT $2
        `;
        return await couchbaseUtils.query(query, [value, limit]);
    },

    /**
     * Busca documentos por múltiples campos
     */
    findByFields: async (conditions: { [key: string]: any }, limit: number = 100): Promise<any[]> => {
        const whereClause = Object.keys(conditions)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');

        const query = `
            SELECT * FROM \`${couchbaseConfig.bucketName}\` 
            WHERE ${whereClause}
            LIMIT $${Object.keys(conditions).length + 1}
        `;

        const parameters = [...Object.values(conditions), limit];
        return await couchbaseUtils.query(query, parameters);
    }
};

/**
 * Funciones específicas para el dominio de salud
 */
export const healthcareQueries = {
    // Consultas para pacientes
    getPatientByEmail: async (email: string): Promise<any> => {
        const query = `
            SELECT p.*, 
                   g.nombre as genero_nombre,
                   d.nombre as doctor_nombre
            FROM \`${couchbaseConfig.bucketName}\` p
            LEFT JOIN \`${couchbaseConfig.bucketName}\` g ON KEYS p.genero_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` d ON KEYS p.doctor_id
            WHERE p.type = 'patient' 
            AND p.email = $1
            LIMIT 1
        `;
        const results = await couchbaseUtils.query(query, [email]);
        return results[0] || null;
    },

    getPatientsByDoctor: async (doctorId: string, page: number = 1, limit: number = 10): Promise<any[]> => {
        const offset = (page - 1) * limit;
        const query = `
            SELECT p.*, 
                   g.nombre as genero_nombre
            FROM \`${couchbaseConfig.bucketName}\` p
            LEFT JOIN \`${couchbaseConfig.bucketName}\` g ON KEYS p.genero_id
            WHERE p.type = 'patient' 
            AND p.doctor_id = $1
            ORDER BY p.nombre
            LIMIT $2 OFFSET $3
        `;
        return await couchbaseUtils.query(query, [doctorId, limit, offset]);
    },

    // Consultas para doctores
    getDoctorByEmail: async (email: string): Promise<any> => {
        const query = `
            SELECT d.*, 
                   e.nombre as especialidad_nombre
            FROM \`${couchbaseConfig.bucketName}\` d
            LEFT JOIN \`${couchbaseConfig.bucketName}\` e ON KEYS d.especialidad_id
            WHERE d.type = 'doctor' 
            AND d.email = $1
            LIMIT 1
        `;
        const results = await couchbaseUtils.query(query, [email]);
        return results[0] || null;
    },

    // Consultas para citas
    getAppointmentsByDoctor: async (doctorId: string, date?: string): Promise<any[]> => {
        let query = `
            SELECT a.*,
                   p.nombre as paciente_nombre,
                   p.telefono as paciente_telefono,
                   tc.nombre as tipo_consulta_nombre,
                   ec.nombre as estado_cita_nombre
            FROM \`${couchbaseConfig.bucketName}\` a
            LEFT JOIN \`${couchbaseConfig.bucketName}\` p ON KEYS a.usuario_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` tc ON KEYS a.tipo_consulta_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` ec ON KEYS a.estado_cita_id
            WHERE a.type = 'appointment'
            AND a.doctor_id = $1
        `;

        const parameters: any[] = [doctorId];

        if (date) {
            query += ` AND DATE(a.fecha_hora_programada) = $2`;
            parameters.push(date);
        }

        query += ` ORDER BY a.fecha_hora_programada`;

        return await couchbaseUtils.query(query, parameters);
    },

    // Consultas para alertas
    getAlertsByDoctor: async (doctorId: string, estado?: string): Promise<any[]> => {
        let query = `
            SELECT al.*,
                   p.nombre as paciente_nombre,
                   ta.nombre as tipo_alerta_nombre,
                   npa.nombre as nivel_prioridad_nombre,
                   ea.nombre as estado_alerta_nombre
            FROM \`${couchbaseConfig.bucketName}\` al
            LEFT JOIN \`${couchbaseConfig.bucketName}\` p ON KEYS al.usuario_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` ta ON KEYS al.tipo_alerta_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` npa ON KEYS al.nivel_prioridad_id
            LEFT JOIN \`${couchbaseConfig.bucketName}\` ea ON KEYS al.estado_alerta_id
            WHERE al.type = 'alert'
            AND al.doctor_id = $1
        `;

        const parameters: any[] = [doctorId];

        if (estado) {
            query += ` AND al.estado_alerta_id = $2`;
            parameters.push(estado);
        }

        query += ` ORDER BY al.fecha_deteccion DESC`;

        return await couchbaseUtils.query(query, parameters);
    }
};

// Inicializar la conexión al importar
connectToCouchbase().catch(console.error);