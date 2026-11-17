export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  if (html.includes("equipment-profiles.js")) {
    return new Response(html, { status: response.status, headers });
  }

  const injected = html.replace(
    /<\/body>/i,
    '<script src="/equipment-profiles.js?v=1"></script>\n</body>'
  );
  return new Response(injected, { status: response.status, headers });
};
