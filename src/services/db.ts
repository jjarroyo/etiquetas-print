import Database from '@tauri-apps/plugin-sql';
import { readTextFile, exists } from '@tauri-apps/plugin-fs';

const DB_PATH = 'sqlite:etiquetas.db';

export interface Printer {
    id?: number;
    name: string;
    max_printable_width_mm: number;
    max_media_width_mm: number;
    resolutions_dpi: number[];
    speed_ips?: number;
    labels_per_min?: number;
    speed_mm_s?: number;
}

export const initDB = async () => {
    try {
        const db = await Database.load(DB_PATH);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS printers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                max_printable_width_mm REAL,
                max_media_width_mm REAL,
                resolutions_dpi TEXT,
                speed_ips REAL,
                labels_per_min INTEGER,
                speed_mm_s INTEGER
            );
        `);
        console.log('Tables created or already exist');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS designs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        return db;
    } catch (e) {
        console.error('Failed to init DB', e);
        throw e;
    }
};

export const syncPrintersFromJSON = async () => {
    // Note: This path is specific to the user's environment as requested
    const jsonPath = 'C:\\Users\\jorge\\etiquetas-print\\impresoras.json';
    console.log('Attempting to sync printers from:', jsonPath);
    try {
        const fileExists = await exists(jsonPath);
        console.log('File exists check:', fileExists);

        if (!fileExists) {
            console.warn('File does not exist:', jsonPath);
            return;
        }

        const content = await readTextFile(jsonPath);
        console.log('File content read, length:', content.length);
        const data = JSON.parse(content);
        console.log('JSON parsed, printers count:', data?.printers?.length);

        if (data && Array.isArray(data.printers)) {
            const db = await Database.load(DB_PATH);
            for (const p of data.printers) {
                await db.execute(
                    `INSERT INTO printers (name, max_printable_width_mm, max_media_width_mm, resolutions_dpi, speed_ips, labels_per_min, speed_mm_s)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT(name) DO UPDATE SET
                        max_printable_width_mm = excluded.max_printable_width_mm,
                        max_media_width_mm = excluded.max_media_width_mm,
                        resolutions_dpi = excluded.resolutions_dpi,
                        speed_ips = excluded.speed_ips,
                        labels_per_min = excluded.labels_per_min,
                        speed_mm_s = excluded.speed_mm_s
                    `,
                    [
                        p.name,
                        p.max_printable_width_mm,
                        p.max_media_width_mm,
                        JSON.stringify(p.resolutions_dpi),
                        p.speed_ips || null,
                        p.labels_per_min || null,
                        p.speed_mm_s || null,
                    ]
                );
            }
            console.log('Printers synced successfully from ' + jsonPath);
        }
    } catch (error) {
        console.error('Error syncing printers from JSON:', error);
    }
};

export const getPrinters = async (): Promise<Printer[]> => {
    try {
        const db = await Database.load(DB_PATH);
        return await db.select<Printer[]>(
            'SELECT * FROM printers ORDER BY name'
        );
    } catch (e) {
        console.error('Error fetching printers:', e);
        return [];
    }
};

export const saveDesign = async (name: string, content: string) => {
    try {
        const db = await Database.load(DB_PATH);
        const result = await db.execute(
            'INSERT INTO designs (name, content) VALUES ($1, $2)',
            [name, content]
        );
        return result.lastInsertId;
    } catch (e) {
        console.error('Error saving design:', e);
        throw e;
    }
};

export const updateDesign = async (
    id: number,
    name: string,
    content: string
) => {
    try {
        const db = await Database.load(DB_PATH);
        await db.execute(
            'UPDATE designs SET name = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [name, content, id]
        );
    } catch (e) {
        console.error('Error updating design:', e);
        throw e;
    }
};

export const deleteDesign = async (id: number) => {
    try {
        const db = await Database.load(DB_PATH);
        await db.execute('DELETE FROM designs WHERE id = $1', [id]);
    } catch (e) {
        console.error('Error deleting design:', e);
        throw e;
    }
};

export const getDesigns = async () => {
    try {
        const db = await Database.load(DB_PATH);
        return await db.select(
            'SELECT * FROM designs ORDER BY updated_at DESC'
        );
    } catch (e) {
        console.error('Error fetching designs:', e);
        return [];
    }
};
