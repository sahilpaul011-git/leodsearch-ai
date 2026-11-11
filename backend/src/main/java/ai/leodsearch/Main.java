package ai.leodsearch;

import ai.leodsearch.config.EnvConfig;
import ai.leodsearch.controllers.HealthController;
import ai.leodsearch.controllers.SearchController;
import ai.leodsearch.util.ApiException;
import ai.leodsearch.util.RateLimiter;
import io.javalin.Javalin;
import io.javalin.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Entry point for the LeodSearch AI backend.
 *
 * Responsibilities kept here on purpose, to keep this class small:
 *   - wiring Javalin up (CORS, JSON mapper defaults are automatic)
 *   - global exception handling, so every error returns clean JSON
 *   - registering each controller's routes
 *
 * Actual business logic (search, AI calls) lives in the services package,
 * never in this file or directly inside route handlers.
 */
public class Main {
    private static final Logger log = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        EnvConfig config = EnvConfig.load();
        RateLimiter rateLimiter = new RateLimiter(config.rateLimitPerMinute());

        Javalin app = Javalin.create(cfg -> {
            cfg.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    if (config.allowedOrigin().equals("*")) {
                        rule.anyHost();
                    } else {
                        rule.allowHost(config.allowedOrigin());
                    }
                });
            });
            cfg.http.defaultContentType = "application/json";
        });

        // Simple global rate limit: protects the Tavily/Gemini quota from
        // being burned by a single caller. Returns 429 with a clear body
        // rather than silently dropping requests.
        app.before(ctx -> {
            String clientKey = ctx.ip();
            if (!rateLimiter.allow(clientKey)) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded. Please slow down and try again shortly.");
            }
        });

        app.exception(ApiException.class, (e, ctx) -> {
            ctx.status(e.getStatus());
            ctx.json(e.toBody());
        });

        app.exception(Exception.class, (e, ctx) -> {
            log.error("Unhandled exception on {} {}", ctx.method(), ctx.path(), e);
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR);
            ctx.json(new ai.leodsearch.models.ApiError("internal_error", "Something went wrong. Please try again."));
        });

        new HealthController().register(app);
        new SearchController(config).register(app);

        app.start(config.port());
        log.info("LeodSearch AI backend listening on port {}", config.port());
    }
}
