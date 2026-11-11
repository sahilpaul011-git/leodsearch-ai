package ai.leodsearch.util;

import ai.leodsearch.models.ApiError;
import io.javalin.http.HttpStatus;

/**
 * A deliberate, expected API error (bad input, missing config, upstream
 * failure) that should be reported to the client as clean JSON instead of
 * a stack trace. Thrown from controllers/services; caught once, globally,
 * in Main.
 */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String message) {
        this(status, status.name().toLowerCase(), message);
    }

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public ApiError toBody() {
        return new ApiError(code, getMessage());
    }
}
