import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const subjectKey = body.subject ?? "fundamentals";
    const subjectLabel = body.subjectLabel ?? "Fundamentals";
    const subjectPrompt =
      body.subjectPrompt ??
      "LPN-level fundamentals, safety, delegation, vital signs, and basic nursing care.";

    const count = Number(body.count ?? 50);

    //
    // 🔥 Build the prompt sent to OpenAI
    //
    const prompt = `
You are an expert nursing educator creating NCLEX-PN style practice questions.

Create ${count} NCLEX-PN level practice questions for:

Topic: ${subjectLabel}
Focus: ${subjectPrompt}

Requirements:
- LPN level difficulty
- 4 answer choices (A–D)
- Identify the **correct answer** after each question
- Focus on safety, delegation, prioritization, and realistic clinical scenarios
- Return ONLY a numbered plain-text list
`;

    //
    // 🔥 Call OpenAI using REST API instead of the "openai" package
    //
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: `OpenAI API error ${apiRes.status}` },
        { status: 500 }
      );
    }

    const data = await apiRes.json();

    const text =
      data?.choices?.[0]?.message?.content ??
      "No questions generated. Try again.";

    return NextResponse.json({ questions: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}