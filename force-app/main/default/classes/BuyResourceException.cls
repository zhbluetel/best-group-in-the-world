/**
 * Custom exception for business-rule failures in BuyRestResource, such as a missing
 * convertible Lead status, an unpriced Standard Price Book, or a failed Lead conversion.
 * Callers translate this into a 422 response, distinct from unexpected system exceptions.
 */
public with sharing class BuyResourceException extends Exception {
}
