import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');
        const yearParam = searchParams.get('year') || '2568';
        const year = parseInt(yearParam, 10);

        if (!ampurcode) {
            return NextResponse.json({ error: 'Missing ampurcode parameter' }, { status: 400 });
        }

        if (!/^\d{4}$/.test(ampurcode)) {
            return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
        }

        // Derive table names
        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;

        // Validate table names
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Query villages
        let rows;
        if (year === 2567) {
            [rows] = await pool.query<RowDataPacket[]>(`
                SELECT 
                    hospcode,
                    villagecode,
                    villagename,
                    CAST(popall AS UNSIGNED) as population,
                    0 as households
                FROM ${popTable}
                WHERE ampurcode = ?
                ORDER BY hospcode, villagecode
            `, [ampurcode]);
        } else {
            [rows] = await pool.query<RowDataPacket[]>(`
                SELECT 
                    p.hospcode,
                    p.villagecode,
                    p.villagename,
                    CAST(p.popall AS UNSIGNED) as population,
                    CAST(h.household AS UNSIGNED) as households
                FROM ${popTable} p
                LEFT JOIN ${houseTable} h ON p.villagecode = h.villagecode
                WHERE p.ampurcode = ?
                ORDER BY p.hospcode, p.villagecode
            `, [ampurcode]);
        }

        return NextResponse.json({
            ampurcode,
            villages: rows
        });
    } catch (error) {
        console.error('Database Error Details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch villages', details: (error as Error).message },
            { status: 500 }
        );
    }
}
