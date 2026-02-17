import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');
        const tamboncode = searchParams.get('tamboncode');
        const year = searchParams.get('year') || '2568';

        const affiliation = searchParams.get('affiliation');

        let tableName = "pop6806";
        if (year === '2567') tableName = "pop6706";

        let whereClause = "WHERE 1=1";
        const queryParams = [];

        if (tamboncode) {
            whereClause += " AND p.tamboncode = ?";
            queryParams.push(tamboncode);
        } else if (ampurcode) {
            whereClause += " AND LEFT(p.tamboncode, 4) = ?";
            queryParams.push(ampurcode);
        }

        let affiliationJoin = "";
        if (affiliation) {
            affiliationJoin = " JOIN hospital h ON p.hospcode = h.hospcode ";
            if (affiliation === 'moph') {
                whereClause += " AND h.hostype_new IN ('5', '7', '8', '11', '18')";
            } else if (affiliation === 'local') {
                whereClause += " AND h.hostype_new = '21'";
            } else if (affiliation === 'other') {
                whereClause += " AND h.hostype_new NOT IN ('5', '7', '8', '11', '18', '21')";
            }
        }

        // Helper to generate SUM(CAST(...)) for a range
        const sumRange = (prefix: string, start: number, end: number) => {
            let cols = [];
            for (let i = start; i <= end; i++) {
                cols.push(`CAST(p.${prefix}age${i} AS UNSIGNED)`);
            }
            return cols.map(c => `COALESCE(${c}, 0)`).join(' + ');
        };

        const sumPlus = (prefix: string, start: number) => {
            let cols = [];
            for (let i = start; i <= 100; i++) {
                cols.push(`CAST(p.${prefix}age${i} AS UNSIGNED)`);
            }
            cols.push(`CAST(p.${prefix}agemore100 AS UNSIGNED)`);
            return cols.map(c => `COALESCE(${c}, 0)`).join(' + ');
        }

        const query = `
            SELECT 
                SUM(CAST(p.maleageless1 AS UNSIGNED)) as male_less_1,
                SUM(CAST(p.femaleageless1 AS UNSIGNED)) as female_less_1,

                SUM(${sumRange('male', 1, 4)}) as male_1_4,
                SUM(${sumRange('female', 1, 4)}) as female_1_4,

                SUM(${sumRange('male', 5, 9)}) as male_5_9,
                SUM(${sumRange('female', 5, 9)}) as female_5_9,

                SUM(${sumRange('male', 10, 14)}) as male_10_14,
                SUM(${sumRange('female', 10, 14)}) as female_10_14,

                SUM(${sumRange('male', 15, 19)}) as male_15_19,
                SUM(${sumRange('female', 15, 19)}) as female_15_19,

                SUM(${sumRange('male', 20, 24)}) as male_20_24,
                SUM(${sumRange('female', 20, 24)}) as female_20_24,

                SUM(${sumRange('male', 25, 29)}) as male_25_29,
                SUM(${sumRange('female', 25, 29)}) as female_25_29,

                SUM(${sumRange('male', 30, 34)}) as male_30_34,
                SUM(${sumRange('female', 30, 34)}) as female_30_34,

                SUM(${sumRange('male', 35, 39)}) as male_35_39,
                SUM(${sumRange('female', 35, 39)}) as female_35_39,

                SUM(${sumRange('male', 40, 44)}) as male_40_44,
                SUM(${sumRange('female', 40, 44)}) as female_40_44,

                SUM(${sumRange('male', 45, 49)}) as male_45_49,
                SUM(${sumRange('female', 45, 49)}) as female_45_49,

                SUM(${sumRange('male', 50, 54)}) as male_50_54,
                SUM(${sumRange('female', 50, 54)}) as female_50_54,

                SUM(${sumRange('male', 55, 59)}) as male_55_59,
                SUM(${sumRange('female', 55, 59)}) as female_55_59,

                SUM(${sumRange('male', 60, 64)}) as male_60_64,
                SUM(${sumRange('female', 60, 64)}) as female_60_64,

                SUM(${sumRange('male', 65, 69)}) as male_65_69,
                SUM(${sumRange('female', 65, 69)}) as female_65_69,

                SUM(${sumRange('male', 70, 74)}) as male_70_74,
                SUM(${sumRange('female', 70, 74)}) as female_70_74,

                 SUM(${sumPlus('male', 75)}) as male_75_plus,
                 SUM(${sumPlus('female', 75)}) as female_75_plus

            FROM pop.${tableName} p
            ${affiliationJoin}
            ${whereClause}
        `;

        const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
        const data = rows[0];

        const formattedData = [
            { ageGroup: '<1', male: Number(data.male_less_1 || 0), female: Number(data.female_less_1 || 0) },
            { ageGroup: '1-4', male: Number(data.male_1_4 || 0), female: Number(data.female_1_4 || 0) },
            { ageGroup: '5-9', male: Number(data.male_5_9 || 0), female: Number(data.female_5_9 || 0) },
            { ageGroup: '10-14', male: Number(data.male_10_14 || 0), female: Number(data.female_10_14 || 0) },
            { ageGroup: '15-19', male: Number(data.male_15_19 || 0), female: Number(data.female_15_19 || 0) },
            { ageGroup: '20-24', male: Number(data.male_20_24 || 0), female: Number(data.female_20_24 || 0) },
            { ageGroup: '25-29', male: Number(data.male_25_29 || 0), female: Number(data.female_25_29 || 0) },
            { ageGroup: '30-34', male: Number(data.male_30_34 || 0), female: Number(data.female_30_34 || 0) },
            { ageGroup: '35-39', male: Number(data.male_35_39 || 0), female: Number(data.female_35_39 || 0) },
            { ageGroup: '40-44', male: Number(data.male_40_44 || 0), female: Number(data.female_40_44 || 0) },
            { ageGroup: '45-49', male: Number(data.male_45_49 || 0), female: Number(data.female_45_49 || 0) },
            { ageGroup: '50-54', male: Number(data.male_50_54 || 0), female: Number(data.female_50_54 || 0) },
            { ageGroup: '55-59', male: Number(data.male_55_59 || 0), female: Number(data.female_55_59 || 0) },
            { ageGroup: '60-64', male: Number(data.male_60_64 || 0), female: Number(data.female_60_64 || 0) },
            { ageGroup: '65-69', male: Number(data.male_65_69 || 0), female: Number(data.female_65_69 || 0) },
            { ageGroup: '70-74', male: Number(data.male_70_74 || 0), female: Number(data.female_70_74 || 0) },
            { ageGroup: '75+', male: Number(data.male_75_plus || 0), female: Number(data.female_75_plus || 0) },
        ];

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch population data', details: (error as Error).message },
            { status: 500 }
        );
    }
}
