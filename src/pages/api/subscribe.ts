import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let email: string | null = null;
  let name: string | null = null;

  try {
    const data = await request.formData();
    email = data.get("email") as string | null;
    name = data.get("name") as string | null;
  } catch (e) {
    // Fallback: try to parse as text and extract form data manually
    const text = await request.text();
    const params = new URLSearchParams(text);
    email = params.get("email");
    name = params.get("name");
  }

  if (!email || typeof email !== "string") {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const publicationId = import.meta.env.BEEHIIV_PUBLICATION_ID;
  const apiKey = import.meta.env.BEEHIIV_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!publicationId) {
    return new Response(JSON.stringify({ error: "Publication ID not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: email,
          ...(name && { first_name: name }),
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "website",
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const errorText = await response.text();
      let error: { message?: string };
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      return new Response(JSON.stringify({ error: error.message || "Subscription failed" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Network error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
