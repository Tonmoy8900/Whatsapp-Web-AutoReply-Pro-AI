
import { GoogleGenAI } from "@google/genai";
import { GeneratorConfig, ReplyType } from "../types.ts";

/**
 * Custom error handler to return user-friendly messages
 */
const handleGeminiError = (error: any): string => {
  console.error("Gemini API Error Detail:", error);
  const msg = error.message || "";
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes("api key not valid") || lowerMsg.includes("invalid api key")) {
    return "The AI service key is invalid. Please check your configuration.";
  }
  if (lowerMsg.includes("quota") || lowerMsg.includes("429")) {
    return "The AI is currently receiving too many requests. Please wait a moment and try again.";
  }
  
  return "An unexpected error occurred. Please try again.";
};

/**
 * Generates a professional auto-reply based on user's specific prompt requirements
 */
export const generateWhatsAppReply = async (config: GeneratorConfig): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `
      Act as a professional WhatsApp auto-reply assistant for "${config.companyName}".
      Generate a polite, clear, and professional auto-reply message for WhatsApp.
      
      STRUCTURE (MANDATORY):
      1. A professional greeting.
      2. Confirmation that the message has been received successfully.
      3. Explicitly state working hours: ${config.workingHours} (${config.workingDays}).
      4. Clear assurance of a reply within those working hours.
      
      TONE: Professional, friendly, and respectful. Short and easy to understand. Not robotic.
      CONTEXT: Sent automatically when outside working hours or team is busy.
      OUTPUT: Only the WhatsApp message text. No placeholders like [Name].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate my professional WhatsApp auto-reply message.",
      config: { systemInstruction, temperature: 0.7 },
    });
    
    return response.text || "Hello,\nThank you for your message. We have received it successfully.\n\nOur working hours are 10:00 AM to 6:00 PM (Monday to Friday).\nWe will get back to you as soon as possible during working hours.\n\nThank you for your patience.";
  } catch (error) {
    throw new Error(handleGeminiError(error));
  }
};

/**
 * Generates a dynamic reply based on a specific customer message
 */
export const generateDynamicWhatsAppReply = async (incomingMessage: string, config: GeneratorConfig): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `
      You are a professional assistant for "${config.companyName}".
      
      Respond to this specific message: "${incomingMessage}"
      
      Follow this structure:
      1. Professional greeting + confirmation of receipt.
      2. Brief answer/acknowledgement of their specific question.
      3. Mention we are currently away/busy.
      4. State working hours: ${config.workingHours} (${config.workingDays}).
      5. Assurance of human follow-up.
      
      TONE: Professional and respectful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Customer Message: "${incomingMessage}"`,
      config: { 
        systemInstruction,
        temperature: 0.8 
      },
    });

    return response.text || "Hello, thank you for reaching out. We have received your message and will respond shortly.";
  } catch (error) {
    return handleGeminiError(error);
  }
};
