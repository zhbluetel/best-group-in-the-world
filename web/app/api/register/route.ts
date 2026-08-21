import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterRequestBody {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  plushies?: unknown;
  dreamPlushie?: unknown;
}

export async function POST(request: NextRequest) {
  let body: RegisterRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, company, plushies, dreamPlushie } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (company !== undefined && typeof company !== "string") {
    return NextResponse.json({ error: "Company must be text." }, { status: 400 });
  }

  if (plushies !== undefined && (!Array.isArray(plushies) || !plushies.every((p) => typeof p === "string"))) {
    return NextResponse.json({ error: "Plushies must be a list of strings." }, { status: 400 });
  }

  if (dreamPlushie !== undefined && typeof dreamPlushie !== "string") {
    return NextResponse.json({ error: "Dream plushie must be text." }, { status: 400 });
  }

  console.log("New plushie interest registration:", {
    name,
    email,
    company: company || null,
    plushies: plushies || [],
    dreamPlushie: dreamPlushie || null,
  });

  return NextResponse.json({ ok: true });
}
