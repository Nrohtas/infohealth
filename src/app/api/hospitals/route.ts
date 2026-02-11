import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');
        const tambon_code = searchParams.get('tambon_code');
        const yearParam = searchParams.get('year') || '2568';
        const affiliation = searchParams.get('affiliation'); // moph, local, other
        const year = parseInt(yearParam, 10);

        // Filter conditions
        let whereConditions = ["h.provcode = '65'"];
        const queryParams: any[] = [];

        if (ampurcode) {
            if (!/^\d{4}$/.test(ampurcode)) {
                return NextResponse.json({ error: 'Invalid ampurcode format' }, { status: 400 });
            }
            whereConditions.push("h.amp_code = ?");
            queryParams.push(ampurcode);
        } else if (tambon_code) {
            if (!/^\d{6}$/.test(tambon_code)) {
                return NextResponse.json({ error: 'Invalid tambon_code format' }, { status: 400 });
            }
            whereConditions.push("h.tmb_code = ?");
            queryParams.push(tambon_code);
        } else {
            return NextResponse.json({ error: 'Missing ampurcode or tambon_code parameter' }, { status: 400 });
        }

        // Validate table names to prevent SQL injection
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

        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9_.]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Affiliation Filter Logic
        if (affiliation === 'moph') {
            whereConditions.push("h.hostype_new IN ('5', '7', '8', '11', '18')");
        } else if (affiliation === 'local') {
            whereConditions.push("h.hostype_new = '21'");
        } else if (affiliation === 'other') {
            whereConditions.push("h.hostype_new NOT IN ('5', '7', '8', '11', '18', '21')");
        }

        // Create totals variables
        let totalWhere = "";
        let totalParams: any[] = [];

        if (ampurcode) {
            totalWhere = "ampurcode = ?";
            totalParams = [ampurcode];
        } else if (tambon_code) {
            totalWhere = "tamboncode = ?";
            totalParams = [tambon_code];
        }

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                h.hospcode, 
                h.hospname, 
                h.tmb_name,
                h.hostype_new,
                (SELECT SUM(CAST(popall AS UNSIGNED)) FROM ${popTable} WHERE hospcode = h.hospcode) as population,
                (SELECT SUM(CAST(maleall AS UNSIGNED)) FROM ${popTable} WHERE hospcode = h.hospcode) as male,
                (SELECT SUM(CAST(femaleall AS UNSIGNED)) FROM ${popTable} WHERE hospcode = h.hospcode) as female,
                (SELECT SUM(CAST(${houseFieldName} AS UNSIGNED)) FROM ${houseTable} WHERE hospcode = h.hospcode ${(year === 2567 || year === 2568) ? "AND villagecode != '0'" : ""}) as house
            FROM hospital h
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY h.hospcode
        `, queryParams);

        // Get District-wide totals
        const [popTotalRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                SUM(CAST(popall AS UNSIGNED)) as pop,
                SUM(CAST(maleall AS UNSIGNED)) as male,
                SUM(CAST(femaleall AS UNSIGNED)) as female
            FROM ${popTable} 
            WHERE ${totalWhere}
        `, totalParams);

        let houseTotal = 0;
        const [houseTotalRows] = await pool.query<RowDataPacket[]>(`
            SELECT SUM(CAST(${houseFieldName} AS UNSIGNED)) as household 
            FROM ${houseTable} 
            WHERE ${totalWhere} ${(year === 2567 || year === 2568) ? "AND villagecode != '0'" : ""}
        `, totalParams);
        houseTotal = Number(houseTotalRows[0]?.household || 0);

        return NextResponse.json({
            ampurcode,
            districtTotal: {
                population: Number(popTotalRows[0]?.pop || 0),
                male: Number(popTotalRows[0]?.male || 0),
                female: Number(popTotalRows[0]?.female || 0),
                house: houseTotal
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
