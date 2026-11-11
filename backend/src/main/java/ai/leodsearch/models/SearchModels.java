package ai.leodsearch.models;

import java.util.List;

/** Request/response shapes for the web search and knowledge search endpoints. */
public class SearchModels {

    public record SearchRequest(String query) {
    }

    public record WebResult(String title, String url, String snippet, String source) {
    }

    public record WebSearchResponse(String query, List<WebResult> results) {
    }

    public record AiAnswer(String summary, List<String> keyPoints) {
    }

    public record SourceRef(String title, String url) {
    }

    public record KnowledgeSearchResponse(String query, AiAnswer aiAnswer, List<SourceRef> supportingSources) {
    }
}
