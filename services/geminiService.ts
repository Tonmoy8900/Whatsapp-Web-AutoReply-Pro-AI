
import { GoogleGenAI } from "@google/genai";
import { GeneratorConfig, ReplyType } from "../types.ts";

const getAIInstance = () => {
  // Safe access to process.env
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey || apiKey === "UNDEFINED" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Custom error handler to return user-friendly messages
 */
const handleGeminiError = (error: any): string => {
  console.error("Gemini API Error Detail:", error);
  
  const msg = error.message || "";
  if (msg === "API_KEY_MISSING") {
    return "API_KEY_MISSING";
  }
  
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes("api key not valid") || lowerMsg.includes("invalid api key")) {
    return "The AI service key is invalid. Please check your configuration.";
  }
  if (lowerMsg.includes("quota") || lowerMsg.includes("429")) {
    return "The AI is currently receiving too many requests. Please wait a moment and try again.";
  }
  if (lowerMsg.includes("safety") || lowerMsg.includes("blocked")) {
    return "The message was flagged by the safety filter. Try rephrasing your input.";
  }
  if (lowerMsg.includes("network") || lowerMsg.includes("fetch")) {
    return "Network connection issue. Please check your internet and try again.";
  }
  
  return "An unexpected error occurred while communicating with the AI. Please try again.";
};

/**
 * Generates the initial/default template message
 */
export const generateWhatsAppReply = async (config: GeneratorConfig): Promise<string> => {
  try {
    const ai = getAIInstance();
    const systemInstruction = `
      Act as a professional WhatsApp auto-reply assistant for a company named "${config.companyName}".
      Generate a generic greeting template that confirms receipt of a message.
      Working Hours: ${config.workingHours} (${config.workingDays}).
      Context: ${config.context}
      Tone: ${config.replyType}
      Output ONLY the message text. No brackets, no placeholders.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a professional default auto-reply template based on my company settings.",
      config: { systemInstruction, temperature: 0.7 },
    });
    
    return response.text || "Hello! We've received your message and will get back to you soon.";
  } catch (error) {
    const handledMsg = handleGeminiError(error);
    if (handledMsg === "API_KEY_MISSING") throw new Error("API_KEY_MISSING");
    throw new Error(handledMsg);
  }
};

/**
 * Generates a dynamic reply based on a specific customer message
 */
export const generateDynamicWhatsAppReply = async (incomingMessage: string, config: GeneratorConfig): Promise<string> => {
  try {
    const ai = getAIInstance();
    const systemInstruction = `
      You are a high-end AI Assistant for "${config.companyName}".
      
      CORE TASK:
      1. Analyze the customer's specific question: "${incomingMessage}"
      2. Provide a helpful, intelligent, and human-like response to that specific question.
      3. Do NOT just repeat a generic out-of-office message. Answer them!
      
      CONSTRAINTS:
      - Tone: ${config.replyType}.
      - Working Context: ${config.context}.
      - Business Hours: ${config.workingHours}, ${config.workingDays}.
      - If the user asks for pricing, hours, or specific help, address it directly using your company context.
      - Mention that the main human team will provide further details when they return during ${config.workingHours}.
      - Keep it under 60 words. No robotic markers like [Insert Here].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Customer Question: "${incomingMessage}"`,
      config: { 
        systemInstruction,
        temperature: 0.85 
      },
    });

    return response.text || "I've noted your specific question. Our team will review this and get back to you during our standard business hours.";
  } catch (error) {
    const handled = handleGeminiError(error);
    if (handled === "API_KEY_MISSING") return "Error: Gemini API Key is missing. Connect it in settings.";
    return handled;
  }
};
