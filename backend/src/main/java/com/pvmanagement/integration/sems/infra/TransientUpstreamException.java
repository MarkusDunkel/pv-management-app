package com.pvmanagement.integration.sems.infra;

/**
 * Represents temporary upstream failures (timeouts, rate limits, 5xx errors...)
 * where retrying the request makes sense.
 *
 * Resilience4j should be configured to retry when this exception is thrown.
 */
public class TransientUpstreamException extends RuntimeException {

    public TransientUpstreamException(String message) {
        super(message);
    }

    public TransientUpstreamException(String message, Throwable cause) {
        super(message, cause);
    }
}
