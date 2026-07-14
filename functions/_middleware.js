export async function onRequest(context) {
  const { request, env, next } = context;
  const authHeader = request.headers.get("Authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : decoded;

      if (password === env.SITE_PASSWORD) {
        return next();
      }
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Eternal Empire Guild", charset="UTF-8"'
    }
  });
}