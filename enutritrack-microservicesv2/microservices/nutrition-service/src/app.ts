// microservices/nutrition-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { RegistroComida } from '../../../shared/entities/RegistroComida';
import { RegistroComidaItem } from '../../../shared/entities/RegistroComidaItem';
import { Alimento } from '../../../shared/entities/Alimento';

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
    const dbHealth = await AppDataSource.query('SELECT 1').then(() => true).catch(() => false);
    res.json({ 
        status: 'OK', 
        service: 'nutrition-service',
        database: dbHealth ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Registro de comida del paciente
app.get('/api/nutrition/food-log', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { fecha, tipo_comida, page = 1, limit = 10 } = req.query;
        
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const registroRepo = AppDataSource.getRepository(RegistroComida);
        let queryBuilder = registroRepo
            .createQueryBuilder('registro')
            .leftJoinAndSelect('registro.items', 'items')
            .leftJoinAndSelect('items.alimento', 'alimento')
            .where('registro.usuarioId = :patientId', { patientId });

        // Filtrar por fecha
        if (fecha) {
            const fechaObj = new Date(fecha as string);
            const fechaInicio = new Date(fechaObj);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fechaObj);
            fechaFin.setHours(23, 59, 59, 999);
            
            queryBuilder = queryBuilder.andWhere('registro.fecha BETWEEN :fechaInicio AND :fechaFin', {
                fechaInicio,
                fechaFin
            });
        }

        // Filtrar por tipo de comida
        if (tipo_comida) {
            queryBuilder = queryBuilder.andWhere('registro.tipoComida = :tipoComida', {
                tipoComida: tipo_comida
            });
        }

        const [registros, total] = await queryBuilder
            .orderBy('registro.fecha', 'DESC')
            .skip(skip)
            .take(parseInt(limit as string))
            .getManyAndCount();

        const registrosResponse = registros.map(registro => ({
            id: registro.id,
            fecha: registro.fecha,
            tipo_comida: registro.tipoComida,
            notas: registro.notas,
            items: registro.items?.map(item => ({
                id: item.id,
                alimento: item.alimento ? {
                    id: item.alimento.id,
                    nombre: item.alimento.nombre,
                    descripcion: item.alimento.descripcion,
                    calorias_por_100g: item.alimento.caloriasPor100g,
                    proteinas_g_por_100g: item.alimento.proteinasGPor100g,
                    carbohidratos_g_por_100g: item.alimento.carbohidratosGPor100g,
                    grasas_g_por_100g: item.alimento.grasasGPor100g,
                    fibra_g_por_100g: item.alimento.fibraGPor100g,
                    categoria: item.alimento.categoria
                } : null,
                cantidad_gramos: item.cantidadGramos,
                calorias: item.calorias,
                proteinas_g: item.proteinasG,
                carbohidratos_g: item.carbohidratosG,
                grasas_g: item.grasasG,
                fibra_g: item.fibraG,
                notas: item.notas
            })),
            created_at: registro.createdAt,
            updated_at: registro.updatedAt
        }));

        ResponseHandler.paginated(res, registrosResponse, parseInt(page as string), parseInt(limit as string), total);

    } catch (error) {
        console.error('Error getting food log:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los registros de comida');
    }
});

// Crear registro de comida
app.post('/api/nutrition/food-log', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { fecha, tipo_comida, notas } = req.body;

        // Validar campos requeridos
        if (!tipo_comida) {
            return ResponseHandler.internalError(res, 'El tipo de comida es requerido');
        }

        const registroRepo = AppDataSource.getRepository(RegistroComida);
        
        const nuevoRegistro = new RegistroComida();
        nuevoRegistro.usuarioId = patientId;
        nuevoRegistro.fecha = fecha ? new Date(fecha) : new Date();
        nuevoRegistro.tipoComida = tipo_comida;
        nuevoRegistro.notas = notas || '';

        const registroGuardado = await registroRepo.save(nuevoRegistro);

        const responseData = {
            id: registroGuardado.id,
            fecha: registroGuardado.fecha,
            tipo_comida: registroGuardado.tipoComida,
            notas: registroGuardado.notas,
            created_at: registroGuardado.createdAt
        };

        ResponseHandler.created(res, responseData, 'Registro de comida creado exitosamente');

    } catch (error) {
        console.error('Error creating food log:', error);
        ResponseHandler.internalError(res, 'Error creando el registro de comida');
    }
});

