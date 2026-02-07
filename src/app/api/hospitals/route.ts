import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');
        const yearParam = searchParams.get('year') || '2568';
        const affiliation = searchParams.get('affiliation'); // moph, local, other
        const year = parseInt(yearParam, 10);

        if (!ampurcode) {
            return NextResponse.json({ error: 'Missing ampurcode parameter' }, { status: 400 });
        }

        // Validate ampurcode (alphanumeric, 4 digits expected e.g. 6501)
        if (!/^\d{4}$/.test(ampurcode)) {
            return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
        }

        // Derive table names
        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;

        // Validate table names to prevent SQL injection
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Affiliation Filter Logic
        let affiliationFilter = '';
        if (affiliation === 'moph') {
            affiliationFilter = " AND h.hostype_new IN ('5', '7', '8', '11', '18')";
        } else if (affiliation === 'local') {
            affiliationFilter = " AND h.hostype_new = '21'";
        } else if (affiliation === 'other') {
            affiliationFilter = " AND h.hostype_new NOT IN ('5', '7', '8', '11', '18', '21')";
        }

        // Query hospitals with Population and Household counts
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                h.hospcode, 
                h.hospname, 
                h.tmb_name,
                h.hostype_new,
                (SELECT SUM(CAST(popall AS UNSIGNED)) FROM ${popTable} WHERE hospcode = h.hospcode) as population,
                ${year === 2567 ? 'NULL' : `(SELECT SUM(CAST(household AS UNSIGNED)) FROM ${houseTable} WHERE hospcode = h.hospcode)`} as households
            FROM chospital_plk h
            WHERE h.provcode = '65' AND h.amp_code = ? ${affiliationFilter}
            ORDER BY h.hospcode
        `, [ampurcode]);

        // Get District-wide totals
        const [popTotalRows] = await pool.query<RowDataPacket[]>(`
            SELECT SUM(CAST(popall AS UNSIGNED)) as pop 
            FROM ${popTable} 
            WHERE ampurcode = ?
        `, [ampurcode]);

        let houseTotal = 0;
        if (year !== 2567) {
            const [houseTotalRows] = await pool.query<RowDataPacket[]>(`
                SELECT SUM(CAST(household AS UNSIGNED)) as household 
                FROM ${houseTable} 
                WHERE ampurcode = ?
            `, [ampurcode]);
            houseTotal = Number(houseTotalRows[0]?.household || 0);
        }

        return NextResponse.json({
            ampurcode,
            districtTotal: {
                population: Number(popTotalRows[0]?.pop || 0),
                households: houseTotal
            },
            hospitals: rows
        });
    } catch (error) {
        console.error('Database Error Details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospitals', details: (error as Error).message },
            { status: 500 }
        );
    }
}
