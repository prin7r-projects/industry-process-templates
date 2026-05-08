export class MissingEnvError extends Error {
  constructor(public name: string) {
    super(`Missing required environment variable: ${name}`);
  }
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  return undefined;
}

export function requiredEnv(name: string): string {
  const value = optionalEnv(name);
  if (!value) throw new MissingEnvError(name);
  return value;
}

export function appUrlFromRequest(request: Request): string {
  const fromEnv = optionalEnv("NEXT_PUBLIC_APP_URL");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Fallback: derive from request
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}
