import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

  // set the optimal configuration for generation
  const generationConfig = {
    stopSequences: ["red"],
    maxTokens: 100,
    temperature: 0.5,
    topP: 1,
    topK: 40,
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
    model: "gemini-1.5-flash",
    systemInstruction:
      "Kamu akan berpura-pura menjadi dukun yang bisa memperediksi khodam yang ada pada tubuh seseorang melalui nama orang tersebut. Berikan jawaban secara singkat dan lucu setiap nama orang memiliki khodam yang berbeda-beda atau random beberapa ada yang tidak memiliki khodam jawab saja sebagai orang normal. Jangan memberikan jawaban khodam yang sama.",
    generationConfig,
    safetySettings,
  });

  try {
    const { messages } = await req.json();

    const message = messages[messages.length - 1].content;

    if (!message)
      return NextResponse.json(
        { error: "No prompt provided." },
        { status: 400 }
      );

    const prompt = `Siapa khodam dari ${message} dan jelaskan secara singkat khodamnya.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json(
      { messages: result.response.text() },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
  }
}
