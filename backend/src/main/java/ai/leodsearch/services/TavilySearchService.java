package ai.leodsearch.services;

import ai.leodsearch.config.EnvConfig;
import ai.leodsearch.models.SearchModels.WebResult;
import ai.leodsearch.util.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.HttpStatus;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Talks to the Tavily Search API to retrieve real web results: titles,
 * URLs, snippets and source domains. Never invents a result — if Tavily
 * returns nothing, or the API key is missing, this throws rather than
 * fabricating data.
 */
public class TavilySearchService {
    private static final String TAVILY_ENDPOINT = "https://api.tavily.com/search";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(15);

    private final EnvConfig config;
    private final HttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public TavilySearchService(EnvConfig config) {
        this.config = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
    }

    public List<WebResult> search(String query) {
        if (!config.hasTavilyKey()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "search_not_configured",
                    "Web search isn't configured yet: TAVILY_API_KEY is missing on the backend.");
        }

        try {
            String requestBody = mapper.writeValueAsString(new TavilyRequest(
                    config.tavilyApiKey(), query, "basic", 6
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TAVILY_ENDPOINT))
                    .timeout(REQUEST_TIMEOUT)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "search_upstream_error",
                        "Web search provider returned an error (status " + response.statusCode() + ").");
            }

            JsonNode root = mapper.readTree(response.body());
            JsonNode results = root.path("results");

            List<WebResult> parsed = new ArrayList<>();
            if (results.isArray()) {
                for (JsonNode r : results) {
                    String url = r.path("url").asText("");
                    parsed.add(new WebResult(
                            r.path("title").asText(""),
                            url,
                            r.path("content").asText(""),
                            extractDomain(url)
                    ));
                }
            }
            return parsed;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "search_upstream_error",
                    "Couldn't reach the web search provider: " + e.getMessage());
        }
    }

    private static String extractDomain(String url) {
        try {
            String host = URI.create(url).getHost();
            return host == null ? url : host.replaceFirst("^www\\.", "");
        } catch (Exception e) {
            return url;
        }
    }

    /** Tavily's request body shape. */
    private record TavilyRequest(String api_key, String query, String search_depth, int max_results) {
    }
}
