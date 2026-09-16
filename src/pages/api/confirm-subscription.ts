import type { APIRoute } from "astro";
import { verifyConfirmationToken } from "@/utils/newsletterConfirmation";

export const prerender = false;

const page = (title: string, message: string, status = 200) =>
  new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${title} | Matteo De Venuto</title>
  </head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f5fa;color:#282728;font-family:Atkinson,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
    <main style="box-sizing:border-box;width:min(600px,calc(100% - 28px));padding:44px;border:1px solid #e6e6e6;border-top:4px solid #5181fb;border-radius:10px;background:#fdfdfd">
      <p style="margin:0 0 12px;color:#5181fb;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Newsletter</p>
      <h1 style="margin:0 0 18px;color:#5181fb;font-size:32px;line-height:1.2">${title}</h1>
      <p style="margin:0 0 28px;color:#56545a;font-size:17px;line-height:1.7">${message}</p>
      <a href="https://matteodevenuto.com/blog" style="display:inline-block;padding:13px 20px;border-radius:6px;background:#5181fb;color:#fff;text-decoration:none;font-weight:700">Read the blog</a>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    }
  );

export const GET: APIRoute = async ({ url }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const segmentId = import.meta.env.RESEND_SEGMENT_ID;
  const token = url.searchParams.get("token");

  if (!apiKey || !segmentId) {
    return page(
      "Newsletter unavailable",
      "The newsletter is not configured. Please try again later.",
      500
    );
  }

  const subscriber = token ? verifyConfirmationToken(token, apiKey) : null;
  if (!subscriber) {
    return page(
      "Link expired",
      "This confirmation link is invalid or has expired. Submit the newsletter form again for a new link.",
      400
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "matteodevenuto.com",
  };
  const contactUrl = `https://api.resend.com/contacts/${encodeURIComponent(subscriber.email)}`;

  try {
    const update = await fetch(contactUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        unsubscribed: false,
        ...(subscriber.name && { first_name: subscriber.name }),
      }),
    });
    if (!update.ok) throw new Error(await update.text());

    const segment = await fetch(`${contactUrl}/segments/${segmentId}`, {
      method: "POST",
      headers,
    });
    if (!segment.ok && segment.status !== 409) throw new Error(await segment.text());

    return page("Email confirmed", "You are subscribed. New posts will arrive in your inbox.");
  } catch {
    return page(
      "Could not confirm",
      "Something went wrong. Please open the confirmation link again.",
      500
    );
  }
};
