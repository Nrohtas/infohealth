import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query(
            'SELECT update_date, update_description, update_version FROM siteupdate ORDER BY update_date DESC'
        );
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching site updates:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