// Agregar item a registro de comida
app.post('/api/nutrition/food-log/:logId/items', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.id;
        const { alimento_id, cantidad_gramos, notas } = req.body;

        // Validar campos requeridos
        if (!alimento_id || !cantidad_gramos) {
            return ResponseHandler.internalError(res, 'Alimento y cantidad son requeridos');
        }

        const registroRepo = AppDataSource.getRepository(RegistroComida);
        const alimentoRepo = AppDataSource.getRepository(Alimento);
        const itemRepo = AppDataSource.getRepository(RegistroComidaItem);

        // Verificar que el registro existe y pertenece al usuario
        const registro = await registroRepo.findOne({
            where: { 
                id: logId,
                usuarioId: patientId 
            }
        });

        if (!registro) {
            return ResponseHandler.notFound(res, 'Registro de comida no encontrado');
        }

        // Obtener información del alimento
        const alimento = await alimentoRepo.findOne({
            where: { id: alimento_id }
        });

        if (!alimento) {
            return ResponseHandler.notFound(res, 'Alimento no encontrado');
        }

        // Calcular valores nutricionales
        const factor = cantidad_gramos / 100;
        const calorias = alimento.caloriasPor100g * factor;
        const proteinas_g = alimento.proteinasGPor100g * factor;
        const carbohidratos_g = alimento.carbohidratosGPor100g * factor;
        const grasas_g = alimento.grasasGPor100g * factor;
        const fibra_g = alimento.fibraGPor100g ? alimento.fibraGPor100g * factor : null;

        // Crear nuevo item
        const nuevoItem = new RegistroComidaItem();
        nuevoItem.registroComidaId = logId;
        nuevoItem.alimentoId = alimento_id;
        nuevoItem.cantidadGramos = cantidad_gramos;
        nuevoItem.calorias = Math.round(calorias * 100) / 100;
        nuevoItem.proteinasG = Math.round(proteinas_g * 100) / 100;
        nuevoItem.carbohidratosG = Math.round(carbohidratos_g * 100) / 100;
        nuevoItem.grasasG = Math.round(grasas_g * 100) / 100;
        nuevoItem.fibraG = fibra_g ? Math.round(fibra_g * 100) / 100 : undefined;
        nuevoItem.notas = notas || '';

        const itemGuardado = await itemRepo.save(nuevoItem);

        // Obtener item con relaciones para la respuesta
        const itemCompleto = await itemRepo.findOne({
            where: { id: itemGuardado.id },
            relations: ['alimento']
        });

        const responseData = {
            id: itemCompleto!.id,
            alimento: itemCompleto!.alimento ? {
                id: itemCompleto!.alimento.id,
                nombre: itemCompleto!.alimento.nombre,
                descripcion: itemCompleto!.alimento.descripcion,
                calorias_por_100g: itemCompleto!.alimento.caloriasPor100g,
                proteinas_g_por_100g: itemCompleto!.alimento.proteinasGPor100g,
                carbohidratos_g_por_100g: itemCompleto!.alimento.carbohidratosGPor100g,
                grasas_g_por_100g: itemCompleto!.alimento.grasasGPor100g,
                fibra_g_por_100g: itemCompleto!.alimento.fibraGPor100g,
                categoria: itemCompleto!.alimento.categoria
            } : null,
            cantidad_gramos: itemCompleto!.cantidadGramos,
            calorias: itemCompleto!.calorias,
            proteinas_g: itemCompleto!.proteinasG,
            carbohidratos_g: itemCompleto!.carbohidratosG,
            grasas_g: itemCompleto!.grasasG,
            fibra_g: itemCompleto!.fibraG,
            notas: itemCompleto!.notas,
            created_at: itemCompleto!.createdAt
        };

        ResponseHandler.created(res, responseData, 'Item de comida agregado exitosamente');

    } catch (error) {
        console.error('Error adding food item:', error);
        ResponseHandler.internalError(res, 'Error agregando el item de comida');
    }
});

