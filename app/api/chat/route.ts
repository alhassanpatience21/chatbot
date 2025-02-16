import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a highly reliable AI job search assistant.`

export async function POST(req: NextRequest) {
   

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Headstarter Gh",
      },
    });
   
    const data = await req.json();
    const messages = Array.isArray(data) ? data : [data];
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "openai/gpt-4o-2024-11-20",
      stream: true
    });
   
    let accumulatedResponse = "";
  
  
    try {
    //Handling the Streamed Response
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          accumulatedResponse += content;
        }
      }
    } catch (error) {
     //Handling errors
      console.error("Error:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
    //Sending the Final Response Back to the Client
    return new NextResponse(accumulatedResponse);
  }
  