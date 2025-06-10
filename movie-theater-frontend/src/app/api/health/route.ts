import { NextResponse } from 'next/server';

/**
 * Health check endpoint cho Docker
 * GET /api/health
 */
export async function GET() {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'movie-theater-frontend',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
        };

        return NextResponse.json(healthData, { status: 200 });
    } catch (error) {
        const errorData = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            service: 'movie-theater-frontend',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        return NextResponse.json(errorData, { status: 503 });
    }
} 