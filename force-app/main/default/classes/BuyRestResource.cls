/**
 * REST API endpoint that converts a plushie enquiry into a purchase.
 * Exposes a single create operation via @RestResource at /services/apexrest/buy.
 * Given an email, resolves it to an Account — reusing an existing Account/Contact match,
 * converting a matching open Lead, or creating and immediately converting a new Lead when
 * neither exists. This org has Person Accounts enabled, so a newly created Lead is converted
 * with no Company value, which Salesforce converts into a Person Account rather than a
 * Business Account. Opportunity and line item creation are added in a follow-up commit.
 * All queries use WITH USER_MODE, and all DML uses AccessLevel.USER_MODE, for CRUD/FLS enforcement.
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
    private static final String ERROR_INSUFFICIENT_ACCESS = 'Insufficient access to perform this operation.';
    private static final String ERROR_NO_CONVERTIBLE_STATUS = 'No convertible Lead status is configured in this org.';
    private static final String DEFAULT_LEAD_LAST_NAME = 'Unknown';
    private static final String DEFAULT_ACCOUNT_NAME = 'Unknown';

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
        } catch (System.NoAccessException e) {
            return handleError(res, 403, ERROR_INSUFFICIENT_ACCESS);
        } catch (BuyResourceException e) {
            return handleError(res, 422, e.getMessage());
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── Private Helpers — Orchestration ────────────────────────────────

    /**
     * Resolves the requesting email to an Account. Opportunity and line item creation for
     * the requested products are added in a follow-up commit.
     * @param payload Parsed request body
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse describing the outcome
     */
    private static ApiResponse processPurchase(BuyRequest payload, RestResponse res) {
        AccountResolution resolution = resolveAccount(payload.email);

        res.statusCode = 501;
        ApiResponse response = new ApiResponse();
        response.success = false;
        response.message = 'Opportunity and line item creation is not implemented yet.';
        response.leadId = resolution.leadId;
        response.accountId = resolution.accountId;
        return response;
    }

    // ─── Private Helpers — Account Resolution ───────────────────────────

    /**
     * Resolves an email to an Account: reuses an existing Account/Contact match when one
     * exists, otherwise converts a matching open Lead, creating one first if none exists.
     * @param email Email address supplied in the request
     * @return The resolved Account (and, when a Lead was converted, its Id)
     */
    private static AccountResolution resolveAccount(String email) {
        AccountResolution existingMatch = findAccountByContactEmail(email);
        if (existingMatch != null) {
            return existingMatch;
        }

        List<Lead> matchingLeads = [
            SELECT Id
            FROM Lead
            WHERE Email = :email AND IsConverted = false
            WITH USER_MODE
            ORDER BY CreatedDate ASC
            LIMIT 1
        ];

        Lead leadToConvert = matchingLeads.isEmpty() ? createLead(email) : matchingLeads[0];
        return convertLead(leadToConvert);
    }

    /**
     * Looks up an Account via a Contact matching the given email.
     * @param email Email address supplied in the request
     * @return An AccountResolution for the Account linked to a matching Contact, or null when none exists
     */
    private static AccountResolution findAccountByContactEmail(String email) {
        List<Contact> matchingContacts = [
            SELECT AccountId, Account.Name
            FROM Contact
            WHERE Email = :email AND AccountId != null
            WITH USER_MODE
            ORDER BY CreatedDate ASC
            LIMIT 1
        ];

        if (matchingContacts.isEmpty()) {
            return null;
        }
        return new AccountResolution(matchingContacts[0].AccountId, matchingContacts[0].Account.Name, null);
    }

    /**
     * Creates a minimal Lead for an email with no existing Account or Lead record. LastName
     * is required on Lead but not supplied by this endpoint, so a placeholder is used; this
     * is a fallback for when the leadCapture endpoint was bypassed. Company is deliberately
     * left blank: this org has Person Accounts enabled, and Salesforce converts a Lead with
     * no Company into a Person Account rather than a Business Account. That requires the
     * running user's profile to have a default Person Account record type assigned — without
     * it, conversion fails with UNAVAILABLE_RECORDTYPE_EXCEPTION.
     * @param email Email address to create the Lead with
     * @return The newly inserted Lead
     */
    private static Lead createLead(String email) {
        Lead newLead = new Lead(
            Email = email,
            LastName = DEFAULT_LEAD_LAST_NAME
        );

        Database.SaveResult saveResult = Database.insert(newLead, false, AccessLevel.USER_MODE);
        if (!saveResult.isSuccess()) {
            throw new BuyResourceException('Unable to create Lead: ' + saveResult.getErrors()[0].getMessage());
        }

        newLead.Id = saveResult.getId();
        return newLead;
    }

    /**
     * Converts the given Lead using the org's default convertible Lead status. No standard
     * Opportunity is created by the conversion itself — processPurchase creates the
     * Opportunity so it can control its fields and attach the requested line items.
     * @param leadToConvert The Lead to convert
     * @return An AccountResolution for the resulting Account, including the source Lead Id
     */
    private static AccountResolution convertLead(Lead leadToConvert) {
        String convertedStatus = getConvertedLeadStatus();

        Database.LeadConvert leadConvert = new Database.LeadConvert();
        leadConvert.setLeadId(leadToConvert.Id);
        leadConvert.setConvertedStatus(convertedStatus);
        leadConvert.setDoNotCreateOpportunity(true);

        List<Database.LeadConvertResult> conversionResults = Database.convertLead(
            new List<Database.LeadConvert>{ leadConvert },
            false
        );
        Database.LeadConvertResult conversionResult = conversionResults[0];

        if (!conversionResult.isSuccess()) {
            throw new BuyResourceException('Unable to convert Lead: ' + conversionResult.getErrors()[0].getMessage());
        }

        List<Account> convertedAccounts = [
            SELECT Id, Name
            FROM Account
            WHERE Id = :conversionResult.getAccountId()
            WITH USER_MODE
            LIMIT 1
        ];

        return new AccountResolution(
            conversionResult.getAccountId(),
            convertedAccounts.isEmpty() ? DEFAULT_ACCOUNT_NAME : convertedAccounts[0].Name,
            leadToConvert.Id
        );
    }

    /**
     * Looks up the org's default convertible Lead status, used to drive standard Lead conversion.
     * @return The MasterLabel of the org's convertible Lead status
     */
    private static String getConvertedLeadStatus() {
        List<LeadStatus> convertedStatuses = [
            SELECT MasterLabel
            FROM LeadStatus
            WHERE IsConverted = true
            WITH USER_MODE
            ORDER BY SortOrder ASC
            LIMIT 1
        ];

        if (convertedStatuses.isEmpty()) {
            throw new BuyResourceException(ERROR_NO_CONVERTIBLE_STATUS);
        }
        return convertedStatuses[0].MasterLabel;
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
     * The outcome of resolving a request email to an Account: the Account itself, and,
     * when a Lead was converted to reach it, the Id of that source Lead.
     */
    private class AccountResolution {
        private final Id accountId;
        private final String accountName;
        private final Id leadId;

        private AccountResolution(Id accountId, String accountName, Id leadId) {
            this.accountId = accountId;
            this.accountName = accountName;
            this.leadId = leadId;
        }
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
