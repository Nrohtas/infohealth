import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { page_path } = await request.json();
        const ip_address = request.headers.get('x-forwarded-for') || 'unknown';

        await pool.query(
            'INSERT INTO visit (page_path, ip_address) VALUES (?, ?)',
            [page_path, ip_address]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visit API Error:', error);
        return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT COUNT(*) as total FROM visit');
        return NextResponse.json({ total: rows[0].total });
    } catch (error) {
        console.error('Visit API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch total visits' }, { status: 500 });
    }
}
