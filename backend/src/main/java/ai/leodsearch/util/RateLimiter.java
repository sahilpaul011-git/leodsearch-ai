package ai.leodsearch.util;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * A minimal fixed-window rate limiter, keyed per client IP. Good enough to
 * stop a single caller from burning through the Tavily/Gemini quota; not
 * meant to be a distributed/production-grade limiter (that would need a
 * shared store like Redis once this runs on more than one instance).
 */
public class RateLimiter {
    private final int maxPerWindow;
    private final long windowMillis = 60_000L;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimiter(int maxPerWindow) {
        this.maxPerWindow = maxPerWindow;
    }

    public boolean allow(String key) {
        long now = System.currentTimeMillis();
        Window window = windows.computeIfAbsent(key, k -> new Window(now));

        synchronized (window) {
            if (now - window.windowStart >= windowMillis) {
                window.windowStart = now;
                window.count.set(0);
            }
            return window.count.incrementAndGet() <= maxPerWindow;
        }
    }

    private static final class Window {
        volatile long windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        Window(long start) {
            this.windowStart = start;
        }
    }
}
