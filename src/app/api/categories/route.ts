import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { CATEGORIES } from '@/lib/words';

// GET: Return categories (DB overrides merged with defaults)
export async function GET() {
  try {
    const result = await db.execute({
      sql: 'SELECT id, label, label_ku, icon FROM categories',
      args: [],
    });

    // Start with defaults, override with DB values
    const categories: Record<string, { label: string; label_ku: string; icon: string }> = {};
    for (const [key, val] of Object.entries(CATEGORIES)) {
      categories[key] = { ...val };
    }
    for (const row of result.rows) {
      const id = row.id as string;
      if (categories[id]) {
        categories[id] = {
          label: row.label as string,
          label_ku: (row.label_ku as string) || categories[id].label_ku,
          icon: row.icon as string,
        };
      }
    }

    return NextResponse.json({ categories });
  } catch {
    // If table doesn't exist yet, return defaults
    return NextResponse.json({ categories: CATEGORIES });
  }
}

// PUT: Update a category label/label_ku/icon (admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const { id, label, label_ku, icon } = await req.json();

    if (!id || !label || !icon) {
      return NextResponse.json(
        { error: 'id, label und icon sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if category key exists in defaults
    if (!CATEGORIES[id] && id !== 'all') {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden.' },
        { status: 404 }
      );
    }

    await db.execute({
      sql: `INSERT INTO categories (id, label, label_ku, icon, sort_order)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(id)
            DO UPDATE SET label = excluded.label, label_ku = excluded.label_ku, icon = excluded.icon`,
      args: [id, label, label_ku || '', icon],
    });

    return NextResponse.json({
      category: { id, label, label_ku: label_ku || '', icon },
    });
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kategorie.' },
      { status: 500 }
    );
  }
}
