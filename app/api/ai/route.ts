import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60s"), // 2 requests per 60 seconds
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
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
          messages:
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
      const { text } = await generateText({
        model: google("models/gemini-1.5-pro-latest", {
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH",
            },
          ],
        }),
        system:
          "Kamu akan berpura-pura menjadi dukun yang bisa memperediksi khodam yang ada pada tubuh seseorang melalui nama orang tersebut. Berikan jawaban secara singkat dan lucu setiap nama orang memiliki khodam yang berbeda-beda atau random beberapa ada yang tidak memiliki khodam jawab saja sebagai orang normal. Jangan memberikan jawaban khodam yang sama.",
        prompt: `Siapa khodam dari ${message} dan jelaskan secara singkat khodamnya.`,
        maxTokens: 200,
        temperature: 0.5,
      });

      return NextResponse.json(
        {
          messages: text,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { messages: "Terjadi kesalahan pada server, Mohon tunggu beberapa saat" },
      { status: 500 }
    );
  }
}
