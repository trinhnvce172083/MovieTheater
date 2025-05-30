import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Kiểm tra trạng thái ứng dụng
        const healthCheck = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'movie-theater-frontend',
            version: process.env.npm_package_version || '1.0.0',
        };

        return NextResponse.json(healthCheck, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Health check failed',
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        );
    }
} 