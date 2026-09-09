// app/api/subject-quiz/route.ts
import { NextResponse } from "next/server";

function getOutputText(data: any): string {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  if (!Array.isArray(data?.output)) {
    return "";
  }

  return data.output
    .flatMap((item: any) =>
      Array.isArray(item?.content) ? item.content : []
    )
    .filter(
      (part: any) =>
        part?.type === "output_text" &&
        typeof part?.text === "string"
    )
    .map((part: any) => part.text)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      subjectLabel,
      levelLabel,
      helperText,
      cheatSheet,
    } = body;

    const cheatSummary =
      cheatSheet?.summary ??
      "This subject has a generic cheat sheet with key ideas.";

    const cheatBullets = Array.isArray(cheatSheet?.bullets)
      ? cheatSheet.bullets.join("\n- ")
      : "";

    const focusText =
      helperText?.trim() ||
      "The student did not specify a particular area. Create a general but focused quiz.";

    const prompt = `
You are creating a short multiple-choice quiz for a student studying ${subjectLabel} at the ${levelLabel} level.

Cheat sheet summary:
${cheatSummary}

Key bullets:
- ${cheatBullets}

The student needs help with:
"${focusText}"

Create exactly 5 multiple-choice questions.

Return valid JSON only in this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "A brief, simple explanation."
    }
  ]
}

Requirements:
- correctIndex must be 0, 1, 2, or 3.
- Use clear language appropriate for the student's level.
- Do not include markdown or any text outside the JSON object.
`;

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: prompt,
          text: {
            format: {
              type: "json_object",
            },
          },
        }),
      }
    );

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(
        "OpenAI quiz request failed:",
        openAIResponse.status,
        errorText
      );

      return NextResponse.json(
        { error: "The quiz service could not create questions." },
        { status: 502 }
      );
    }

    const data = await openAIResponse.json();
    const raw = getOutputText(data) || "{}";

    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error, raw);
      parsed = { questions: [] };
    }

    const questions = Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("subject-quiz error:", error);

    return NextResponse.json(
      { error: "Something went wrong creating the quiz." },
      { status: 500 }
    );
  }
}