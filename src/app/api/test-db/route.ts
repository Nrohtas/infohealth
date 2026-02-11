
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 as val');

        try {
            const [popRows] = await pool.query<RowDataPacket[]>('SELECT count(*) as count FROM pop6806');
            return NextResponse.json({ status: 'ok', db_check: rows[0], pop_count: popRows[0] });
        } catch (popError) {
            return NextResponse.json({ status: 'error', message: 'pop table error', details: (popError as Error).message }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'connection failed', details: (error as Error).message }, { status: 500 });
    }
}
