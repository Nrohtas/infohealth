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

        let whereConditions: string[] = [];
        let queryParams: any[] = [];

        if (tambon_code) {
            if (!/^\d{6}$/.test(tambon_code)) {
                return NextResponse.json({ error: 'Invalid tambon_code format' }, { status: 400 });
            }
            whereConditions.push("p.subdistcode = ?");
            queryParams.push(tambon_code);
        } else if (ampurcode) {
            if (!/^\d{4}$/.test(ampurcode)) {
                return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
            }
            whereConditions.push("p.distcode = ?");
            queryParams.push(ampurcode);
        } else {
            return NextResponse.json({ error: 'Missing ampurcode or tambon_code parameter' }, { status: 400 });
        }

        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        let houseTable = `house${year}`;
        let houseFieldName = year >= 2568 ? 'house' : 'household';

        if (year === 2568) {
            houseTable = 'infohealth.house6712';
            houseFieldName = 'house';
        } else if (year === 2567) {
            houseTable = 'infohealth.house6612';
            houseFieldName = 'house';
        }

        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9_.]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        const houseWhere = (year === 2567 || year === 2568) ? "AND villagecode != '0'" : "";
        const whereClause = whereConditions.join(" AND ");

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
            WHERE ${whereClause}
            ORDER BY p.hospcode, p.villagecode
        `;

        const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

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
