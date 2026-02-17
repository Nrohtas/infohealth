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
        let houseTable = `house${year}`;
        let houseFieldName = year >= 2568 ? 'house' : 'household';

        if (year === 2568) {
            houseTable = 'house6712';
            houseFieldName = 'house';
        } else if (year === 2567) {
            houseTable = 'house6612';
            houseFieldName = 'house';
        }

        // Validate table names
        if (!/^[a-zA-Z0-9]+$/.test(popTable) || !/^[a-zA-Z0-9_.]+$/.test(houseTable)) {
            return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        const houseWhere = (year === 2567 || year === 2568) ? "AND p.villagecode != '0'" : "";

        // Affiliation Filter Logic
        let affiliationJoin = "";
        let affiliationFilter = "";
        if (affiliation) {
            affiliationJoin = " JOIN hospital h ON p.hospcode = h.hospcode ";
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

        // Default provincial scope for summary boxes
        const provinceScope = '65%';
        let geoFilter = " AND ampurcode LIKE ? ";
        let geoParam = provinceScope;

        if (tambonId) {
            geoFilter = " AND tamboncode = ? ";
            geoParam = tambonId;
        } else if (districtId) {
            geoFilter = " AND LEFT(tamboncode, 4) = ? ";
            geoParam = districtId;
        }

        const geoQueryParams = [geoParam];

        // 1. Get Totals from Population Table (Population, Male, Female)
        const [statsRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                SUM(CAST(p.popall AS UNSIGNED)) as pop,
                SUM(CAST(p.maleall AS UNSIGNED)) as male,
                SUM(CAST(p.femaleall AS UNSIGNED)) as female
            FROM ${popTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' ${geoFilter} ${affiliationFilter}
        `, geoQueryParams);

        midYearPopulation = statsRows[0]?.pop || 0;
        male = statsRows[0]?.male || 0;
        female = statsRows[0]?.female || 0;

        // 2. Get Total Hospitals from Hospital Table
        let hospAffiliationFilter = "";
        if (affiliation === 'moph') {
            hospAffiliationFilter = " AND hostype_new IN ('5', '7', '8', '11', '18')";
        } else if (affiliation === 'local') {
            hospAffiliationFilter = " AND hostype_new = '21'";
        } else if (affiliation === 'other') {
            hospAffiliationFilter = " AND hostype_new NOT IN ('5', '7', '8', '11', '18', '21')";
        }

        let hospGeoFilter = " AND amp_code LIKE ? ";
        if (tambonId) {
            hospGeoFilter = " AND tmb_code = ? ";
        } else if (districtId) {
            hospGeoFilter = " AND amp_code = ? ";
        }

        const [hospStatsRows] = await pool.query<RowDataPacket[]>(`
            SELECT COUNT(DISTINCT hospcode) as count 
            FROM hospital 
            WHERE provcode = '65' ${hospGeoFilter} ${hospAffiliationFilter}
        `, [geoParam]);
        totalHospitals = hospStatsRows[0]?.count || 0;

        // 3. Get Total Tambons from Pop Table (representing active administrative units in survey)
        const [tambonStatsRows] = await pool.query<RowDataPacket[]>(`
            SELECT COUNT(DISTINCT tamboncode) as count 
            FROM ${popTable} 
            WHERE provincecode = '65' ${geoFilter}
        `, [geoParam]);
        const totalTambons = tambonStatsRows[0]?.count || 0;

        // 4. Get Total Villages from Pop Table (counting unique villagecode excluding the '00' suffix)
        const [villageStatsRows] = await pool.query<RowDataPacket[]>(`
            SELECT COUNT(DISTINCT villagecode) as count 
            FROM ${popTable} 
            WHERE provincecode = '65' AND villagecode NOT LIKE '%00' ${geoFilter}
        `, [geoParam]);
        totalVillages = villageStatsRows[0]?.count || 0;

        // Get District Population Breakdown
        const [popDistRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                LEFT(p.tamboncode, 4) as ampurcode, 
                a.amp_name as ampurname, 
                SUM(CAST(p.popall AS UNSIGNED)) as pop,
                SUM(CAST(p.maleall AS UNSIGNED)) as male,
                SUM(CAST(p.femaleall AS UNSIGNED)) as female
            FROM ${popTable} p
            JOIN ampur a ON LEFT(p.tamboncode, 4) = a.amp_code
            ${affiliationJoin}
            WHERE p.provincecode = '65' AND LEFT(p.tamboncode, 4) BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtId ? " AND LEFT(p.tamboncode, 4) = ? " : ""} ${tambonId ? " AND p.tamboncode = ? " : ""}
            GROUP BY LEFT(p.tamboncode, 4), a.amp_name
            ORDER BY ampurcode
        `, districtId || tambonId ? [districtId || tambonId] : []);

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

        // Query households for all years
        // Query households for all years
        let houseExtraFilter = "";
        if (year === 2567 || year === 2568) {
            houseExtraFilter = " AND p.villagecode != '0' ";
        }

        const [houseTotalRows] = await pool.query<RowDataPacket[]>(`
            SELECT SUM(CAST(p.${houseFieldName} AS UNSIGNED)) as household 
            FROM ${houseTable} p
            ${affiliationJoin}
            WHERE p.provincecode = '65' ${geoFilter} ${affiliationFilter} ${houseExtraFilter}
        `, geoQueryParams);
        house = houseTotalRows[0]?.household || 0;

        const [houseDistRows] = await pool.query<RowDataPacket[]>(`
            SELECT LEFT(p.tamboncode, 4) as ampurcode, SUM(CAST(p.${houseFieldName} AS UNSIGNED)) as house 
            FROM ${houseTable} p
            ${affiliationJoin}
            WHERE LEFT(p.tamboncode, 4) BETWEEN '6501' AND '6509' ${affiliationFilter} ${districtId ? " AND LEFT(p.tamboncode, 4) = ? " : ""} ${tambonId ? " AND p.tamboncode = ? " : ""} ${houseExtraFilter}
            GROUP BY LEFT(p.tamboncode, 4)
            ORDER BY ampurcode
        `, districtId || tambonId ? [districtId || tambonId] : []);

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

        const districts = Array.from(districtsMap.values()).sort((a: any, b: any) => a.ampurcode.localeCompare(b.ampurcode));

        return NextResponse.json({
            year: year,
            midYearPopulation: Number(midYearPopulation),
            male: Number(male),
            female: Number(female),
            house: Number(house),
            totalTambons: Number(totalTambons),
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
