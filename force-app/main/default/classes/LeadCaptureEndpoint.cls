/**
 * REST API endpoint for capturing inbound leads from the marketing site.
 * Exposes POST via @RestResource at /services/apexrest/leadCapture.
 * A blank company falls back to 'Unknown' on insert, and leaves an existing Lead's company untouched.
 * Accepts a single LeadCaptureRequest payload and inserts a Lead, or updates the existing
 * Lead matching the given email, storing the requested productKeys as a comma-separated
 * string on Interested_Products__c and missingProductDesc on Missing_Product_Description__c.
 * All DML uses AccessLevel.USER_MODE for CRUD/FLS enforcement.
 *
 * Authentication: OAuth 2.0 via Connected App
 * Base URL: /services/apexrest/leadCapture
 */
@RestResource(urlMapping='/leadCapture')
global with sharing class LeadCaptureEndpoint {

    // ─── Constants ────────────────────────────────────────────────────────
    private static final String ERROR_MISSING_BODY = 'Request body is required.';
    private static final String ERROR_MISSING_LAST_NAME = 'lastName is required.';
    private static final String ERROR_INSUFFICIENT_ACCESS = 'Insufficient access to perform this operation.';
    private static final String DEFAULT_LEAD_SOURCE = 'Web';
    private static final String DEFAULT_COMPANY = 'Unknown';

    // ─── POST — Create ───────────────────────────────────────────────────

    /**
     * Captures a Lead from a JSON request body of the form
     * {"firstName": "...", "lastName": "...", "email": "...", "company": "...", "productKeys": ["..."], "missingProductDesc": "..."}.
     * When email matches an existing Lead, that Lead is updated instead of creating a duplicate.
     * company is optional; when blank it defaults to 'Unknown' for new Leads and is left as-is on existing ones.
     * productKeys are concatenated into Lead.Interested_Products__c as a comma-separated string.
     * POST /services/apexrest/leadCapture
     * @return ApiResponse confirming the created or updated Lead
     */
    @HttpPost
    global static ApiResponse doPost() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            if (req.requestBody == null || String.isBlank(req.requestBody.toString())) {
                return handleError(res, 400, ERROR_MISSING_BODY);
            }

            LeadCaptureRequest payload = (LeadCaptureRequest) JSON.deserialize(
                req.requestBody.toString(),
                LeadCaptureRequest.class
            );

            if (String.isBlank(payload.lastName)) {
                return handleError(res, 400, ERROR_MISSING_LAST_NAME);
            }
            return createLead(payload, res);

        } catch (JSONException e) {
            return handleError(res, 400, 'Malformed JSON: ' + e.getMessage());
        } catch (System.NoAccessException e) {
            return handleError(res, 403, ERROR_INSUFFICIENT_ACCESS);
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────

    /**
     * @param payload Parsed lead capture payload from the request body
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse confirming the created/updated Lead, or an error envelope
     */
    private static ApiResponse createLead(LeadCaptureRequest payload, RestResponse res) {
        String productsJoined = payload.productKeys == null || payload.productKeys.isEmpty()
            ? null
            : String.join(payload.productKeys, ',');

        Lead leadRecord;
        Boolean isUpdate = false;

        if (String.isNotBlank(payload.email)) {
            List<Lead> existingLeads = [
                SELECT Id, Company
                FROM Lead
                WHERE Email = :payload.email
                WITH USER_MODE
                LIMIT 1
            ];
            if (!existingLeads.isEmpty()) {
                leadRecord = existingLeads[0];
                isUpdate = true;
            }
        }

        if (leadRecord == null) {
            leadRecord = new Lead();
        }

        leadRecord.FirstName = payload.firstName;
        leadRecord.LastName = payload.lastName;
        leadRecord.Email = payload.email;
        if (String.isNotBlank(payload.company)) {
            leadRecord.Company = payload.company;
        } else if (String.isBlank(leadRecord.Company)) {
            leadRecord.Company = DEFAULT_COMPANY;
        }
        leadRecord.LeadSource = DEFAULT_LEAD_SOURCE;
        leadRecord.Interested_Products__c = productsJoined;
        leadRecord.Missing_Product_Description__c = payload.missingProductDesc;

        Database.SaveResult saveResult = isUpdate
            ? Database.update(new List<Lead>{ leadRecord }, false, AccessLevel.USER_MODE)[0]
            : Database.insert(new List<Lead>{ leadRecord }, false, AccessLevel.USER_MODE)[0];

        if (!saveResult.isSuccess()) {
            return handleError(res, 422, saveResult.getErrors()[0].getMessage());
        }

        res.statusCode = isUpdate ? 200 : 201;
        return new ApiResponse(
            true,
            isUpdate ? 'Existing Lead updated successfully.' : 'Lead created successfully.',
            saveResult.getId()
        );
    }

    /**
     * @param res The active RestResponse, mutated with statusCode
     * @param statusCode HTTP status code to set on the response
     * @param message Sanitized, user-facing error message
     * @return A failed ApiResponse envelope
     */
    private static ApiResponse handleError(RestResponse res, Integer statusCode, String message) {
        res.statusCode = statusCode;
        return new ApiResponse(false, message, null);
    }

    // ─── Request / Response DTOs ──────────────────────────────────────────

    /**
     * Inbound request payload for POST operations.
     */
    global class LeadCaptureRequest {
        global String firstName;
        global String lastName;
        global String email;
        global String company;
        global List<String> productKeys;
        global String missingProductDesc;
    }

    /**
     * Standardized API response envelope.
     */
    global class ApiResponse {
        global Boolean success;
        global String message;
        global String recordId;

        global ApiResponse(Boolean success, String message, String recordId) {
            this.success = success;
            this.message = message;
            this.recordId = recordId;
        }
    }
}
