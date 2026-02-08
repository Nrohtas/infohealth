import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year') || '2568';
        const affiliation = searchParams.get('affiliation');
        const districtId = searchParams.get('id');
        const tambonId = searchParams.get('tambon');
        const year = parseInt(yearParam, 10);

        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;
        const houseFieldName = year >= 2568 ? 'house' : 'household';

        // Validate table names
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Affiliation Filter Logic
        let affiliationJoin = "";
        let affiliationFilter = "";
        if (affiliation) {
            affiliationJoin = " JOIN infohealth.hospital h ON p.hospcode = h.hospcode ";
            if (affiliation === 'moph') {
                affiliationFilter = " AND h.hostype_new IN ('5', '7', '8', '11', '18')";
            } else if (affiliation === 'local') {
                affiliationFilter = " AND h.hostype_new = '21'";
            } else if (affiliation === 'other') {
                affiliationFilter = " AND h.hostype_new NOT IN ('5', '7', '8', '11', '18', '21')";
            }
        }

        let midYearPopulation = 0;
        let male = 0;
        let female = 0;
        let house = 0;
        let totalVillages = 0;
        let totalHospitals = 0;
        let districtsMap = new Map();

        let districtFilter = "";
        const queryParams: any[] = [];

        if (tambonId) {
            districtFilter = " AND p.tamboncode = ? ";
            queryParams.push(tambonId);
        } else if (districtId) {
            districtFilter = " AND p.ampurcode = ? ";
            queryParams.push(districtId);
        }

        // Get Totals filtered by Affiliation/District/Tambon if provided
        const [statsRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                SUM(CAST(p.popall AS UNSIGNED)) as pop,
                SUM(CAST(p.maleall AS UNSIGNED)) as male,
                SUM(CAST(p.femaleall AS UNSIGNED)) as female,
                COUNT(DISTINCT p.villagecode) as villages,
                COUNT(DISTINCT p.hospcode) as hospitals
            FROM ${popTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' AND p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtFilter}
        `, queryParams);
        midYearPopulation = statsRows[0]?.pop || 0;
        male = statsRows[0]?.male || 0;
        female = statsRows[0]?.female || 0;
        totalVillages = statsRows[0]?.villages || 0;
        totalHospitals = statsRows[0]?.hospitals || 0;

        // Get District Population Breakdown
        const [popDistRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                p.ampurcode, 
                p.ampurname, 
                SUM(CAST(p.popall AS UNSIGNED)) as pop,
                SUM(CAST(p.maleall AS UNSIGNED)) as male,
                SUM(CAST(p.femaleall AS UNSIGNED)) as female
            FROM ${popTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' AND p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtFilter}
            GROUP BY p.ampurcode, p.ampurname
            ORDER BY p.ampurcode
        `, queryParams);

        popDistRows.forEach((row: any) => {
            districtsMap.set(row.ampurcode, {
                ampurcode: row.ampurcode,
                ampurname: row.ampurname,
                population: Number(row.pop),
                male: Number(row.male),
                female: Number(row.female),
                house: 0
            });
        });

        // Only query households if it's not 2567 (missing table)
        if (year !== 2567) {
            const [houseTotalRows] = await pool.query<RowDataPacket[]>(`
                SELECT SUM(CAST(p.${houseFieldName} AS UNSIGNED)) as household 
                FROM ${houseTable} p
                ${affiliationJoin}
                WHERE p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtFilter}
            `, queryParams);
            house = houseTotalRows[0]?.household || 0;

            const [houseDistRows] = await pool.query<RowDataPacket[]>(`
                SELECT p.ampurcode, p.ampurname, SUM(CAST(p.${houseFieldName} AS UNSIGNED)) as house 
                FROM ${houseTable} p
                ${affiliationJoin}
                WHERE p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtFilter}
                GROUP BY p.ampurcode, p.ampurname
                ORDER BY p.ampurcode
            `, queryParams);

            houseDistRows.forEach((row: any) => {
                if (districtsMap.has(row.ampurcode)) {
                    const existing = districtsMap.get(row.ampurcode);
                    existing.house = Number(row.house);
                } else {
                    districtsMap.set(row.ampurcode, {
                        ampurcode: row.ampurcode,
                        ampurname: row.ampurname,
                        population: 0,
                        male: 0,
                        female: 0,
                        house: Number(row.house)
                    });
                }
            });
        }

        const districts = Array.from(districtsMap.values()).sort((a: any, b: any) => a.ampurcode.localeCompare(b.ampurcode));

        return NextResponse.json({
            year: year,
            midYearPopulation: Number(midYearPopulation),
            male: Number(male),
            female: Number(female),
            house: Number(house),
            totalVillages: Number(totalVillages),
            totalHospitals: Number(totalHospitals),
            districts: districts
        });
    } catch (error) {
        console.error('Database Error Details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics', details: (error as Error).message },
            { status: 500 }
        );
    }
}
