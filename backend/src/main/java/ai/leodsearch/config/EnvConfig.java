package ai.leodsearch.config;

/**
 * Reads all configuration from environment variables. Nothing secret is
 * ever hardcoded here — Tavily and Gemini keys live only in the hosting
 * platform's environment variable settings (e.g. Render's dashboard), never
 * in this source file or anywhere committed to the repository.
 */
public record EnvConfig(
        int port,
        String allowedOrigin,
        String tavilyApiKey,
        String geminiApiKey,
        int rateLimitPerMinute
) {
    public static EnvConfig load() {
        return new EnvConfig(
                readInt("PORT", 7070),
                readString("ALLOWED_ORIGIN", "*"),
                readString("TAVILY_API_KEY", null),
                readString("GEMINI_API_KEY", null),
                readInt("RATE_LIMIT_PER_MINUTE", 30)
        );
    }

    public boolean hasTavilyKey() {
        return tavilyApiKey != null && !tavilyApiKey.isBlank();
    }

    public boolean hasGeminiKey() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }

    private static String readString(String name, String fallback) {
        String value = System.getenv(name);
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private static int readInt(String name, int fallback) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) return fallback;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}
