import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year') || '2568';
        const year = parseInt(yearParam, 10);

        // Basic validation: Year must be 2568 (for now, can expand later)
        // If we want to allow other years, we'd need to check if table exists or use a try/catch on query
        // Logic: popTable = pop{YY}06, houseTable = house{YYYY}

        const yy = String(year).slice(-2);
        const popTable = `pop${yy}06`;
        const houseTable = `house${year}`;

        // Validate table names to prevent SQL injection (simple alphanumeric check)
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        let midYearPopulation = 0;
        let households = 0;
        let totalVillages = 0;
        let totalHospitals = 0;
        let districtsMap = new Map();

        // Get Totals filtered by Province 65 (Phitsanulok) AND Districts 6501-6509
        const [statsRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                SUM(CAST(popall AS UNSIGNED)) as pop,
                COUNT(DISTINCT villagecode) as villages,
                COUNT(DISTINCT hospcode) as hospitals
            FROM ${popTable} 
            WHERE provincecode = '65' AND ampurcode BETWEEN '6501' AND '6509'
        `);
        midYearPopulation = statsRows[0]?.pop || 0;
        totalVillages = statsRows[0]?.villages || 0;
        totalHospitals = statsRows[0]?.hospitals || 0;

        // Get District Population Breakdown
        const [popDistRows] = await pool.query<RowDataPacket[]>(`
            SELECT ampurcode, ampurname, SUM(CAST(popall AS UNSIGNED)) as pop 
            FROM ${popTable} 
            WHERE provincecode = '65' AND ampurcode BETWEEN '6501' AND '6509'
            GROUP BY ampurcode, ampurname
            ORDER BY ampurcode
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
                SELECT SUM(CAST(household AS UNSIGNED)) as household 
                FROM ${houseTable} 
                WHERE ampurcode BETWEEN '6501' AND '6509'
            `);
            households = houseTotalRows[0]?.household || 0;

            const [houseDistRows] = await pool.query<RowDataPacket[]>(`
                SELECT ampurcode, ampurname, SUM(CAST(household AS UNSIGNED)) as house 
                FROM ${houseTable} 
                WHERE ampurcode BETWEEN '6501' AND '6509'
                GROUP BY ampurcode, ampurname
                ORDER BY ampurcode
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
