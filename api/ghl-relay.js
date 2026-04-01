export async function POST(request) {
  try {
    const data = await request.json();

    if (!process.env.GHL_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing GHL_WEBHOOK_URL env var.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      contact: {
        firstName: data.contact?.firstName || data.firstName || '',
        lastName: data.contact?.lastName || data.lastName || '',
        phone: data.contact?.phone || data.phone || '',
        email: data.contact?.email || data.email || '',
      },
      projectType: data.projectType || '',
      timeline: data.timeline || '',
      preferredContactMethod: data.preferredContactMethod || '',
      projectNotes: data.projectNotes || '',
      leadSource: data.leadSource || 'Desert Smart Glass Consult Widget',
    };

    if (!payload.contact.email && !payload.contact.phone) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email or phone is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ghlRes = await fetch(process.env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
