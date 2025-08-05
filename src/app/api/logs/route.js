import mysql from 'mysql2/promise';

export async function GET() {
    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10), // Port should be a number
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        }
    };

    const [rows] = await connection.execute(`
    SELECT t.trash_id, t.trash_name, b.bin_id, b.bin_name, l.time_stamp, l.correct
    FROM trash_log l
    JOIN trash t ON l.trash_id = t.trash_id
    JOIN bin b ON l.bin_id = b.bin_id
    ORDER BY l.time_stamp DESC
  `);

    await connection.end();

    return new Response(JSON.stringify(rows), {
        headers: { 'Content-Type': 'application/json' },
    });
}
