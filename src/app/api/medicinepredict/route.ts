import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    //resolve path to py script
    const scriptPath = path.resolve('src/ml/model/medicine_inference.py');

    return new Promise((resolve) => {
      exec(`python "${scriptPath}" "${query}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Python error:', error);
          return resolve(
            NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
          );
        }
        
        console.error('Raw stdout from Python (as string):', JSON.stringify(stdout));

        try {
          const predictions = JSON.parse(stdout);
          return resolve(NextResponse.json({ predictions }));
        } catch (e) {
          console.error('JSON parse error:', e);
          return resolve(
            NextResponse.json({ error: 'Invalid response from Python' }, { status: 500 })
          );
        }
      });
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
