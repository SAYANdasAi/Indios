"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
    text: string;
    isBot: boolean;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hi! How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initialize Gemini with the API key from environment variables
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { text: input, isBot: false }]);
        setInput("");
        setIsLoading(true);

        // Generate bot response using Gemini
        const response = await generateResponse(input);
        setMessages(prev => [...prev, { text: response, isBot: true }]);
        setIsLoading(false);
    };

    const generateResponse = async (query: string): Promise<string> => {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
            // Add context for the clothing brand
            const prompt = `
                You are a customer support assistant for a clothing brand named Indios. 
                Your role is to assist customers with inquiries about clothing, orders, sizing, styling, and general brand information. 
                Keep your responses concise, friendly, and professional. 
                If the question is unrelated to the brand, politely guide the user back to relevant topics.
    
                Customer Query: "${query}"
            `;
    
            const result = await model.generateContent(prompt);
            const response = await result.response;
            // Remove asterisks and make the response precise
            return response.text().replace(/\*/g, '').trim();
        } catch (error) {
            console.error("Error generating response:", error);
            return "Sorry, I couldn't process your request. Please try again.";
        }
    };

    return (
        <>
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-16 right-4 rounded-full w-12 h-12 md:w-14 md:h-14 bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg z-[1000]"
                >
                    <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
                </Button>
            ) : (
                <div className={`fixed ${isMinimized ? 'bottom-16 right-4 w-auto' : 'bottom-0 right-0 md:bottom-16 md:right-4 w-full md:w-96 max-w-full'} bg-white rounded-lg shadow-xl transition-all duration-300 z-[1000] ${
                    isMinimized ? 'h-14' : 'h-[80vh] md:h-[600px]'
                }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 md:p-4 border-b">
                        <h3 className="font-semibold text-base md:text-lg">Chat Support</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1">
                                <Minus className="w-5 h-5 md:w-6 md:h-6 text-gray-500 hover:text-gray-700" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1">
                                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="p-3 md:p-4 h-[calc(80vh-8rem)] md:h-[460px] overflow-y-auto">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 md:mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
                                    >
                                        <div
                                            className={`inline-block p-2.5 md:p-3 rounded-lg text-sm md:text-base ${
                                                message.isBot
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-500 text-white'
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="text-left">
                                        <div className="inline-block p-2.5 md:p-3 rounded-lg bg-gray-100 text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-3 md:p-4 border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your question..."
                                        className="flex-1 p-2.5 md:p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-5 rounded-md"
                                    >
                                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}