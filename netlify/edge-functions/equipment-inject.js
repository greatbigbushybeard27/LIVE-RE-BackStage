export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  const scripts = [];
  if (!html.includes("equipment-profiles.js")) {
    scripts.push('<script src="/equipment-profiles.js?v=1"></script>');
  }
  if (!html.includes("timesheet-period-fix-v4.js")) {
    scripts.push('<script src="/timesheet-period-fix-v4.js?v=4"></script>');
  }
  if (!scripts.length) return new Response(html, { status: response.status, headers });

  const injected = html.replace(/<\/body>/i, scripts.join("\n") + "\n</body>");
  return new Response(injected, { status: response.status, headers });
};
