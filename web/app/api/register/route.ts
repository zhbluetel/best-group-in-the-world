import { NextRequest, NextResponse } from "next/server";
import { getSalesforceAuth, submitLeadCapture } from "@/lib/salesforce";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterRequestBody {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  company?: unknown;
  productKeys?: unknown;
  dreamPlushie?: unknown;
}

export async function POST(request: NextRequest) {
  let body: RegisterRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { firstName, lastName, email, company, productKeys, dreamPlushie } = body;

  if (typeof firstName !== "string" || !firstName.trim()) {
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  }

  if (typeof lastName !== "string" || !lastName.trim()) {
    return NextResponse.json({ error: "Last name is required." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (company !== undefined && typeof company !== "string") {
    return NextResponse.json({ error: "Company must be text." }, { status: 400 });
  }

  if (
    productKeys !== undefined &&
    (!Array.isArray(productKeys) || !productKeys.every((key) => typeof key === "string"))
  ) {
    return NextResponse.json({ error: "Product keys must be a list of strings." }, { status: 400 });
  }

  if (dreamPlushie !== undefined && typeof dreamPlushie !== "string") {
    return NextResponse.json({ error: "Dream plushie must be text." }, { status: 400 });
  }

  if (dreamPlushie) {
    console.log("Dream plushie suggestion:", dreamPlushie);
  }

  try {
    const auth = await getSalesforceAuth();

    await submitLeadCapture(auth, {
      firstName,
      lastName,
      email,
      company: (company as string) || undefined,
      productKeys: (productKeys as string[] | undefined) || [],
    });
  } catch (err) {
    console.error("Salesforce lead capture failed:", err);
    return NextResponse.json({ error: "Failed to register interest. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
