interface SalesforceAuth {
  accessToken: string;
  instanceUrl: string;
}

export interface SalesforceProduct {
  productName: string;
  productKey: string;
  productPrice: number | null;
  productImageUrl: string | null;
}

interface LeadCapturePayload {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  productKeys: string[];
  missingProductDesc?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function getSalesforceAuth(): Promise<SalesforceAuth> {
  const loginUrl = requireEnv("SF_LOGIN_URL");
  const clientId = requireEnv("SF_CLIENT_ID");
  const clientSecret = requireEnv("SF_CLIENT_SECRET");

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Salesforce auth failed with status ${response.status}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}

export async function getSalesforceProducts(auth: SalesforceAuth): Promise<SalesforceProduct[]> {
  const response = await fetch(`${auth.instanceUrl}/services/apexrest/products`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fetching Salesforce products failed with status ${response.status}`);
  }

  const data = await response.json();
  const records: Array<{
    Name: string;
    ProductCode: string;
    Image_URL__c: string | null;
    Price__c: number | null;
  }> = data.records || [];
  return records.map((record) => ({
    productName: record.Name,
    productKey: record.ProductCode,
    productPrice: record.Price__c ?? null,
    productImageUrl: record.Image_URL__c || null,
  }));
}

export async function submitLeadCapture(auth: SalesforceAuth, payload: LeadCapturePayload): Promise<void> {
  const response = await fetch(`${auth.instanceUrl}/services/apexrest/leadCapture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Salesforce lead capture failed with status ${response.status}`);
  }
}
