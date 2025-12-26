import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, LogoType, PromptResponse } from '../types';

// Initialize the API client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: "Art Director" - Converts user inputs into a structured Prompt
 * Uses gemini-3-pro-preview with fallback to gemini-3-flash-preview
 */
export const generateLogoPrompt = async (params: GenerationParams): Promise<PromptResponse> => {
  const ai = getClient();
  
  const systemPrompt = `
    You are an expert AI Art Director specialized in creating prompt engineering for the \`gemini-3-pro-image-preview\` and \`imagen-3.0-generate-001\` models. 
    Your task is to convert user parameters into a SINGLE, precise, high-quality English image generation prompt.
    
    # Design Logic Rules
    1. Global Visual Constraints: Flat, Vector, Minimalist, 2D, Clean lines. NO 3D rendering, photorealism, shadows, embossing.
    2. Background: 
       - If "Black": "isolated on a pure matte black background."
       - If "Tech Gradient" or default: "on a flat, abstract background consisting ONLY of deep violet and midnight blue color gradients. The style is a 2D gradient mesh with a subtle film grain overlay."
       - If "White": "isolated on a pure white background."
    3. Color & Gradient Logic:
       - If gradient_target is set: Apply neon purple-to-blue gradient to that text/element.
       - Else: Solid, flat color scheme.
    4. Logo Types:
       - Type A (Wordmark): Minimalist vector wordmark. Custom sans-serif.
       - Type B (Abstract): Vertical layout. Large geometric icon above, small brand name below.
       - Type C (Combo): Horizontal. Left icon, Right text.
       - Type D (Letter Mod): Transform letter '{abstract_target}' into geometric shape.
    
    Return JSON only.
  `;

  const userContent = `
    Parameters:
    - Brand Name: ${params.brandName}
    - Industry/Keywords: ${params.keywords}
    - Logo Type: ${params.logoType}
    - Background Style: ${params.backgroundStyle || 'Tech Gradient'}
    - Gradient Target: ${params.gradientTarget || 'None'}
    - Abstract Target: ${params.abstractTarget || 'None'}
    - Extra Constraints: ${params.extraDesc || 'None'}
  `;

  const config = {
    systemInstruction: systemPrompt,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        english_prompt: { type: Type.STRING },
        chinese_explanation: { type: Type.STRING }
      },
      required: ['english_prompt', 'chinese_explanation']
    }
  };

  // Helper to run Step 1
  const runStep1 = async (model: string) => {
    const response = await ai.models.generateContent({
      model,
      contents: userContent,
      config: config
    });
    const text = response.text;
    if (!text) throw new Error("No response from Art Director model");
    return JSON.parse(text) as PromptResponse;
  };

  try {
    // 1. Try Primary Model
    return await runStep1('gemini-3-pro-preview');
  } catch (error: any) {
    // 2. Fallback if Quota Exceeded or Not Found
    if (isRetryableError(error)) {
      console.warn("Step 1: Pro model failed. Falling back to Flash.");
      return await runStep1('gemini-3-flash-preview');
    }
    throw error;
  }
};

/**
 * Step 2: "Renderer" - Generates the actual image
 * Fallback Chain: Gemini 3 Pro -> Gemini 2.5 Flash -> Imagen 4
 */
export const generateLogoImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const errors: any[] = [];

  // Helper function to extract base64 from generateContent response (Gemini models)
  const extractGeminiImage = (response: any): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in Gemini response");
  };

  // --- Attempt 1: Gemini 3 Pro Image (Best Quality) ---
  try {
    console.log("Attempt 1: gemini-3-pro-image-preview");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '1:1', imageSize: '1K' }
      }
    });
    return extractGeminiImage(response);
  } catch (error: any) {
    console.warn("Attempt 1 failed:", error.message);
    errors.push(error);
    if (!isRetryableError(error)) throw error; // If it's a fatal error (not 404/429), stop.
  }

  // --- Attempt 2: Gemini 2.5 Flash Image (Fast/Efficient) ---
  try {
    console.log("Attempt 2: gemini-2.5-flash-image");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '1:1' } // imageSize not supported here
      }
    });
    return extractGeminiImage(response);
  } catch (error: any) {
    console.warn("Attempt 2 failed:", error.message);
    errors.push(error);
    if (!isRetryableError(error)) throw error;
  }

  // --- Attempt 3: Imagen 4.0 (Different Model Family) ---
  try {
    console.log("Attempt 3: imagen-4.0-generate-001");
    // Using generateImages for Imagen models
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });
    
    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64) return `data:image/jpeg;base64,${base64}`;
    throw new Error("No image data in Imagen response");
  } catch (error: any) {
    console.warn("Attempt 3 failed:", error.message);
    errors.push(error);
  }

  // --- Final Decision ---
  // If we are here, ALL attempts failed.
  // Check if any failure was due to Quota (429), Not Found (404), or Billing (400).
  const isAllExhausted = errors.every(e => isRetryableError(e));

  if (isAllExhausted) {
    throw new Error("ALL_IMAGE_MODELS_EXHAUSTED");
  }

  // If failed for some other reason, throw the last error
  throw errors[errors.length - 1];
};

// Helper to identify errors that justify trying a fallback model
// 429 = Quota Exceeded
// 404 = Model Not Found (e.g., if user doesn't have access to Pro/Imagen)
// 400 + "billed users" = Billing requirement (treat as exhaustion)
const isRetryableError = (error: any): boolean => {
  const msg = (error.message || "").toLowerCase();
  return (
    msg.includes('429') || 
    error.status === 429 || 
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('404') ||
    error.status === 404 ||
    msg.includes('not_found') ||
    // Billing related (often 400 Invalid Argument)
    msg.includes('billed users') ||
    msg.includes('billing')
  );
};