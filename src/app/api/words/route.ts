import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT id, de, ku, category, note, is_phrase, audio_url FROM words';
    const args: (string | number)[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push('category = ?');
      args.push(category);
    }

    if (search) {
      conditions.push('(de LIKE ? OR ku LIKE ?)');
      const searchPattern = `%${search}%`;
      args.push(searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id ASC';

    const result = await db.execute({ sql, args });

    // Use compact format to reduce payload size (~225KB -> ~140KB)
    const words = result.rows.map((r) => ({
      id: r.id,
      de: r.de,
      ku: r.ku,
      category: r.category,
      note: r.note || null,
      is_phrase: r.is_phrase,
      audio_url: r.audio_url || null,
    }));

    const response = NextResponse.json({ words });
    // Short CDN cache, allow cache-busting with ?t= param
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Words GET error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Woerter.' },
      { status: 500 }
    );
  }
}

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

    const { de, ku, category, note, is_phrase } = await req.json();

    if (!de || !ku || !category) {
      return NextResponse.json(
        { error: 'de, ku und category sind erforderlich.' },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO words (de, ku, category, note, is_phrase)
            VALUES (?, ?, ?, ?, ?)`,
      args: [de, ku, category, note ?? null, is_phrase ?? 0],
    });

    const insertedId = Number(result.lastInsertRowid);

    return NextResponse.json(
      {
        word: {
          id: insertedId,
          de,
          ku,
          category,
          note: note ?? null,
          is_phrase: is_phrase ?? 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Words POST error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Wortes.' },
      { status: 500 }
    );
  }
}

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

    const { id, de, ku, category, note, is_phrase } = await req.json();

    if (!id || !de || !ku || !category) {
      return NextResponse.json(
        { error: 'id, de, ku und category sind erforderlich.' },
        { status: 400 }
      );
    }

    const existing = await db.execute({
      sql: 'SELECT id, is_phrase FROM words WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wort nicht gefunden.' },
        { status: 404 }
      );
    }

    // Preserve is_phrase if not sent in request
    const finalIsPhrase = is_phrase ?? existing.rows[0].is_phrase ?? 0;

    await db.execute({
      sql: `UPDATE words SET de = ?, ku = ?, category = ?, note = ?, is_phrase = ?
            WHERE id = ?`,
      args: [de, ku, category, note ?? null, finalIsPhrase, id],
    });

    return NextResponse.json({
      word: {
        id,
        de,
        ku,
        category,
        note: note ?? null,
        is_phrase: finalIsPhrase,
      },
    });
  } catch (error) {
    console.error('Words PUT error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Wortes.' },
      { status: 500 }
    );
  }
}

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

    const existing = await db.execute({
      sql: 'SELECT id FROM words WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wort nicht gefunden.' },
        { status: 404 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM words WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Words DELETE error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Loeschen des Wortes.' },
      { status: 500 }
    );
  }
}
