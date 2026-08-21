/**
 * REST API endpoint that converts a plushie enquiry into a purchase.
 * Exposes a single create operation via @RestResource at /services/apexrest/buy.
 * Given an email, resolves it to an Account — reusing an existing Account/Contact match,
 * converting a matching open Lead, or creating and immediately converting a new Lead when
 * neither exists. This org has Person Accounts enabled, so a newly created Lead is converted
 * with no Company value, which Salesforce converts into a Person Account rather than a
 * Business Account. It then creates an Opportunity with OpportunityLineItems for the
 * requested products, priced from Product2.Price__c. Each line still references a Standard
 * Price Book entry, since OpportunityLineItem requires one regardless of where the charged
 * price comes from.
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
    private static final String ERROR_NO_PRICEBOOK = 'No Standard Price Book is configured in this org.';
    private static final String ERROR_NO_VALID_PRODUCTS = 'None of the requested products could be found or priced.';
    private static final String DEFAULT_LEAD_LAST_NAME = 'Unknown';
    private static final String DEFAULT_ACCOUNT_NAME = 'Unknown';
    private static final String OPPORTUNITY_STAGE = 'Closed Won';

    // ─── POST — Buy ───────────────────────────────────────────────────────

    /**
     * Converts an enquiry into a purchase: resolves the email to an Account, then creates
     * an Opportunity with line items for the requested products.
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
     * Resolves the requesting email to an Account, then creates an Opportunity and its
     * line items for every requested product that can be found and priced. When none of
     * the requested products can be fulfilled, no Opportunity is created.
     * @param payload Parsed request body
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse describing the outcome, including per-product results
     */
    private static ApiResponse processPurchase(BuyRequest payload, RestResponse res) {
        AccountResolution resolution = resolveAccount(payload.email);

        Id standardPricebookId = getStandardPricebookId();
        if (standardPricebookId == null) {
            throw new BuyResourceException(ERROR_NO_PRICEBOOK);
        }

        Map<String, ProductPricing> pricingByProductKey = getProductPricingByProductKey(
            payload.products,
            standardPricebookId
        );
        LineItemEvaluation evaluation = evaluateLineItems(payload.products, pricingByProductKey);

        if (evaluation.validLineItems.isEmpty()) {
            throw new BuyResourceException(ERROR_NO_VALID_PRODUCTS);
        }

        Id opportunityId = createOpportunity(resolution, standardPricebookId);
        insertLineItems(opportunityId, evaluation, pricingByProductKey);

        Integer successCount = countSuccesses(evaluation.results);
        res.statusCode = successCount == evaluation.results.size() ? 201 : 207;

        ApiResponse response = new ApiResponse();
        response.success = successCount > 0;
        response.message = successCount + ' of ' + evaluation.results.size() + ' line item(s) added.';
        response.leadId = resolution.leadId;
        response.accountId = resolution.accountId;
        response.opportunityId = opportunityId;
        response.results = evaluation.results;
        return response;
    }

    /**
     * Validates each requested product line against its resolved pricing, splitting
     * requests into a full per-product result list and the subset that passed validation.
     * @param products Requested product line items
     * @param pricingByProductKey Pricing resolved by getProductPricingByProductKey
     * @return The per-product results and the subset of requests eligible for insertion
     */
    private static LineItemEvaluation evaluateLineItems(
        List<BuyLineItemRequest> products,
        Map<String, ProductPricing> pricingByProductKey
    ) {
        LineItemEvaluation evaluation = new LineItemEvaluation();

        for (BuyLineItemRequest item : products) {
            BuyLineResult result = new BuyLineResult();
            result.productKey = item.productKey;
            result.quantity = item.quantity;

            if (item.quantity == null || item.quantity <= 0) {
                result.success = false;
                result.message = 'Quantity must be a positive number.';
            } else if (!pricingByProductKey.containsKey(item.productKey)) {
                result.success = false;
                result.message = 'Product not found, not priced, or not linked to the Standard Price Book: '
                    + item.productKey;
            } else {
                result.success = true;
                result.message = 'Line item added.';
                evaluation.validLineItems.add(item);
            }
            evaluation.results.add(result);
        }
        return evaluation;
    }

    /**
     * Creates the Opportunity that the requested product lines will be attached to.
     * @param resolution The resolved Account to attach the Opportunity to
     * @param standardPricebookId Id of the org's Standard Price Book
     * @return The Id of the newly inserted Opportunity
     */
    private static Id createOpportunity(AccountResolution resolution, Id standardPricebookId) {
        Opportunity opportunity = new Opportunity(
            Name = resolution.accountName + ' - Plushie Order',
            AccountId = resolution.accountId,
            StageName = OPPORTUNITY_STAGE,
            CloseDate = Date.today(),
            Pricebook2Id = standardPricebookId
        );

        Database.SaveResult opportunitySaveResult = Database.insert(opportunity, false, AccessLevel.USER_MODE);
        if (!opportunitySaveResult.isSuccess()) {
            throw new BuyResourceException(
                'Unable to create Opportunity: ' + opportunitySaveResult.getErrors()[0].getMessage()
            );
        }
        return opportunitySaveResult.getId();
    }

    /**
     * Bulk-inserts an OpportunityLineItem for each valid product line, then reflects any
     * per-line DML failures back onto evaluation.results.
     * @param opportunityId Id of the Opportunity to attach line items to
     * @param evaluation Result of evaluateLineItems, mutated with any DML failures
     * @param pricingByProductKey Pricing resolved by getProductPricingByProductKey
     */
    private static void insertLineItems(
        Id opportunityId,
        LineItemEvaluation evaluation,
        Map<String, ProductPricing> pricingByProductKey
    ) {
        List<OpportunityLineItem> lineItemsToInsert = new List<OpportunityLineItem>();
        for (BuyLineItemRequest item : evaluation.validLineItems) {
            ProductPricing pricing = pricingByProductKey.get(item.productKey);
            lineItemsToInsert.add(new OpportunityLineItem(
                OpportunityId = opportunityId,
                PricebookEntryId = pricing.pricebookEntryId,
                Quantity = item.quantity,
                UnitPrice = pricing.unitPrice
            ));
        }

        List<Database.SaveResult> lineItemSaveResults = Database.insert(
            lineItemsToInsert,
            false,
            AccessLevel.USER_MODE
        );
        applyLineItemSaveResults(evaluation.results, evaluation.validLineItems, lineItemSaveResults);
    }

    /**
     * Counts how many product line results were marked successful.
     * @param results Per-product result list to count successes within
     * @return The number of results marked successful
     */
    private static Integer countSuccesses(List<BuyLineResult> results) {
        Integer successCount = 0;
        for (BuyLineResult result : results) {
            if (result.success) {
                successCount++;
            }
        }
        return successCount;
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

    // ─── Private Helpers — Product Pricing & Line Items ─────────────────

    /**
     * Bulk-resolves pricing for every requested product in one query: the charged price comes
     * from Product2.Price__c, while the linked Standard Price Book entry Id is only carried
     * along because OpportunityLineItem requires a PricebookEntryId regardless of price source.
     * A product with no Price__c or no active Standard Price Book entry is left out of the map.
     * @param products Requested product line items
     * @param standardPricebookId Id of the org's Standard Price Book
     * @return Map of ProductCode to its resolved pricing, for products that have one
     */
    private static Map<String, ProductPricing> getProductPricingByProductKey(
        List<BuyLineItemRequest> products,
        Id standardPricebookId
    ) {
        Set<String> productKeys = new Set<String>();
        for (BuyLineItemRequest item : products) {
            productKeys.add(item.productKey);
        }

        List<Product2> matchingProducts = [
            SELECT ProductCode, Price__c, (
                SELECT Id
                FROM PricebookEntries
                WHERE Pricebook2Id = :standardPricebookId AND IsActive = true
                LIMIT 1
            )
            FROM Product2
            WHERE ProductCode IN :productKeys
            WITH USER_MODE
        ];

        Map<String, ProductPricing> pricingByProductKey = new Map<String, ProductPricing>();
        for (Product2 product : matchingProducts) {
            if (product.Price__c == null || product.PricebookEntries.isEmpty()) {
                continue;
            }
            ProductPricing pricing = new ProductPricing();
            pricing.pricebookEntryId = product.PricebookEntries[0].Id;
            pricing.unitPrice = product.Price__c;
            pricingByProductKey.put(product.ProductCode, pricing);
        }
        return pricingByProductKey;
    }

    /**
     * Applies OpportunityLineItem DML outcomes back onto the matching per-product result,
     * looked up by productKey; only called for the subset of items that passed pricing.
     * @param results Full per-product result list, one entry per requested product
     * @param validLineItems The subset of requests that were inserted, in insertion order
     * @param lineItemSaveResults DML results for validLineItems, in the same order
     */
    private static void applyLineItemSaveResults(
        List<BuyLineResult> results,
        List<BuyLineItemRequest> validLineItems,
        List<Database.SaveResult> lineItemSaveResults
    ) {
        Map<String, BuyLineResult> resultByProductKey = new Map<String, BuyLineResult>();
        for (BuyLineResult result : results) {
            resultByProductKey.put(result.productKey, result);
        }

        for (Integer i = 0; i < lineItemSaveResults.size(); i++) {
            Database.SaveResult saveResult = lineItemSaveResults[i];
            if (saveResult.isSuccess()) {
                continue;
            }
            BuyLineResult result = resultByProductKey.get(validLineItems[i].productKey);
            result.success = false;
            result.message = 'Line item could not be saved: ' + saveResult.getErrors()[0].getMessage();
        }
    }

    /**
     * Looks up the org's Standard Price Book, required before Opportunity line items can be priced.
     * In test context, SOQL cannot see the Standard Price Book unless Test.getStandardPricebookId()
     * is called instead, so tests take that path rather than the normal query.
     * @return The Id of the org's Standard Price Book, or null when none is visible to the running user
     */
    private static Id getStandardPricebookId() {
        if (Test.isRunningTest()) {
            return Test.getStandardPricebookId();
        }

        List<Pricebook2> standardPricebooks = [
            SELECT Id
            FROM Pricebook2
            WHERE IsStandard = true
            WITH USER_MODE
            LIMIT 1
        ];
        return standardPricebooks.isEmpty() ? null : standardPricebooks[0].Id;
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
     * A product's resolved pricing for a purchase: the price to charge (from Product2.Price__c)
     * and the Standard Price Book entry Id that OpportunityLineItem requires as a reference.
     */
    private class ProductPricing {
        private Id pricebookEntryId;
        private Decimal unitPrice;
    }

    /**
     * The outcome of validating requested product lines: the full per-product result list,
     * and the subset of requests eligible for insertion as OpportunityLineItems.
     */
    private class LineItemEvaluation {
        private List<BuyLineResult> results = new List<BuyLineResult>();
        private List<BuyLineItemRequest> validLineItems = new List<BuyLineItemRequest>();
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
