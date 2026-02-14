
import { GoogleGenAI } from '@google/genai';
// import { GEMINI_API_KEY } from '../constants'; // Removed, as API key must come from process.env

// The API key MUST be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAstroGlowNarrative = async (caption: string, partnerName: string): Promise<string> => {
  try {
    const prompt = `You are Astra-Glow, an ancient Star-Spirit. Your task is to narrate memories for a beloved partner, ${partnerName}, guiding them through a galactic odyssey. Each memory is a crystal holding a cherished moment. Speak poetically, with cosmic wonder and deep affection, interpreting the essence of the memory.
    
    Here is the memory caption: "${caption}"
    
    Please provide a short, evocative narration (2-3 sentences) that transforms this memory into a cosmic journey, focusing on love and destiny. For example, if the memory is "Our first date at the cafe", you might say: "Ah, yes, the nascent light of your bond first flickered in the cosmic dust of that earthly cafe, a humble beginning to an interstellar connection."`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Suitable for contextual text generation
      contents: [{ text: prompt }], // Use `contents` with an array of parts
      config: {
        systemInstruction: `You are Astra-Glow, a wise and loving Star-Spirit guiding ${partnerName} through cherished memories. Speak poetically, focusing on love, destiny, and the cosmic significance of each moment.`,
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 150, // Keep narration concise
      },
    });

    const text = response.text;
    if (text) {
      return text.trim();
    } else {
      return "The echoes of the cosmos are faint, but the love shines bright.";
    }
  } catch (error: any) {
    console.error('Error generating Astra-Glow narrative:', error);
    // If the API key is truly invalid, the error message might indicate that.
    // The environment is assumed to inject process.env.API_KEY, so explicit checks for a placeholder are no longer needed.
    if (error.message.includes("API key not valid") || !process.env.API_KEY) {
        console.error("Gemini API key is invalid or missing from environment variables. Please ensure process.env.API_KEY is set.");
    }
    return `The stars whisper... but this memory is too precious for words alone. ("${caption}")`;
  }
};