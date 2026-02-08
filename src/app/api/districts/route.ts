import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT amp_code as code, amp_name as name
            FROM infohealth.ampur
            ORDER BY amp_code
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error Details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch districts', details: (error as Error).message },
            { status: 500 }
        );
    }
}
