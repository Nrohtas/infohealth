import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year') || '2568';
        const affiliation = searchParams.get('affiliation');
        const year = parseInt(yearParam, 10);

        // ... (existing code for table derivation and validation) ...

        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;

        // Validate table names
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Affiliation Filter Logic
        let affiliationJoin = "";
        let affiliationFilter = "";
        if (affiliation) {
            affiliationJoin = " JOIN chospital_plk h ON p.hospcode = h.hospcode ";
            if (affiliation === 'moph') {
                affiliationFilter = " AND h.hostype_new IN ('5', '7', '8', '11', '18')";
            } else if (affiliation === 'local') {
                affiliationFilter = " AND h.hostype_new = '21'";
            } else if (affiliation === 'other') {
                affiliationFilter = " AND h.hostype_new NOT IN ('5', '7', '8', '11', '18', '21')";
            }
        }

        let midYearPopulation = 0;
        let households = 0;
        let totalVillages = 0;
        let totalHospitals = 0;
        let districtsMap = new Map();

        // Get Totals filtered by Affiliation if provided
        const [statsRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                SUM(CAST(p.popall AS UNSIGNED)) as pop,
                COUNT(DISTINCT p.villagecode) as villages,
                COUNT(DISTINCT p.hospcode) as hospitals
            FROM ${popTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' AND p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter}
        `);
        midYearPopulation = statsRows[0]?.pop || 0;
        totalVillages = statsRows[0]?.villages || 0;
        totalHospitals = statsRows[0]?.hospitals || 0;

        // Get District Population Breakdown
        const [popDistRows] = await pool.query<RowDataPacket[]>(`
            SELECT p.ampurcode, p.ampurname, SUM(CAST(p.popall AS UNSIGNED)) as pop 
            FROM ${popTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' AND p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter}
            GROUP BY p.ampurcode, p.ampurname
            ORDER BY p.ampurcode
        `);

        popDistRows.forEach((row: any) => {
            districtsMap.set(row.ampurcode, {
                ampurcode: row.ampurcode,
                ampurname: row.ampurname,
                population: Number(row.pop),
                households: 0
            });
        });

        // Only query households if it's not 2567 (missing table)
        if (year !== 2567) {
            const [houseTotalRows] = await pool.query<RowDataPacket[]>(`
                SELECT SUM(CAST(p.household AS UNSIGNED)) as household 
                FROM ${houseTable} p
                ${affiliationJoin}
                WHERE p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter}
            `);
            households = houseTotalRows[0]?.household || 0;

            const [houseDistRows] = await pool.query<RowDataPacket[]>(`
                SELECT p.ampurcode, p.ampurname, SUM(CAST(p.household AS UNSIGNED)) as house 
                FROM ${houseTable} p
                ${affiliationJoin}
                WHERE p.ampurcode BETWEEN '6501' AND '6509' ${affiliationFilter}
                GROUP BY p.ampurcode, p.ampurname
                ORDER BY p.ampurcode
            `);

            houseDistRows.forEach((row: any) => {
                if (districtsMap.has(row.ampurcode)) {
                    const existing = districtsMap.get(row.ampurcode);
                    existing.households = Number(row.house);
                } else {
                    districtsMap.set(row.ampurcode, {
                        ampurcode: row.ampurcode,
                        ampurname: row.ampurname,
                        population: 0,
                        households: Number(row.house)
                    });
                }
            });
        }

        const districts = Array.from(districtsMap.values()).sort((a: any, b: any) => a.ampurcode.localeCompare(b.ampurcode));

        return NextResponse.json({
            year: year,
            midYearPopulation: Number(midYearPopulation),
            households: Number(households),
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
