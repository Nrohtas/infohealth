import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ampurcode = searchParams.get('ampurcode');

        if (!ampurcode) {
            return NextResponse.json({ error: 'Missing ampurcode parameter' }, { status: 400 });
        }

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT tamboncodefull as code, tambonname as name
            FROM tambon
            WHERE ampurcode = ?
            ORDER BY tamboncodefull
        `, [ampurcode]);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error Details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tambons', details: (error as Error).message },
            { status: 500 }
        );
    }
}
