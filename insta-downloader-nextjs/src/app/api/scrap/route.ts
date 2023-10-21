import { NextRequest, NextResponse } from 'next/server';
import { scrap } from '../../../service/scraping';

export async function GET(req: NextRequest, res: NextResponse) {
    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get('url');
    if (url === null) {
        return new Response('url is required', { status: 400 });
    } else {
        const result = await scrap(url);
        return Response.json(result);
    }
}
