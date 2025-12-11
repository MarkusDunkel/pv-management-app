package com.pvmanagement.auth.infra;

/**
 * Thrown when the SEMS API indicates that the current authorization token
 * is no longer valid (session expired, logged out remotely, etc).
 *
 * This exception is considered "fatal" for retry logic – retrying the same
 * request without refreshing the token will not help.
 */
public class AuthorizationExpiredException extends RuntimeException {

    public AuthorizationExpiredException(String message) {
        super(message);
    }

    public AuthorizationExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
