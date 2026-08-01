import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Mirrors api/payment/callback.js in dev, where Vercel functions don't run.
// Without this, the gateway's POST return leg 404s locally.
const paymentCallbackBounce = () => ({
  name: "payment-callback-bounce",
  configureServer(server) {
    server.middlewares.use("/api/payment/callback", (req, res, next) => {
      if (req.method !== "POST" && req.method !== "GET") return next();

      const [, search = ""] = req.url.split("?");
      const params = new URLSearchParams(search);

      const finish = () => {
        const query = params.toString();
        // 303 obliges the client to follow up with a GET — see api/payment/callback.js
        res.writeHead(303, {
          Location: `/payment/callback${query ? `?${query}` : ""}`,
        });
        res.end();
      };

      if (req.method === "GET") return finish();

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        for (const [key, value] of new URLSearchParams(body)) {
          if (value !== "") params.set(key, value);
        }
        finish();
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), paymentCallbackBounce()],
});
