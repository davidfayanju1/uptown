// Interswitch returns the shopper to site_redirect_url with a form POST, which
// a static SPA route cannot serve (no HTML is rendered for non-GET requests —
// the host answers 404/405). This bounces the POST to the client-side route as
// a GET, carrying the gateway's params through untouched.

const toParams = (source) => {
  const params = new URLSearchParams();
  if (!source) return params;

  // Vercel parses form/JSON bodies, but falls back to a raw string when the
  // content-type is unrecognised.
  const entries =
    typeof source === "string"
      ? [...new URLSearchParams(source).entries()]
      : Object.entries(source);

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params;
};

export default function handler(req, res) {
  const params = toParams(req.query);

  if (req.method === "POST") {
    for (const [key, value] of toParams(req.body)) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  res.setHeader("Location", `/payment/callback${query ? `?${query}` : ""}`);
  // 303 rather than 302: it obliges the client to follow up with a GET, which
  // is the whole point of the bounce.
  res.status(303).end();
}
