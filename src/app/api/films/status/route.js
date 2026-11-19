import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export async function GET() {
    try {
        const filmsDir = path.join(process.cwd(), "public", "films");
        if (!fs.existsSync(filmsDir)) {
            return NextResponse.json({ available: [] });
        }
        const files = fs.readdirSync(filmsDir);
        const available = files
            .filter((f) => f.endsWith(".mp4"))
            .map((f) => f.replace(/\.mp4$/i, ""));
        return NextResponse.json({ available });
    }
    catch {
        return NextResponse.json({ available: [] });
    }
}
