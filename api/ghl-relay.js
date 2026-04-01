export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const data = await request.json();

    // Basic validation to ensure we have a contact point
    if (!data.email && !data.phone) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email or phone is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // This sends the data to the secret GHL URL you'll set in Vercel later
    const ghlRes = await fetch(process.env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const text = await ghlRes.text();

    if (!ghlRes.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'GHL webhook returned a non-200 response.',
          status: ghlRes.status,
          body: text,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Lead relayed to GHL.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
