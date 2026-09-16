import type { APIRoute } from "astro";
import { SITE } from "@/config";
import {
  confirmationIdempotencyKey,
  createConfirmationToken,
} from "@/utils/newsletterConfirmation";
import confirmationTemplate from "../../../emails/confirm-subscription.html?raw";

export const prerender = false;

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData().catch(() => null);
  const email = data?.get("email")?.toString().trim().toLowerCase();
  const name = data?.get("name")?.toString().trim();

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "A valid email is required" }, 400);
  }
  if (name && name.length > 80) return json({ error: "Name is too long" }, 400);

  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM || "Matteo De Venuto <newsletter@matteodevenuto.com>";

  if (!apiKey) {
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
    let contactResponse: Response;

    if (existing.ok) {
      contactResponse = name
        ? await fetch(contactUrl, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ first_name: name }),
          })
        : existing;
    } else if (existing.status === 404) {
      contactResponse = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          unsubscribed: false,
          ...(name && { first_name: name }),
        }),
      });
    } else {
      contactResponse = existing;
    }

    if (!contactResponse.ok && contactResponse.status !== 409) {
      const error = await contactResponse.json().catch(() => null);
      return json({ error: error?.message || "Subscription failed" }, contactResponse.status);
    }

    const token = createConfirmationToken(email, name, apiKey);
    const confirmUrl = new URL("api/confirm-subscription", SITE.website);
    confirmUrl.searchParams.set("token", token);
    const html = confirmationTemplate
      .replaceAll("{{SUBSCRIBER_NAME}}", escapeHtml(name || "there"))
      .replaceAll("{{CONFIRM_URL}}", escapeHtml(confirmUrl.href));
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        ...headers,
        "Idempotency-Key": confirmationIdempotencyKey(email, apiKey),
      },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: ["matteo@matteodevenuto.com"],
        subject: "Confirm your email",
        html,
      }),
    });

    if (!confirmationResponse.ok) {
      const error = await confirmationResponse.json().catch(() => null);
      return json(
        { error: error?.message || "Confirmation email failed" },
        confirmationResponse.status
      );
    }

    return json({ success: true }, 200);
  } catch {
    return json({ error: "Network error" }, 500);
  }
};
