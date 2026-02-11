
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const ampurcode = '6501';
    const year: number = 2568;

    // Logic from route.ts
    const yy = String(year).slice(-2);
    const popTable = `pop${yy}06`;
    let houseTable = `house${year}`;
    let houseFieldName = year >= 2568 ? 'house' : 'household';

    if (year === 2568) {
        houseTable = 'house6712';
        houseFieldName = 'house';
    } else if (year === 2567) {
        houseTable = 'house6612';
        houseFieldName = 'house';
    }

    const houseWhere = (year === 2567 || year === 2568) ? "AND villagecode != '0'" : "";
    const whereClause = "p.ampurcode = ?";
    const queryParams = [ampurcode];

    const query = `
        SELECT 
            p.hospcode,
            p.villagecode,
            p.villagename,
            CAST(p.popall AS UNSIGNED) as population,
            CAST(p.maleall AS UNSIGNED) as male,
            CAST(p.femaleall AS UNSIGNED) as female,
            IFNULL(h.households, 0) as households
        FROM ${popTable} p
        LEFT JOIN (
            SELECT villagecode, SUM(CAST(${houseFieldName} AS UNSIGNED)) as households
            FROM ${houseTable}
            WHERE 1=1 ${houseWhere}
            GROUP BY villagecode
        ) h ON p.villagecode = h.villagecode
        WHERE ${whereClause} AND p.hospcode = '07476'
        ORDER BY p.hospcode, p.villagecode
        LIMIT 5
    `;

    console.log('Query:', query);
    console.log('Params:', queryParams);

    const [rows] = await connection.execute(query, queryParams);
    console.log('Rows:', rows);

    await connection.end();
}

run().catch(console.error);
