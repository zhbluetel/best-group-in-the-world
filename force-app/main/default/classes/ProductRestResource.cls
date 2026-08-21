/**
 * REST API endpoint for Product2 operations.
 * Exposes CRUD operations via @RestResource at /services/apexrest/products.
 * POST accepts a bulk {"products": [...]} array using productName/productKey/productPrice
 * field names; productPrice is persisted as a PricebookEntry on the Standard Price Book,
 * since Product2 has no native price field.
 * All queries use WITH USER_MODE, and all DML uses AccessLevel.USER_MODE, for CRUD/FLS enforcement.
 *
 * Authentication: OAuth 2.0 via Connected App
 * Base URL: /services/apexrest/products
 */
@RestResource(urlMapping='/products')
global with sharing class ProductRestResource {

    // ─── Constants ────────────────────────────────────────────────────────
    private static final Integer MAX_RECORDS_RETURNED = 10000;
    private static final String ERROR_MISSING_ID = 'Record Id is required in the URL path.';
    private static final String ERROR_INVALID_ID = 'Invalid Salesforce Id format.';
    private static final String ERROR_MISSING_BODY = 'Request body is required.';
    private static final String ERROR_MISSING_NAME = 'Product name is required.';
    private static final String ERROR_MISSING_PRODUCTS = 'At least one product is required in the products array.';
    private static final String ERROR_NOT_FOUND = 'Product record not found.';
    private static final String ERROR_INSUFFICIENT_ACCESS = 'Insufficient access to perform this operation.';
    private static final Set<String> ALLOWED_UPDATE_FIELDS = new Set<String>{
        'Name', 'ProductCode', 'Description', 'Family', 'IsActive'
    };

    // ─── GET — Retrieve ───────────────────────────────────────────────────

    /**
     * Retrieves a single Product2 by Id (URL path), or the full product catalog when no Id is given.
     * Single: GET /services/apexrest/products/{recordId}
     * All:    GET /services/apexrest/products
     * @return ApiResponse containing the requested data
     */
    @HttpGet
    global static ApiResponse doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            String recordId = extractIdFromUri(req.requestURI);

            if (String.isNotBlank(recordId)) {
                return getSingleRecord(recordId, res);
            }
            return getRecordList(res);

        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── POST — Create ───────────────────────────────────────────────────

    /**
     * Bulk-creates Product2 records from a JSON request body of the form
     * {"products": [{"productName": "...", "productKey": "...", "productPrice": 10.99}]}.
     * Product2 has no native price field, so a non-blank productPrice is persisted as a
     * PricebookEntry (UnitPrice) against the org's Standard Price Book.
     * POST /services/apexrest/products
     * @return ApiResponse with a per-product ProductResult in the results field
     */
    @HttpPost
    global static ApiResponse doPost() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            if (req.requestBody == null || String.isBlank(req.requestBody.toString())) {
                return handleError(res, 400, ERROR_MISSING_BODY);
            }

            ProductListRequest payload = (ProductListRequest) JSON.deserialize(
                req.requestBody.toString(),
                ProductListRequest.class
            );

            if (payload.products == null || payload.products.isEmpty()) {
                return handleError(res, 400, ERROR_MISSING_PRODUCTS);
            }

            return createProducts(payload.products, res);

        } catch (JSONException e) {
            return handleError(res, 400, 'Malformed JSON: ' + e.getMessage());
        } catch (System.NoAccessException e) {
            return handleError(res, 403, ERROR_INSUFFICIENT_ACCESS);
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── PATCH — Partial Update ───────────────────────────────────────────

    /**
     * Partially updates an existing Product2 record. Only fields present in
     * ALLOWED_UPDATE_FIELDS are applied; all other payload keys are ignored.
     * PATCH /services/apexrest/products/{recordId}
     * @return ApiResponse confirming the update
     */
    @HttpPatch
    global static ApiResponse doPatch() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            String recordId = extractIdFromUri(req.requestURI);
            if (String.isBlank(recordId)) {
                return handleError(res, 400, ERROR_MISSING_ID);
            }
            if (!isValidSalesforceId(recordId)) {
                return handleError(res, 400, ERROR_INVALID_ID);
            }
            if (req.requestBody == null || String.isBlank(req.requestBody.toString())) {
                return handleError(res, 400, ERROR_MISSING_BODY);
            }

            List<Product2> existing = [
                SELECT Id
                FROM Product2
                WHERE Id = :recordId
                WITH USER_MODE
                LIMIT 1
            ];
            if (existing.isEmpty()) {
                return handleError(res, 404, ERROR_NOT_FOUND);
            }

            Map<String, Object> fieldUpdates = (Map<String, Object>) JSON.deserializeUntyped(
                req.requestBody.toString()
            );

            Product2 record = applyAllowedFieldUpdates(existing[0], fieldUpdates);

            List<Database.SaveResult> saveResults = Database.update(
                new List<Product2>{ record },
                false,
                AccessLevel.USER_MODE
            );
            Database.SaveResult saveResult = saveResults[0];

            if (saveResult.isSuccess()) {
                res.statusCode = 200;
                return new ApiResponse(true, 'Record updated successfully.', saveResult.getId());
            }

            return handleError(res, 422, saveResult.getErrors()[0].getMessage());

        } catch (JSONException e) {
            return handleError(res, 400, 'Malformed JSON: ' + e.getMessage());
        } catch (System.NoAccessException e) {
            return handleError(res, 403, ERROR_INSUFFICIENT_ACCESS);
        } catch (DmlException e) {
            return handleError(res, 422, 'Validation failed: ' + e.getDmlMessage(0));
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── DELETE — Remove ──────────────────────────────────────────────────

    /**
     * Deletes a Product2 record by Id.
     * DELETE /services/apexrest/products/{recordId}
     * @return ApiResponse confirming the deletion
     */
    @HttpDelete
    global static ApiResponse doDelete() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            String recordId = extractIdFromUri(req.requestURI);
            if (String.isBlank(recordId)) {
                return handleError(res, 400, ERROR_MISSING_ID);
            }
            if (!isValidSalesforceId(recordId)) {
                return handleError(res, 400, ERROR_INVALID_ID);
            }

            List<Product2> existing = [
                SELECT Id
                FROM Product2
                WHERE Id = :recordId
                WITH USER_MODE
                LIMIT 1
            ];
            if (existing.isEmpty()) {
                return handleError(res, 404, ERROR_NOT_FOUND);
            }

            List<Database.DeleteResult> deleteResults = Database.delete(
                new List<Product2>{ existing[0] },
                false,
                AccessLevel.USER_MODE
            );
            Database.DeleteResult deleteResult = deleteResults[0];

            if (deleteResult.isSuccess()) {
                res.statusCode = 200;
                return new ApiResponse(true, 'Record deleted successfully.', recordId);
            }

            return handleError(res, 422, deleteResult.getErrors()[0].getMessage());

        } catch (System.NoAccessException e) {
            return handleError(res, 403, ERROR_INSUFFICIENT_ACCESS);
        } catch (DmlException e) {
            return handleError(res, 422, e.getDmlMessage(0));
        } catch (Exception e) {
            return handleError(res, 500, e.getMessage());
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────

    /**
     * @param recordId Id of the Product2 to retrieve
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse containing the single Product2 record, or an error envelope
     */
    private static ApiResponse getSingleRecord(String recordId, RestResponse res) {
        if (!isValidSalesforceId(recordId)) {
            return handleError(res, 400, ERROR_INVALID_ID);
        }

        List<Product2> records = [
            SELECT Id, Name, ProductCode, Description, Family, IsActive, Image_URL__c, Price__c, CreatedDate, LastModifiedDate
            FROM Product2
            WHERE Id = :recordId
            WITH USER_MODE
            LIMIT 1
        ];

        if (records.isEmpty()) {
            return handleError(res, 404, ERROR_NOT_FOUND);
        }

        res.statusCode = 200;
        ApiResponse response = new ApiResponse(true, 'Record retrieved successfully.', recordId);
        response.data = records[0];
        return response;
    }

    /**
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse containing every Product2 record visible to the running user
     */
    private static ApiResponse getRecordList(RestResponse res) {
        List<Product2> records = [
            SELECT Id, Name, ProductCode, Description, Family, IsActive, Image_URL__c, Price__c, CreatedDate, LastModifiedDate
            FROM Product2
            WITH USER_MODE
            ORDER BY Name ASC
            LIMIT :MAX_RECORDS_RETURNED
        ];

        res.statusCode = 200;
        ApiResponse response = new ApiResponse(true, 'Records retrieved successfully.', null);
        response.records = records;
        return response;
    }

    /**
     * Applies only the fields present in both the payload and the ALLOWED_UPDATE_FIELDS
     * allowlist to the given record; every other payload key is silently ignored.
     * @param record The Product2 record to update in place
     * @param fieldUpdates Untyped map of field name to new value, parsed from the request body
     * @return The mutated Product2 record, ready for DML
     */
    private static Product2 applyAllowedFieldUpdates(Product2 record, Map<String, Object> fieldUpdates) {
        for (String fieldName : fieldUpdates.keySet()) {
            if (!ALLOWED_UPDATE_FIELDS.contains(fieldName)) {
                continue;
            }
            record.put(fieldName, fieldUpdates.get(fieldName));
        }

        return record;
    }

    /**
     * Bulk-inserts Product2 records for the given payloads, then persists any non-blank
     * productPrice as a PricebookEntry against the Standard Price Book. Uses partial-success
     * DML throughout so one bad item in the array does not fail the whole batch.
     * @param payloads Parsed product payloads from the request body
     * @param res The active RestResponse, mutated with the resulting status code
     * @return ApiResponse whose results list carries one ProductResult per input payload
     */
    private static ApiResponse createProducts(List<ProductPayload> payloads, RestResponse res) {
        List<Product2> productsToInsert = new List<Product2>();
        List<Integer> payloadIndexByProductIndex = new List<Integer>();

        for (Integer i = 0; i < payloads.size(); i++) {
            if (String.isBlank(payloads[i].productName)) {
                continue;
            }
            productsToInsert.add(new Product2(
                Name = payloads[i].productName,
                ProductCode = payloads[i].productKey,
                IsActive = true
            ));
            payloadIndexByProductIndex.add(i);
        }

        if (productsToInsert.isEmpty()) {
            return handleError(res, 400, ERROR_MISSING_NAME);
        }

        List<Database.SaveResult> productSaveResults = Database.insert(
            productsToInsert,
            false,
            AccessLevel.USER_MODE
        );

        Map<Integer, ProductResult> resultByPayloadIndex = new Map<Integer, ProductResult>();
        List<PricebookEntry> entriesToInsert = new List<PricebookEntry>();
        Map<Integer, Integer> payloadIndexByEntryIndex = new Map<Integer, Integer>();
        Id standardPricebookId = getStandardPricebookId();

        for (Integer i = 0; i < productSaveResults.size(); i++) {
            Integer payloadIndex = payloadIndexByProductIndex[i];
            ProductPayload payload = payloads[payloadIndex];
            Database.SaveResult saveResult = productSaveResults[i];

            ProductResult result = new ProductResult();
            result.productKey = payload.productKey;

            if (saveResult.isSuccess()) {
                result.success = true;
                result.recordId = saveResult.getId();
                result.message = 'Product created successfully.';

                if (payload.productPrice != null && standardPricebookId != null) {
                    payloadIndexByEntryIndex.put(entriesToInsert.size(), payloadIndex);
                    entriesToInsert.add(new PricebookEntry(
                        Product2Id = saveResult.getId(),
                        Pricebook2Id = standardPricebookId,
                        UnitPrice = payload.productPrice,
                        IsActive = true
                    ));
                } else if (payload.productPrice != null) {
                    result.message = 'Product created successfully; no Standard Price Book was found, so productPrice was not saved.';
                }
            } else {
                result.success = false;
                result.message = saveResult.getErrors()[0].getMessage();
            }
            resultByPayloadIndex.put(payloadIndex, result);
        }

        if (!entriesToInsert.isEmpty()) {
            List<Database.SaveResult> entrySaveResults = Database.insert(
                entriesToInsert,
                false,
                AccessLevel.USER_MODE
            );
            for (Integer i = 0; i < entrySaveResults.size(); i++) {
                if (!entrySaveResults[i].isSuccess()) {
                    ProductResult result = resultByPayloadIndex.get(payloadIndexByEntryIndex.get(i));
                    result.message += ' Price could not be saved: ' + entrySaveResults[i].getErrors()[0].getMessage();
                }
            }
        }

        List<ProductResult> results = resultByPayloadIndex.values();
        Integer successCount = 0;
        for (ProductResult result : results) {
            if (result.success) {
                successCount++;
            }
        }

        res.statusCode = successCount == results.size() ? 201 : 207;
        ApiResponse response = new ApiResponse(
            successCount > 0,
            successCount + ' of ' + results.size() + ' product(s) created.',
            null
        );
        response.results = results;
        return response;
    }

    /**
     * @return The Id of the org's Standard Price Book, or null when none is visible to the running user
     */
    private static Id getStandardPricebookId() {
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
     * @param uri Full request URI from RestContext.request.requestURI
     * @return The trailing path segment (record Id), or null when absent
     */
    private static String extractIdFromUri(String uri) {
        String lastSegment = uri.substringAfterLast('/');
        if (String.isBlank(lastSegment) || lastSegment == 'products') {
            return null;
        }
        return lastSegment;
    }

    /**
     * @param idValue Candidate record Id
     * @return True when idValue matches the 15/18-character Salesforce Id format
     */
    private static Boolean isValidSalesforceId(String idValue) {
        return Pattern.matches('[a-zA-Z0-9]{15,18}', idValue);
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
     * Inbound request payload for POST operations: a wrapper around one or more products.
     */
    global class ProductListRequest {
        global List<ProductPayload> products;
    }

    /**
     * A single product entry within a POST request body.
     */
    global class ProductPayload {
        global String productName;
        global String productKey;
        global Decimal productPrice;
    }

    /**
     * Per-product outcome of a bulk POST, keyed back to the submitted productKey.
     */
    global class ProductResult {
        global Boolean success;
        global String message;
        global String productKey;
        global String recordId;
    }

    /**
     * Standardized API response envelope.
     * All endpoints return this structure for consistent client parsing.
     */
    global class ApiResponse {
        global Boolean success;
        global String message;
        global String recordId;
        global SObject data;
        global List<SObject> records;
        global List<ProductResult> results;

        global ApiResponse(Boolean success, String message, String recordId) {
            this.success = success;
            this.message = message;
            this.recordId = recordId;
        }
    }
}
