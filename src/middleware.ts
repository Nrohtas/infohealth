
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect all /api routes EXCEPT /api/login and public data APIs
    const publicPaths = ['/api/login', '/api/stats', '/api/hospitals', '/api/villages'];

    if (path.startsWith('/api') && !publicPaths.some(p => path.startsWith(p))) {

        // Check for token in Authorization header
        const authHeader = request.headers.get('authorization');
        let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        // Fallback: Check for token in cookie
        if (!token) {
            token = request.cookies.get('token')?.value || null;
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
        }

        // Token is valid, proceed
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