// Eliminar item de registro de comida
app.delete('/api/nutrition/food-log/items/:itemId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { itemId } = req.params;
        const patientId = req.user.id;

        const itemRepo = AppDataSource.getRepository(RegistroComidaItem);
        const registroRepo = AppDataSource.getRepository(RegistroComida);

        // Verificar que el item existe y pertenece al usuario
        const item = await itemRepo.findOne({
            where: { id: itemId },
            relations: ['registroComida']
        });

        if (!item) {
            return ResponseHandler.notFound(res, 'Item no encontrado');
        }

        if (item.registroComida.usuarioId !== patientId) {
            return ResponseHandler.forbidden(res, 'No tiene permisos para eliminar este item');
        }

        await itemRepo.remove(item);

        ResponseHandler.success(res, null, 'Item eliminado exitosamente');

    } catch (error) {
        console.error('Error deleting food item:', error);
        ResponseHandler.internalError(res, 'Error eliminando el item de comida');
    }
});

// Alimentos (catálogo)
app.get('/api/nutrition/foods', async (req: express.Request, res: express.Response) => {
    try {
        const { search, categoria } = req.query;
        
        const alimentoRepo = AppDataSource.getRepository(Alimento);
        let queryBuilder = alimentoRepo
            .createQueryBuilder('alimento')
            .where('alimento.activo = :activo', { activo: true });

        // Filtrar por búsqueda
        if (search) {
            queryBuilder = queryBuilder.andWhere(
                '(alimento.nombre ILIKE :search OR alimento.descripcion ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Filtrar por categoría
        if (categoria) {
            queryBuilder = queryBuilder.andWhere('alimento.categoria = :categoria', { 
                categoria: categoria 
            });
        }

        const alimentos = await queryBuilder
            .orderBy('alimento.nombre', 'ASC')
            .getMany();

        const alimentosResponse = alimentos.map(alimento => ({
            id: alimento.id,
            nombre: alimento.nombre,
            descripcion: alimento.descripcion,
            calorias_por_100g: alimento.caloriasPor100g,
            proteinas_g_por_100g: alimento.proteinasGPor100g,
            carbohidratos_g_por_100g: alimento.carbohidratosGPor100g,
            grasas_g_por_100g: alimento.grasasGPor100g,
            fibra_g_por_100g: alimento.fibraGPor100g,
            categoria: alimento.categoria,
            created_at: alimento.createdAt,
            updated_at: alimento.updatedAt
        }));

        ResponseHandler.success(res, alimentosResponse, 'Alimentos obtenidos exitosamente');

    } catch (error) {
        console.error('Error getting foods:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los alimentos');
    }
});

// Crear alimento (solo doctores)
app.post('/api/nutrition/foods', authenticateToken, async (req: any, res: express.Response) => {
    try {
        // Solo doctores pueden agregar alimentos
        if (req.user.tipo !== 'doctor') {
            return ResponseHandler.forbidden(res, 'Solo los doctores pueden agregar alimentos');
        }

        const { 
            nombre, 
            descripcion, 
            calorias_por_100g, 
            proteinas_g_por_100g, 
            carbohidratos_g_por_100g, 
            grasas_g_por_100g, 
            fibra_g_por_100g, 
            categoria 
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !calorias_por_100g || !proteinas_g_por_100g || !carbohidratos_g_por_100g || !grasas_g_por_100g) {
            return ResponseHandler.internalError(res, 'Todos los valores nutricionales son requeridos');
        }

        const alimentoRepo = AppDataSource.getRepository(Alimento);
        
        const nuevoAlimento = new Alimento();
        nuevoAlimento.nombre = nombre;
        nuevoAlimento.descripcion = descripcion || '';
        nuevoAlimento.caloriasPor100g = parseFloat(calorias_por_100g);
        nuevoAlimento.proteinasGPor100g = parseFloat(proteinas_g_por_100g);
        nuevoAlimento.carbohidratosGPor100g = parseFloat(carbohidratos_g_por_100g);
        nuevoAlimento.grasasGPor100g = parseFloat(grasas_g_por_100g);
        nuevoAlimento.fibraGPor100g = fibra_g_por_100g ? parseFloat(fibra_g_por_100g) : undefined;
        nuevoAlimento.categoria = categoria || 'general';

        const alimentoGuardado = await alimentoRepo.save(nuevoAlimento);

        const responseData = {
            id: alimentoGuardado.id,
            nombre: alimentoGuardado.nombre,
            descripcion: alimentoGuardado.descripcion,
            calorias_por_100g: alimentoGuardado.caloriasPor100g,
            proteinas_g_por_100g: alimentoGuardado.proteinasGPor100g,
            carbohidratos_g_por_100g: alimentoGuardado.carbohidratosGPor100g,
            grasas_g_por_100g: alimentoGuardado.grasasGPor100g,
            fibra_g_por_100g: alimentoGuardado.fibraGPor100g,
            categoria: alimentoGuardado.categoria,
            created_at: alimentoGuardado.createdAt
        };

        ResponseHandler.created(res, responseData, 'Alimento creado exitosamente');

    } catch (error) {
        console.error('Error creating food:', error);
        ResponseHandler.internalError(res, 'Error creando el alimento');
    }
});

// Resumen nutricional
app.get('/api/nutrition/summary', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { startDate, endDate } = req.query;
        
        const registroRepo = AppDataSource.getRepository(RegistroComida);
        const itemRepo = AppDataSource.getRepository(RegistroComidaItem);
        
        // Construir query base para registros
        let queryBuilder = registroRepo
            .createQueryBuilder('registro')
            .where('registro.usuarioId = :patientId', { patientId });

        // Filtrar por rango de fechas
        if (startDate) {
            queryBuilder = queryBuilder.andWhere('registro.fecha >= :startDate', {
                startDate: new Date(startDate as string)
            });
        }

        if (endDate) {
            const endDateObj = new Date(endDate as string);
            endDateObj.setHours(23, 59, 59, 999);
            queryBuilder = queryBuilder.andWhere('registro.fecha <= :endDate', {
                endDate: endDateObj
            });
        }

        const registros = await queryBuilder.getMany();

        if (registros.length === 0) {
            const emptySummary = {
                periodo: {
                    start_date: startDate || null,
                    end_date: endDate || null
                },
                total_registros: 0,
                total_calorias: 0,
                total_proteinas: 0,
                total_carbohidratos: 0,
                total_grasas: 0,
                total_fibra: 0,
                promedio_diario: {
                    calorias: 0,
                    proteinas: 0,
                    carbohidratos: 0,
                    grasas: 0
                }
            };
            return ResponseHandler.success(res, emptySummary, 'Resumen nutricional obtenido exitosamente');
        }

        // Obtener todos los items de los registros
        const registroIds = registros.map(r => r.id);
        const items = await itemRepo
            .createQueryBuilder('item')
            .where('item.registroComidaId IN (:...registroIds)', { registroIds })
            .getMany();

        // Calcular totales
        let totalCalorias = 0;
        let totalProteinas = 0;
        let totalCarbohidratos = 0;
        let totalGrasas = 0;
        let totalFibra = 0;

        items.forEach(item => {
            totalCalorias += Number(item.calorias) || 0;
            totalProteinas += Number(item.proteinasG) || 0;
            totalCarbohidratos += Number(item.carbohidratosG) || 0;
            totalGrasas += Number(item.grasasG) || 0;
            totalFibra += Number(item.fibraG) || 0;
        });

        // Calcular promedios diarios
        const diasConRegistros = new Set(
            registros.map(r => r.fecha.toISOString().split('T')[0])
        ).size;

        const summary = {
            periodo: {
                start_date: startDate || registros[registros.length - 1].fecha,
                end_date: endDate || registros[0].fecha
            },
            total_registros: registros.length,
            total_calorias: Math.round(totalCalorias),
            total_proteinas: Math.round(totalProteinas * 100) / 100,
            total_carbohidratos: Math.round(totalCarbohidratos * 100) / 100,
            total_grasas: Math.round(totalGrasas * 100) / 100,
            total_fibra: Math.round(totalFibra * 100) / 100,
            promedio_diario: {
                calorias: diasConRegistros > 0 ? Math.round(totalCalorias / diasConRegistros) : 0,
                proteinas: diasConRegistros > 0 ? Math.round((totalProteinas / diasConRegistros) * 100) / 100 : 0,
                carbohidratos: diasConRegistros > 0 ? Math.round((totalCarbohidratos / diasConRegistros) * 100) / 100 : 0,
                grasas: diasConRegistros > 0 ? Math.round((totalGrasas / diasConRegistros) * 100) / 100 : 0
            }
        };

        ResponseHandler.success(res, summary, 'Resumen nutricional obtenido exitosamente');

    } catch (error) {
        console.error('Error getting nutrition summary:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el resumen nutricional');
    }
});

