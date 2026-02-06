const mysql = require('mysql2/promise');

async function main() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'infohealth',
    };

    console.log('Connecting to:', config);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected!');

        const [rows] = await connection.query('SELECT SUM(CAST(popmidhome AS UNSIGNED)) as val FROM pop6806');
        console.log('Query result:', rows);

        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code) console.error('Code:', err.code);
    }
}

main();
