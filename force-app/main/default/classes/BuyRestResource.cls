/**
 * REST API endpoint that converts a plushie enquiry into a purchase.
 * Exposes a single create operation via @RestResource at /services/apexrest/buy.
 * POST /services/apexrest/buy
 *
 * Authentication: OAuth 2.0 via Connected App
 * Base URL: /services/apexrest/buy
 */
@RestResource(urlMapping='/buy')
global with sharing class BuyRestResource {

    // ─── Constants ────────────────────────────────────────────────────────
    private static final String ERROR_MISSING_BODY = 'Request body is required.';
    private static final String ERROR_MISSING_EMAIL = 'Email is required.';
    private static final String ERROR_MISSING_PRODUCTS = 'At least one product is required in the products array.';

    // ─── POST — Buy ───────────────────────────────────────────────────────

    /**
     * Validates the request and hands it off to the purchase pipeline.
     * POST /services/apexrest/buy
     * @return ApiResponse with the resulting leadId/accountId/opportunityId and a per-product result list
     */
    @HttpPost
    global static ApiResponse doPost() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            if (req.requestBody == null || String.isBlank(req.requestBody.toString())) {
                return handleError(res, 400, ERROR_MISSING_BODY);
            }

            BuyRequest payload = (BuyRequest) JSON.deserialize(req.requestBody.toString(), BuyRequest.class);

            if (String.isBlank(payload.email)) {
                return handleError(res, 400, ERROR_MISSING_EMAIL);
            }
            if (payload.products == null || payload.products.isEmpty()) {
                return handleError(res, 400, ERROR_MISSING_PRODUCTS);
            }

            return processPurchase(payload, res);

        } catch (JSONException e) {
            return handleError(res, 400, 'Malformed JSON: ' + e.getMessage());
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────

    /**
     * Placeholder for the purchase pipeline: Account resolution and Opportunity/line item
     * creation are added in follow-up commits.
     * @param payload Parsed request body
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse describing the outcome
     */
    private static ApiResponse processPurchase(BuyRequest payload, RestResponse res) {
        return handleError(res, 501, 'Purchase processing is not implemented yet.');
    }

    /**
     * Builds the failed ApiResponse envelope for an error branch and sets the response status code.
     * @param res The active RestResponse, mutated with statusCode
     * @param statusCode HTTP status code to set on the response
     * @param message Sanitized, user-facing error message
     * @return A failed ApiResponse envelope
     */
    private static ApiResponse handleError(RestResponse res, Integer statusCode, String message) {
        res.statusCode = statusCode;
        ApiResponse response = new ApiResponse();
        response.success = false;
        response.message = message;
        return response;
    }

    // ─── Request / Response DTOs ──────────────────────────────────────────

    /**
     * Inbound request payload: an email and the products being purchased.
     */
    global class BuyRequest {
        global String email;
        global List<BuyLineItemRequest> products;
    }

    /**
     * A single requested product line within a buy request.
     */
    global class BuyLineItemRequest {
        global String productKey;
        global Integer quantity;
    }

    /**
     * Per-product outcome of a buy request, keyed back to the submitted productKey.
     */
    global class BuyLineResult {
        global Boolean success;
        global String message;
        global String productKey;
        global Integer quantity;
    }

    /**
     * Standardized API response envelope.
     * All endpoints return this structure for consistent client parsing.
     */
    global class ApiResponse {
        global Boolean success;
        global String message;
        global String leadId;
        global String accountId;
        global String opportunityId;
        global List<BuyLineResult> results;
    }
}
