"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsTyping(true);

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: chunk },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      <div className="items-center flex justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>AI Chatbot for Job Assistant</CardTitle>
          </CardHeader>
          <CardContent className="h-[60vh] overflow-y-auto">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="text-left">
                <span className="inline-flex items-center p-2 rounded-lg bg-gray-200 text-black">
                
                  <span className="ml-2">AI is thinking...</span>
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button variant="default" type="submit" disabled={isTyping}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
