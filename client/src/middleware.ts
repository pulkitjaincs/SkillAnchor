import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('skillanchor_token')?.value;

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register') || request.nextUrl.pathname.startsWith('/forgot-password');

    if (isAuthRoute) {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/post-job',
        '/edit-job/:path*',
        '/my-jobs',
        '/jobs/:id/applicants',
        '/my-team',
        '/my-applications',
        '/profile/edit',
        '/profile/settings'
    ]
};
