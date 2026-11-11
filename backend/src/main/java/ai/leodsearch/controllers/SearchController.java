package ai.leodsearch.controllers;

import ai.leodsearch.config.EnvConfig;
import ai.leodsearch.models.SearchModels.*;
import ai.leodsearch.services.GeminiService;
import ai.leodsearch.services.TavilySearchService;
import ai.leodsearch.util.ApiException;
import io.javalin.Javalin;
import io.javalin.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Handles both search modes:
 *   POST /api/search/web        -> real web results via Tavily
 *   POST /api/search/knowledge  -> Tavily results + a Gemini-written
 *                                  explanation grounded in those results
 *
 * Both endpoints validate the request body themselves; neither trusts the
 * frontend to have already checked for an empty query.
 */
public class SearchController {
    private final TavilySearchService tavilyService;
    private final GeminiService geminiService;

    public SearchController(EnvConfig config) {
        this.tavilyService = new TavilySearchService(config);
        this.geminiService = new GeminiService(config);
    }

    public void register(Javalin app) {
        app.post("/api/search/web", ctx -> {
            String query = validateQuery(ctx.bodyAsClass(SearchRequest.class));
            List<WebResult> results = tavilyService.search(query);
            ctx.json(new WebSearchResponse(query, results));
        });

        app.post("/api/search/knowledge", ctx -> {
            String query = validateQuery(ctx.bodyAsClass(SearchRequest.class));
            List<WebResult> sources = tavilyService.search(query);

            if (sources.isEmpty()) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "insufficient_evidence",
                        "Not enough web sources were found to answer this confidently.");
            }

            AiAnswer answer = geminiService.explain(query, sources);
            List<SourceRef> supportingSources = sources.stream()
                    .map(s -> new SourceRef(s.title(), s.url()))
                    .collect(Collectors.toList());

            ctx.json(new KnowledgeSearchResponse(query, answer, supportingSources));
        });
    }

    private String validateQuery(SearchRequest request) {
        if (request == null || request.query() == null || request.query().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_query", "A non-empty 'query' field is required.");
        }
        String trimmed = request.query().trim();
        if (trimmed.length() > 500) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "query_too_long", "Query must be 500 characters or fewer.");
        }
        return trimmed;
    }
}
