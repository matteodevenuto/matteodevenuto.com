import type { APIRoute } from "astro";

export const prerender = false;

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData().catch(() => null);
  const email = data?.get("email")?.toString().trim().toLowerCase();
  const name = data?.get("name")?.toString().trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "A valid email is required" }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const segmentId = import.meta.env.RESEND_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    return json({ error: "Newsletter is not configured" }, 500);
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "matteodevenuto.com",
  };
  const contactUrl = `https://api.resend.com/contacts/${encodeURIComponent(email)}`;

  try {
    const existing = await fetch(contactUrl, { headers });
    let response: Response;

    if (existing.ok) {
      response = await fetch(contactUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          unsubscribed: false,
          ...(name && { first_name: name }),
        }),
      });

      if (response.ok) {
        response = await fetch(`${contactUrl}/segments/${segmentId}`, {
          method: "POST",
          headers,
        });
      }
    } else if (existing.status === 404) {
      response = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          unsubscribed: false,
          segments: [{ id: segmentId }],
          ...(name && { first_name: name }),
        }),
      });
    } else {
      response = existing;
    }

    if (!response.ok && response.status !== 409) {
      const error = await response.json().catch(() => null);
      return json({ error: error?.message || "Subscription failed" }, response.status);
    }

    return json({ success: true }, 200);
  } catch {
    return json({ error: "Network error" }, 500);
  }
};
