import 'dotenv/config';
process.env.TZ = process.env.TZ || 'America/Argentina/Buenos_Aires';

import { createConnection } from 'mysql2/promise';

type ScheduleItem = { day: number; open: string | null; close: string | null };

function buildSchedule(openingAt: string, closingAt: string): ScheduleItem[] {
    return [
        { day: 1, open: openingAt, close: closingAt },
        { day: 2, open: openingAt, close: closingAt },
        { day: 3, open: openingAt, close: closingAt },
        { day: 4, open: openingAt, close: closingAt },
        { day: 5, open: openingAt, close: closingAt },
        { day: 6, open: openingAt, close: closingAt },
        { day: 7, open: openingAt, close: closingAt },
    ];
}

function buildEmptySchedule(): ScheduleItem[] {
    return [
        { day: 1, open: null, close: null },
        { day: 2, open: null, close: null },
        { day: 3, open: null, close: null },
        { day: 4, open: null, close: null },
        { day: 5, open: null, close: null },
        { day: 6, open: null, close: null },
        { day: 7, open: null, close: null },
    ];
}

async function migrate() {
    console.log('=== Migración de horarios (openingAt/closingAt → schedule) ===\n');

    // Conexión directa a MySQL para operaciones raw
    const conn = await createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'dsw-user-back',
        password: process.env.DB_PASSWORD || 'backdsw-backend',
        database: process.env.DB_NAME || 'backdsw',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });

    // Paso 1: Verificar si la columna schedule ya existe
    const [columns] = await conn.query(`SHOW COLUMNS FROM business LIKE 'schedule'`) as any[];
    const columnExists = columns.length > 0;

    if (!columnExists) {
        console.log('Agregando columna "schedule" a la tabla business...');
        await conn.query(`ALTER TABLE business ADD COLUMN schedule JSON DEFAULT NULL`);
        console.log('Columna "schedule" agregada exitosamente.\n');
    } else {
        console.log('La columna "schedule" ya existe.\n');
    }

    // Paso 2: Verificar si las columnas legacy existen
    const [legacyCamel] = await conn.query(`SHOW COLUMNS FROM business LIKE 'openingAt'`) as any[];
    const [legacySnake] = await conn.query(`SHOW COLUMNS FROM business LIKE 'opening_at'`) as any[];
    const hasLegacyCols = legacyCamel.length > 0 || legacySnake.length > 0;

    let query: string;
    if (hasLegacyCols) {
        // Si las columnas legacy existen, usar snake_case (MySQL raw) para migrar datos
        const colName = legacyCamel.length > 0 ? 'openingAt' : 'opening_at';
        const colName2 = legacyCamel.length > 0 ? 'closingAt' : 'closing_at';
        const bizNameCol = legacyCamel.length > 0 ? 'businessName' : 'business_name';
        query = `SELECT id, ${bizNameCol} as businessName, ${colName} as openingAt, ${colName2} as closingAt, schedule FROM business`;
    } else {
        // Columnas legacy no existen — solo leer schedule actual
        query = `SELECT id, business_name as businessName, schedule FROM business`;
    }

    const [rows] = await conn.query(query) as any[];

    console.log(`Encontrados ${rows.length} negocios`);
    console.log(`Columnas legacy opening_at/closing_at: ${hasLegacyCols ? 'existentes' : 'no existentes (ya eliminadas)'}\n`);

    let migrated = 0;
    let alreadyMigrated = 0;
    let withoutSchedule = 0;

    for (const business of rows) {
        // Parsear schedule si es string JSON
        let currentSchedule: ScheduleItem[] | null = null;
        if (business.schedule) {
            currentSchedule = typeof business.schedule === 'string'
                ? JSON.parse(business.schedule)
                : business.schedule;
        }

        // Si ya tiene schedule válido (7 días), no tocar
        if (currentSchedule && currentSchedule.length === 7) {
            alreadyMigrated++;
            console.log(`[SKIP] ${business.businessName} (ya tiene schedule)`);
            continue;
        }

        let newSchedule: ScheduleItem[];

        if (hasLegacyCols && business.openingAt && business.closingAt) {
            newSchedule = buildSchedule(business.openingAt, business.closingAt);
            migrated++;
            console.log(`[MIGRATE] ${business.businessName} (${business.openingAt} - ${business.closingAt}) → schedule`);
        } else {
            newSchedule = buildEmptySchedule();
            withoutSchedule++;
            console.log(`[SCHEDULE-EMPTY] ${business.businessName} (sin horarios disponibles → schedule vacío)`);
        }

        // Actualizar con SQL directo
        const scheduleJson = JSON.stringify(newSchedule);
        await conn.query(`UPDATE business SET schedule = ? WHERE id = ?`, [scheduleJson, business.id]);
    }

    console.log(`\n=== Resumen ===`);
    console.log(`  Negocios migrados: ${migrated}`);
    console.log(`  Ya tenían schedule: ${alreadyMigrated}`);
    console.log(`  Sin horarios (marcados cerrados): ${withoutSchedule}`);
    console.log(`  Total procesados: ${rows.length}`);

    // Paso 3: Verificar
    console.log('\n=== Verificación ===');
    const [verification] = await conn.query(
        `SELECT id, business_name as businessName, schedule FROM business LIMIT 5`
    ) as any[];
    for (const row of verification) {
        const schedule: ScheduleItem[] = typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule;
        const openDays = schedule ? schedule.filter((s: ScheduleItem) => s.open !== null).length : 0;
        console.log(`  #${row.id} ${row.businessName}: ${openDays} días abiertos`);
    }

    await conn.end();
    console.log('\nMigración completada.');
}

migrate().catch(err => {
    console.error('Error en migración:', err);
    process.exit(1);
});
