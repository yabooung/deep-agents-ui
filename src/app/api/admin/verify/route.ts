import { NextResponse } from "next/server";

const ADMIN_PIN_KEY = "ADMIN_PIN";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body ?? {};
    const expectedPin = process.env[ADMIN_PIN_KEY];

    if (!expectedPin) {
      return NextResponse.json(
        { error: "관리자 PIN이 설정되지 않았습니다. ADMIN_PIN 환경변수를 설정하세요." },
        { status: 500 }
      );
    }

    if (String(pin) === String(expectedPin)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "PIN이 일치하지 않습니다." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