// Obtener registro de comida específico
app.get('/api/nutrition/food-log/:logId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.id;
        
        const registroRepo = AppDataSource.getRepository(RegistroComida);
        const registro = await registroRepo.findOne({
            where: { 
                id: logId,
                usuarioId: patientId 
            },
            relations: ['items', 'items.alimento']
        });

        if (!registro) {
            return ResponseHandler.notFound(res, 'Registro de comida no encontrado');
        }

        const registroResponse = {
            id: registro.id,
            fecha: registro.fecha,
            tipo_comida: registro.tipoComida,
            notas: registro.notas,
            items: registro.items?.map(item => ({
                id: item.id,
                alimento: item.alimento ? {
                    id: item.alimento.id,
                    nombre: item.alimento.nombre,
                    descripcion: item.alimento.descripcion,
                    calorias_por_100g: item.alimento.caloriasPor100g,
                    proteinas_g_por_100g: item.alimento.proteinasGPor100g,
                    carbohidratos_g_por_100g: item.alimento.carbohidratosGPor100g,
                    grasas_g_por_100g: item.alimento.grasasGPor100g,
                    fibra_g_por_100g: item.alimento.fibraGPor100g,
                    categoria: item.alimento.categoria
                } : null,
                cantidad_gramos: item.cantidadGramos,
                calorias: item.calorias,
                proteinas_g: item.proteinasG,
                carbohidratos_g: item.carbohidratosG,
                grasas_g: item.grasasG,
                fibra_g: item.fibraG,
                notas: item.notas,
                created_at: item.createdAt
            })),
            created_at: registro.createdAt,
            updated_at: registro.updatedAt
        };

        ResponseHandler.success(res, registroResponse);

    } catch (error) {
        console.error('Error getting food log detail:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el detalle del registro de comida');
    }
});

