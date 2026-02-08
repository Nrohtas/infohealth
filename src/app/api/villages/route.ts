import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');
        const tambon_code = searchParams.get('tambon_code');
        const yearParam = searchParams.get('year') || '2568';
        const year = parseInt(yearParam, 10);

        if (!ampurcode && !tambon_code) {
            return NextResponse.json({ error: 'Missing ampurcode or tambon_code parameter' }, { status: 400 });
        }

        let whereClause = "";
        let whereParams: any[] = [];

        if (ampurcode) {
            if (!/^\d{4}$/.test(ampurcode)) {
                return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
            }
            whereClause = "ampurcode = ?";
            whereParams.push(ampurcode);
        } else if (tambon_code) {
            if (!/^\d{6}$/.test(tambon_code)) {
                return NextResponse.json({ error: 'Invalid tambon_code format' }, { status: 400 });
            }
            whereClause = "tamboncode = ?";
            whereParams.push(tambon_code);
        }

        // Derive table names
        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;
        const houseFieldName = year >= 2568 ? 'house' : 'household';

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
                    CAST(maleall AS UNSIGNED) as male,
                    CAST(femaleall AS UNSIGNED) as female,
                    0 as households
                FROM ${popTable}
                WHERE ${whereClause}
                ORDER BY hospcode, villagecode
            `, whereParams);
        } else {
            [rows] = await pool.query<RowDataPacket[]>(`
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
                    GROUP BY villagecode
                ) h ON p.villagecode = h.villagecode
                WHERE p.${whereClause}
                ORDER BY p.hospcode, p.villagecode
            `, whereParams);
        }

        return NextResponse.json({
            ampurcode,
            tambon_code,
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
