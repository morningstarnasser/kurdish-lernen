import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { CATEGORIES } from '@/lib/words';

// GET: Return categories (DB overrides merged with defaults + custom categories)
export async function GET() {
  try {
    const result = await db.execute({
      sql: 'SELECT id, label, label_ku, icon FROM categories ORDER BY sort_order ASC',
      args: [],
    });

    // Start with defaults
    const categories: Record<string, { label: string; label_ku: string; icon: string }> = {};
    for (const [key, val] of Object.entries(CATEGORIES)) {
      categories[key] = { ...val };
    }

    // Override with DB values and add custom categories
    for (const row of result.rows) {
      const id = row.id as string;
      categories[id] = {
        label: row.label as string,
        label_ku: (row.label_ku as string) || (categories[id]?.label_ku || ''),
        icon: row.icon as string,
      };
    }

    return NextResponse.json({ categories });
  } catch {
    // If table doesn't exist yet, return defaults
    return NextResponse.json({ categories: CATEGORIES });
  }
}

// POST: Create a new category (admin only)
export async function POST(req: NextRequest) {
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

    // Validate ID format (lowercase, no spaces, alphanumeric + underscore)
    if (!/^[a-z][a-z0-9_]*$/.test(id)) {
      return NextResponse.json(
        { error: 'ID muss mit einem Kleinbuchstaben beginnen und darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten.' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length > 0 || CATEGORIES[id]) {
      return NextResponse.json(
        { error: 'Kategorie existiert bereits.' },
        { status: 409 }
      );
    }

    // Get the highest sort_order
    const maxOrder = await db.execute({
      sql: 'SELECT MAX(sort_order) as max_order FROM categories',
      args: [],
    });
    const sortOrder = ((maxOrder.rows[0]?.max_order as number) || 0) + 1;

    await db.execute({
      sql: `INSERT INTO categories (id, label, label_ku, icon, sort_order)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, label, label_ku || '', icon, sortOrder],
    });

    return NextResponse.json(
      {
        category: { id, label, label_ku: label_ku || '', icon },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kategorie.' },
      { status: 500 }
    );
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

// DELETE: Delete a custom category (admin only)
export async function DELETE(req: NextRequest) {
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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'id ist erforderlich.' },
        { status: 400 }
      );
    }

    // Cannot delete default categories
    if (CATEGORIES[id]) {
      return NextResponse.json(
        { error: 'Standard-Kategorien können nicht gelöscht werden.' },
        { status: 400 }
      );
    }

    // Check if category has words
    const wordsCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM words WHERE category = ?',
      args: [id],
    });

    if ((wordsCount.rows[0]?.count as number) > 0) {
      return NextResponse.json(
        { error: 'Kategorie enthält Wörter und kann nicht gelöscht werden. Bitte zuerst alle Wörter verschieben oder löschen.' },
        { status: 400 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kategorie.' },
      { status: 500 }
    );
  }
}
