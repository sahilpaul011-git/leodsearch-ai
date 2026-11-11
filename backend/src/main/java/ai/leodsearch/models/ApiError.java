package ai.leodsearch.models;

/** Standard error shape returned for every failed request. */
public record ApiError(String code, String message) {
}
