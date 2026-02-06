import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');

        if (!ampurcode) {
            return NextResponse.json({ error: 'Missing ampurcode parameter' }, { status: 400 });
        }

        // Validate ampurcode (alphanumeric, 4 digits expected e.g. 6501)
        if (!/^\d{4}$/.test(ampurcode)) {
            return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
        }

        // Query hospitals with Population and Household counts (Subqueries to avoid join duplication)
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                h.hospcode, 
                h.hospname, 
                h.tmb_name,
                (SELECT SUM(CAST(popall AS UNSIGNED)) FROM pop6806 WHERE hospcode = h.hospcode) as population,
                (SELECT SUM(CAST(household AS UNSIGNED)) FROM house2568 WHERE hospcode = h.hospcode) as households
            FROM chospital_plk h
            WHERE h.provcode = '65' AND h.amp_code = ?
            ORDER BY h.hospcode
        `, [ampurcode]);

        return NextResponse.json({
            ampurcode,
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
