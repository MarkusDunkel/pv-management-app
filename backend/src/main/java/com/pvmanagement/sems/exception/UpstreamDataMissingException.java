package com.pvmanagement.sems.exception;

/**
 * Thrown when the SEMS API responds successfully (2xx) but the expected
 * data is missing (e.g. stationData is null or empty).
 *
 * This is not considered a transient failure and retrying usually will not help.
 */
public class UpstreamDataMissingException extends RuntimeException {

    public UpstreamDataMissingException(String message) {
        super(message);
    }

    public UpstreamDataMissingException(String message, Throwable cause) {
        super(message, cause);
    }
}
