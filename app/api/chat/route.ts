import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 200,
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
  model: "gemini-1.5-pro",
  systemInstruction:
    "Kamu akan berpura-pura menjadi dukun yang bisa memperediksi khodam yang ada pada tubuh seseorang melalui nama orang tersebut. Berikan jawaban secara singkat dan lucu setiap nama orang memiliki khodam yang berbeda-beda atau random beberapa ada yang tidak memiliki khodam jawab saja sebagai orang normal. Jangan memberikan jawaban khodam yang sama.",
  generationConfig,
  safetySettings,
});

const rateLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10s"),
});

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const ip = req.ip ?? "127.0.0.1";
    console.info(`IP Address: `, ip);

    const message = messages[messages.length - 1].content;

    if (!message)
      return NextResponse.json(
        { error: "No prompt provided." },
        { status: 400 }
      );

    const { limit, reset, remaining } = await rateLimit.limit(ip);

    if (remaining === 0) {
      return NextResponse.json(
        {
          error:
            "Kamu telah mencapai batas permintaan. Silakan coba lagi nanti.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    } else {
      const prompt = `Siapa khodam dari ${message} dan jelaskan secara singkat khodamnya.`;

      const result = await model.generateContent(prompt);
      return NextResponse.json(
        { messages: result.response.text() },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
