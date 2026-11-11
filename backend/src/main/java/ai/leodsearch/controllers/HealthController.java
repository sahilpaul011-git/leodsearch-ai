package ai.leodsearch.controllers;

import io.javalin.Javalin;

import java.time.Instant;
import java.util.Map;

/** GET /api/health — used by Render (and anyone) to confirm the backend is up. */
public class HealthController {
    public void register(Javalin app) {
        app.get("/api/health", ctx -> ctx.json(Map.of(
                "status", "ok",
                "service", "leodsearch-backend",
                "time", Instant.now().toString()
        )));
    }
}
