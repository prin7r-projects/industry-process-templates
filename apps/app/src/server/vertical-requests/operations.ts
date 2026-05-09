/**
 * Vertical Request Operations — Phase 3.
 *
 * POST /api/vertical-requests
 *   Public endpoint — captures "request a vertical" submissions.
 *   Stores in DB and emails the product team.
 *
 * Body: { vertical: string, businessShape: string, email: string }
 * Response: { id, status }
 */
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

type VrContext = {
  entities: {
    VerticalRequest: any;
    User: any;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEnv(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

// ─── POST /api/vertical-requests ──────────────────────────────────────────────
//
// Public endpoint: no auth required.
// Rate-limited by IP (simple in-memory — production harden in Phase 4).

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function submitVerticalRequest(req: any, res: any, context: VrContext) {
  try {
    const { vertical, businessShape, email } = req.body ?? {};

    // Validate required fields
    if (!vertical || !email) {
      return res.status(400).json({
        data: null,
        error: {
          code: "invalid-request",
          message: "vertical and email are required",
        },
      });
    }

    // Validate email format
    if (!VALID_EMAIL.test(email)) {
      return res.status(400).json({
        data: null,
        error: { code: "invalid-email", message: "Valid email address is required" },
      });
    }

    // Rate limit by IP
    const ip = req.ip ?? req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        data: null,
        error: { code: "rate-limited", message: "Too many requests. Please try again later." },
      });
    }

    // Deduplicate: check for recent same email + vertical within last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await context.entities.VerticalRequest.findFirst({
      where: {
        email,
        vertical,
        createdAt: { gte: oneHourAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return res.json({
        data: {
          id: existing.id,
          status: existing.status,
          message: "Your request has already been received. We'll be in touch!",
        },
        error: null,
      });
    }

    // Create vertical request
    const vr = await context.entities.VerticalRequest.create({
      data: {
        email,
        vertical: vertical.trim(),
        businessShape: businessShape?.trim() ?? null,
        status: "new",
      },
    });

    // Email product team (fire-and-forget)
    const adminEmails = getEnv("ADMIN_EMAILS", "admin@industry-process-templates.prin7r.com");
    const productTeamEmails = getEnv("PRODUCT_TEAM_EMAILS", adminEmails);

    try {
      // Use Wasp's email sender or direct SMTP if configured
      await sendNotificationEmail(productTeamEmails, vr);
    } catch (err) {
      console.error("[vertical-requests] Failed to send notification email:", err);
      // Non-fatal — request is stored in DB regardless
    }

    return res.status(201).json({
      data: {
        id: vr.id,
        status: vr.status,
        message: "Thanks! We'll review your vertical request and get back to you.",
      },
      error: null,
    });
  } catch (error) {
    console.error("[vertical-requests] submit failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to submit vertical request" },
    });
  }
}

/**
 * Send notification email to the product team about a new vertical request.
 * Uses a simple fetch-based email send (Postmark-compatible API) or logs if not configured.
 */
async function sendNotificationEmail(toAddresses: string, vr: any): Promise<void> {
  const postmarkToken = getEnv("POSTMARK_SERVER_TOKEN");

  const subject = `[VerticalPlaybook] New Vertical Request: ${vr.vertical}`;
  const body = `
New vertical request received:

- Vertical: ${vr.vertical}
- Business: ${vr.businessShape ?? "Not provided"}
- Email: ${vr.email}
- ID: ${vr.id}

Respond at: https://app.industry-process-templates.prin7r.com/admin/vertical-requests
`.trim();

  if (postmarkToken) {
    for (const to of toAddresses.split(",").map((s) => s.trim()).filter(Boolean)) {
      try {
        await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": postmarkToken,
          },
          body: JSON.stringify({
            From: "noreply@industry-process-templates.prin7r.com",
            To: to,
            Subject: subject,
            TextBody: body,
            MessageStream: "outbound",
          }),
          signal: AbortSignal.timeout(10_000),
        });
      } catch (err) {
        console.error(`[vertical-requests] Postmark send failed for ${to}:`, err);
      }
    }
  } else {
    console.log(`[vertical-requests] Notification email (no Postmark configured):\nTo: ${toAddresses}\nSubject: ${subject}\n${body}`);
  }
}
