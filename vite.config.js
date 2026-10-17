import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Ensure process.env has the variables loaded from .env
  for (const [key, val] of Object.entries(env)) {
    if (val) {
      process.env[key] = val;
    }
  }

  return {
    plugins: [
      react(),
      {
        name: "local-api-chat-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = (req.url || "").split("?")[0];
            if (urlPath === "/api/chat" && req.method === "POST") {
              let bodyStr = "";
              req.on("data", (chunk) => {
                bodyStr += chunk;
              });
              req.on("end", async () => {
                try {
                  let parsedBody = {};
                  try {
                    parsedBody = bodyStr ? JSON.parse(bodyStr) : {};
                  } catch {
                    parsedBody = {};
                  }

                  req.body = parsedBody;

                  // Provide status and json helpers matching Vercel's response signature
                  res.status = function (code) {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = function (payload) {
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(payload));
                    return res;
                  };

                  // Load api/chat.js dynamically through Vite's SSR runtime
                  const chatModule = await server.ssrLoadModule("/api/chat.js");
                  const handler = chatModule.default;
                  if (typeof handler === "function") {
                    await handler(req, res);
                  } else {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "api/chat.js handler not found." }));
                  }
                } catch (err) {
                  console.error("Local API chat error:", err);
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: err.message || "Failed to execute chat API." }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
  };
});
