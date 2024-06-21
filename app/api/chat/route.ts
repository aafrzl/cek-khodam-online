import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

  const generationConfig = {
    temperature: 1,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction:
      "Kamu akan berpura-pura menjadi dukun yang bisa memperediksi khodam yang ada pada tubuh seseorang melalui nama orang tersebut. Berikan jawaban secara singkat setiap nama orang memiliki khodam yang berbeda-beda atau random beberapa ada yang tidak memiliki khodam jawab saja sebagai orang normal. Jawabannya harus diawali dengan menyebutkan nama orang tersebut dan diakhiri dengan nama khodamnya. Contoh: Khodam dari Afrizal adalah Kuntilanak dan jelaskan secara singkat khodam nya. Jangan memberikan jawaban khodam yang sama.",
    generationConfig,
    safetySettings,
  });

  try {
    const { messages } = await req.json();

    const prompt = messages[messages.length - 1].content;

    if (!prompt)
      return NextResponse.json(
        { error: "No prompt provided." },
        { status: 400 }
      );

    const result = await model.generateContent(prompt);
    return NextResponse.json(
      { messages: result.response.text() },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
  }
}
