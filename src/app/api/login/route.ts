
import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Simple Admin Check (Extendable to DB check later)
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Token
        const token = await signToken({ username, role: 'admin' });

        // Return Token (Client should store this, e.g., in localStorage or Cookie)
        // For better security, we can also set an HTTP-Only cookie here.
        const response = NextResponse.json({ success: true, token });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
