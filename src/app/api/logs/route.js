// This file defines an API endpoint to fetch trash log data from a MySQL database.

// Import the mysql2/promise library for async/await support with MySQL connections.
import mysql from 'mysql2/promise';

/**
 * Handles GET requests to the /api/logs endpoint.
 * This function connects to a MySQL database, executes a query, and returns the results.
 * @returns {Response} A JSON response containing the trash log data or an error message.
 */
export async function GET() {
    // 1. Define the database configuration using environment variables for security.
    const dbConfig = {
        host: process.env.DB_HOST,
        // The port is a string from the environment variable, so we parse it to an integer.
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            // This is important for Aiven's self-signed certificates.
            rejectUnauthorized: false
        }
    };

    // 2. Perform a basic check to ensure all required environment variables are set.
    // This helps with early debugging if the .env file is misconfigured.
    for (const key in dbConfig) {
        // Skip the ssl object, as it's not a required environment variable itself.
        if (key !== 'ssl' && !dbConfig[key]) {
            return new Response(JSON.stringify({ error: `Missing environment variable: ${key}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // 3. Declare a connection variable outside the try block.
    // This ensures it is accessible within the catch block to properly end the connection.
    let connection;
    try {
        // 4. Create the database connection.
        connection = await mysql.createConnection(dbConfig);

        // 5. Execute the SQL query to join data from multiple tables.
        // We use a prepared statement-like approach by passing an empty array,
        // which helps prevent some forms of SQL injection.
        const [rows] = await connection.execute(`
            SELECT t.trash_id, t.trash_name, b.bin_id, b.bin_name, l.time_stamp, l.correct
            FROM trash_log l
            JOIN trash t ON l.trash_id = t.trash_id
            JOIN bin b ON l.bin_id = b.bin_id
            ORDER BY l.time_stamp DESC
        `);

        // 6. Always remember to end the database connection to free up resources.
        await connection.end();

        // 7. Return the query results as a JSON response.
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // 8. Log any errors that occur during connection or query execution.
        console.error('Database connection or query failed:', error);

        // 9. If a connection was established before the error occurred, end it.
        if (connection) {
            await connection.end();
        }

        // 10. Return a generic error response to the client.
        return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), {
            status: 500, // Use a 500 status code for server errors.
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
