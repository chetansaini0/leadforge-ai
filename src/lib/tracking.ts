/** Resolve the public base URL for building tracking links (server-side). */
export function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Absolute URL for the open-tracking pixel of a given outreach message. */
export function trackingPixelUrl(base: string, outreachId: string): string {
  return `${base}/api/track/${outreachId}.gif`;
}

/**
 * Wrap a plain-text email body into simple HTML with an invisible tracking
 * pixel appended, so opens can be recorded when the recipient loads images.
 */
export function emailHtmlWithPixel(body: string, pixelUrl: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped.replace(/\n/g, "<br>");
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">',
    html,
    "</div>",
    `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`,
  ].join("");
}
