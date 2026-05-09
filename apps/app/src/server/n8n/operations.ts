/**
 * n8n Install Operations — Phase 3.
 *
 * POST /api/v1/n8n/install
 *   Customer pastes their n8n base URL + API key.
 *   Server validates credentials, then installs each n8n_flow template
 *   from the bundle into their n8n workspace.
 *
 * Security:
 *   - n8n API key encrypted at rest with INTEGRATION_KEY (AES-256-GCM)
 *   - Credentials never logged
 *   - Rate-limited: batches of 10 if >10 flows
 */
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

type N8nContext = {
  entities: {
    License: any;
    BundleVersion: any;
    Template: any;
    Activation: any;
    User: any;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEnv(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

const INTEGRATION_KEY = (): string => {
  const raw = getEnv("INTEGRATION_KEY");
  if (!raw) {
    // For dev: derive from DELIVERY_SIGNING_KEY
    const fallback = getEnv("DELIVERY_SIGNING_KEY", "dev-signing-key-change-in-prod");
    return crypto.createHash("sha256").update(fallback).digest("hex");
  }
  return raw;
};

/** AES-256-GCM encrypt. Returns "iv:tag:ciphertext" hex-encoded. */
function encrypt(plaintext: string): string {
  const key = Buffer.from(INTEGRATION_KEY(), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** AES-256-GCM decrypt. Returns plaintext or null. */
function decrypt(ciphertext: string): string | null {
  try {
    const key = Buffer.from(INTEGRATION_KEY(), "hex");
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Validate n8n credentials by calling GET /api/v1/workflows.
 * Returns true if the connection works, false otherwise.
 */
async function validateN8nCredentials(
  baseUrl: string,
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/workflows?limit=1`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) return { valid: true };
    if (res.status === 401) return { valid: false, error: "Invalid API key — unauthorized" };
    if (res.status === 404) return { valid: false, error: "n8n API not found at this URL" };
    return { valid: false, error: `n8n returned status ${res.status}` };
  } catch (err: any) {
    const message = err?.cause?.code === "ENOTFOUND" || err?.cause?.code === "ECONNREFUSED"
      ? "Could not connect to n8n at this URL"
      : `Connection failed: ${err?.message ?? "unknown error"}`;
    return { valid: false, error: message };
  }
}

/**
 * Install a single n8n workflow JSON into the user's n8n instance.
 * Returns the created workflow id or null on failure.
 */
async function installN8nWorkflow(
  baseUrl: string,
  apiKey: string,
  workflowJson: any,
): Promise<{ id?: string; error?: string }> {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/workflows`;

  try {
    const payload = {
      name: workflowJson.name ?? "VerticalPlaybook Flow",
      nodes: workflowJson.nodes ?? [],
      connections: workflowJson.connections ?? {},
      settings: workflowJson.settings ?? {},
      active: false, // Don't auto-activate — let the user review first
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { error: `n8n returned ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json();
    return { id: data.id ?? data._id };
  } catch (err: any) {
    return { error: `Install failed: ${err?.message ?? "unknown error"}` };
  }
}

// ─── POST /api/v1/n8n/install ─────────────────────────────────────────────────
//
// Installs all n8n_flow templates from a bundle into the user's n8n workspace.
// Body: { licenseId: string, n8nBaseUrl: string, n8nApiKey: string }
// Auth: customer Bearer (must own the license)
// Response: { installedCount, installed: [...], errors: [...] }

export async function installN8nFlows(req: any, res: any, context: N8nContext) {
  const startTime = Date.now();

  try {
    const { licenseId, n8nBaseUrl, n8nApiKey } = req.body ?? {};

    // Validate input
    if (!licenseId || !n8nBaseUrl || !n8nApiKey) {
      return res.status(400).json({
        data: null,
        error: {
          code: "invalid-request",
          message: "licenseId, n8nBaseUrl, and n8nApiKey are required",
        },
      });
    }

    // Validate n8n URL format
    let sanitizedUrl: string;
    try {
      const parsed = new URL(n8nBaseUrl);
      sanitizedUrl = parsed.origin;
    } catch {
      return res.status(400).json({
        data: null,
        error: { code: "invalid-url", message: "n8nBaseUrl is not a valid URL" },
      });
    }

    // Verify license exists and belongs to authenticated user
    const license = await context.entities.License.findUnique({
      where: { id: licenseId },
      include: {
        bundleVersion: {
          include: {
            templates: {
              where: { kind: "n8n_flow" },
            },
          },
        },
        order: true,
      },
    });

    if (!license) {
      return res.status(404).json({
        data: null,
        error: { code: "license-not-found", message: "License not found" },
      });
    }

    // Auth check: user must own the license (or be admin)
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin === true;
    if (!isAdmin && license.order.customerId !== userId) {
      return res.status(403).json({
        data: null,
        error: { code: "forbidden", message: "You do not own this license" },
      });
    }

    if (license.status !== "active") {
      return res.status(403).json({
        data: null,
        error: { code: "license-inactive", message: `License is ${license.status}` },
      });
    }

    const n8nFlowTemplates = license.bundleVersion?.templates ?? [];

    if (n8nFlowTemplates.length === 0) {
      return res.json({
        data: {
          installedCount: 0,
          installed: [],
          errors: [],
          message: "This bundle has no n8n flows to install",
        },
        error: null,
      });
    }

    // Validate n8n credentials
    const validation = await validateN8nCredentials(sanitizedUrl, n8nApiKey);
    if (!validation.valid) {
      return res.status(400).json({
        data: null,
        error: {
          code: "n8n-auth-failed",
          message: validation.error ?? "Failed to authenticate with n8n",
        },
      });
    }

    // Encrypt API key for storage (never log it)
    const encryptedKey = encrypt(n8nApiKey);

    // Install flows in batches of 10
    const BATCH_SIZE = 10;
    const installed: Array<{ templateId: string; title: string; workflowId?: string }> = [];
    const errors: Array<{ templateId: string; title: string; error: string }> = [];

    for (let i = 0; i < n8nFlowTemplates.length; i += BATCH_SIZE) {
      const batch = n8nFlowTemplates.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (template: any) => {
          // Parse the n8n workflow JSON
          let workflowJson: any;
          try {
            workflowJson = typeof template.metadata === "string"
              ? JSON.parse(template.metadata)
              : template.metadata ?? {};
          } catch {
            return {
              templateId: template.id,
              title: template.title,
              error: "Invalid workflow JSON in template metadata",
            };
          }

          // Install the workflow
          const result = await installN8nWorkflow(sanitizedUrl, n8nApiKey, workflowJson);

          if (result.error) {
            return {
              templateId: template.id,
              title: template.title,
              error: result.error,
            };
          }

          // Create Activation record
          try {
            await context.entities.Activation.upsert({
              where: {
                licenseId_templateId: {
                  licenseId,
                  templateId: template.id,
                },
              },
              create: {
                licenseId,
                templateId: template.id,
                status: "installed",
                installedAt: new Date(),
                metadata: {
                  n8nWorkflowId: result.id,
                  n8nBaseUrl: sanitizedUrl,
                  encryptedApiKey: encryptedKey,
                },
              },
              update: {
                status: "installed",
                installedAt: new Date(),
                metadata: {
                  n8nWorkflowId: result.id,
                  n8nBaseUrl: sanitizedUrl,
                  encryptedApiKey: encryptedKey,
                },
              },
            });
          } catch (err) {
            console.error(`[n8n] Failed to create Activation for template ${template.id}:`, err);
            // Non-fatal — workflow was installed, just tracking failed
          }

          return {
            templateId: template.id,
            title: template.title,
            workflowId: result.id,
          };
        }),
      );

      for (const r of batchResults) {
        if ("error" in r && r.error) {
          errors.push(r as any);
        } else {
          installed.push(r as any);
        }
      }

      // Small delay between batches if more batches remain
      if (i + BATCH_SIZE < n8nFlowTemplates.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[n8n] Install complete: ${installed.length}/${n8nFlowTemplates.length} flows in ${elapsed}s ` +
      `(license=${licenseId}, errors=${errors.length})`,
    );

    return res.json({
      data: {
        installedCount: installed.length,
        totalFlows: n8nFlowTemplates.length,
        installed,
        errors: errors.length > 0 ? errors : undefined,
        elapsedSeconds: parseFloat(elapsed),
      },
      error: null,
    });
  } catch (error) {
    console.error("[n8n] install failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "n8n flow installation failed" },
    });
  }
}
