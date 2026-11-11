package ai.leodsearch.services;

import ai.leodsearch.config.EnvConfig;
import ai.leodsearch.models.SearchModels.AiAnswer;
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
 * Calls the Google Gemini API to turn retrieved web sources into a plain-
 * language explanation. The model is deliberately NOT asked to answer from
 * its own general knowledge alone — it's given the actual source snippets
 * fetched via Tavily and asked to explain based on those, which is what
 * makes the "Source Intelligence" promise (no invented citations) honest.
 *
 * If Gemini returns something that isn't parseable JSON, this fails loudly
 * (ApiException) rather than silently returning a guessed-at answer.
 */
public class GeminiService {
    // Override via GEMINI_MODEL if Google renames/retires this model.
    private static final String DEFAULT_MODEL = "gemini-2.0-flash";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(25);

    private final EnvConfig config;
    private final HttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String model;

    public GeminiService(EnvConfig config) {
        this.config = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
        String envModel = System.getenv("GEMINI_MODEL");
        this.model = (envModel == null || envModel.isBlank()) ? DEFAULT_MODEL : envModel;
    }

    public AiAnswer explain(String query, List<WebResult> sources) {
        if (!config.hasGeminiKey()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ai_not_configured",
                    "AI explanations aren't configured yet: GEMINI_API_KEY is missing on the backend.");
        }

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + config.geminiApiKey();

        String prompt = buildPrompt(query, sources);

        try {
            String requestBody = mapper.writeValueAsString(new GeminiRequest(
                    List.of(new Content(List.of(new Part(prompt))))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(REQUEST_TIMEOUT)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ai_upstream_error",
                        "AI provider returned an error (status " + response.statusCode() + ").");
            }

            JsonNode root = mapper.readTree(response.body());
            String text = root.path("candidates").path(0).path("content")
                    .path("parts").path(0).path("text").asText("");

            return parseAnswer(text);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ai_upstream_error",
                    "Couldn't reach the AI provider: " + e.getMessage());
        }
    }

    private String buildPrompt(String query, List<WebResult> sources) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are explaining a topic using ONLY the source excerpts below. ")
          .append("Do not use outside knowledge beyond what's needed for basic sentence structure. ")
          .append("If the sources don't contain enough information, say so plainly instead of guessing.\n\n")
          .append("Question: ").append(query).append("\n\n")
          .append("Sources:\n");

        for (int i = 0; i < sources.size(); i++) {
            WebResult s = sources.get(i);
            sb.append("[").append(i + 1).append("] ").append(s.title())
              .append(" — ").append(s.snippet()).append("\n");
        }

        sb.append("\nRespond with ONLY raw JSON (no markdown fences) in this exact shape:\n")
          .append("{\"summary\": \"a beginner-friendly explanation, 2-4 sentences\", ")
          .append("\"keyPoints\": [\"point 1\", \"point 2\", \"point 3\"]}");

        return sb.toString();
    }

    private AiAnswer parseAnswer(String rawText) {
        try {
            String cleaned = rawText.trim();
            // Gemini sometimes wraps JSON in ```json ... ``` despite instructions.
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n", "").replaceAll("```$", "").trim();
            }
            JsonNode node = mapper.readTree(cleaned);
            String summary = node.path("summary").asText("");
            List<String> points = new ArrayList<>();
            node.path("keyPoints").forEach(p -> points.add(p.asText()));

            if (summary.isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ai_upstream_error",
                        "AI provider returned an empty explanation.");
            }
            return new AiAnswer(summary, points);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ai_parse_error",
                    "Couldn't parse the AI provider's response.");
        }
    }

    // --- Gemini request body shapes ---
    private record GeminiRequest(List<Content> contents) {
    }

    private record Content(List<Part> parts) {
    }

    private record Part(String text) {
    }
}