// Actualizar registro de comida
app.put('/api/nutrition/food-log/:logId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.id;
        const { tipo_comida, notas, fecha } = req.body;
        
        const registroRepo = AppDataSource.getRepository(RegistroComida);

        // Verificar que el registro existe y pertenece al usuario
        const registro = await registroRepo.findOne({
            where: { 
                id: logId,
                usuarioId: patientId 
            }
        });

        if (!registro) {
            return ResponseHandler.notFound(res, 'Registro de comida no encontrado');
        }

        // Actualizar campos
        if (tipo_comida !== undefined) registro.tipoComida = tipo_comida;
        if (notas !== undefined) registro.notas = notas;
        if (fecha !== undefined) registro.fecha = new Date(fecha);
        registro.updatedAt = new Date();

        await registroRepo.save(registro);

        ResponseHandler.success(res, null, 'Registro de comida actualizado exitosamente');

    } catch (error) {
        console.error('Error updating food log:', error);
        ResponseHandler.internalError(res, 'Error actualizando el registro de comida');
    }
});

// Eliminar registro de comida
app.delete('/api/nutrition/food-log/:logId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.id;
        
        const registroRepo = AppDataSource.getRepository(RegistroComida);

        // Verificar que el registro existe y pertenece al usuario
        const registro = await registroRepo.findOne({
            where: { 
                id: logId,
                usuarioId: patientId 
            }
        });

        if (!registro) {
            return ResponseHandler.notFound(res, 'Registro de comida no encontrado');
        }

        await registroRepo.remove(registro);

        ResponseHandler.success(res, null, 'Registro de comida eliminado exitosamente');

    } catch (error) {
        console.error('Error deleting food log:', error);
        ResponseHandler.internalError(res, 'Error eliminando el registro de comida');
    }
});

// Middleware de manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    ResponseHandler.internalError(res, 'Error interno del servidor');
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    ResponseHandler.notFound(res, 'Ruta no encontrada');
});

// Inicializar servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado para Nutrition Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Nutrition Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Nutrition Service:', error);
        process.exit(1);
    }
};

startServer();

export default app;