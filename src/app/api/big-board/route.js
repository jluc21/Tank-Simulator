import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const source = process.env.BIG_BOARD_SOURCE || 'local';
  
  try {
    const jsonDirectory = path.join(process.cwd(), 'src/data');
    const fileContents = await fs.readFile(jsonDirectory + '/bigboard.json', 'utf8');
    const players = JSON.parse(fileContents);

    return NextResponse.json({
      ok: true,
      source,
      updatedAt: new Date().toISOString(),
      players
    });

  } catch (error) {
    return NextResponse.json({
      ok: false,
      source: 'local',
      error: error.message
    }, { status: 500 });
  }
}
