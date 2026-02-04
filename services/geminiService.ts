import { GoogleGenAI, Type } from "@google/genai";
import { VocabMap } from "../types";

// Helper to convert image URL to base64 for Gemini API
async function imageUrlToBase64(url: string): Promise<{ mimeType: string; base64: string }> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const matches = result.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          resolve({ mimeType: matches[1], base64: matches[2] });
        } else {
          reject(new Error("Failed to convert image to base64 format"));
        }
      };
      reader.onerror = () => reject(new Error("Error reading image data"));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    throw new Error("Failed to fetch image from URL. CORS might be blocking the request.");
  }
}

// Web Speech API for TTS
export const speakText = async (text: string): Promise<void> => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      resolve();
      return;
    }

    const doSpeak = () => {
        // Cancel any currently playing audio to avoid overlapping/queuing issues
        if (synth.speaking || synth.pending) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;

        // Try to pick a better voice if available
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                               voices.find(v => v.lang.startsWith("en-US")) || 
                               voices.find(v => v.lang.startsWith("en"));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Safety timeout in case onend doesn't fire
        const timeout = setTimeout(() => {
            resolve();
        }, 4000);

        utterance.onend = () => {
            clearTimeout(timeout);
            resolve();
        };
        
        utterance.onerror = (e) => {
            clearTimeout(timeout);
            // Ignore 'canceled' or 'interrupted' errors which happen frequently in games
            if (e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn("TTS Warning:", e.error); 
            }
            resolve();
        };

        // Small delay ensures cancel() has processed in some browsers
        setTimeout(() => {
             try {
                synth.speak(utterance);
             } catch (err) {
                console.error("TTS critical failure", err);
                resolve();
             }
        }, 10);
    };

    // Chrome requires waiting for voices to be loaded
    if (synth.getVoices().length === 0) {
        const voicesChangedHandler = () => {
            synth.removeEventListener('voiceschanged', voicesChangedHandler);
            doSpeak();
        };
        synth.addEventListener('voiceschanged', voicesChangedHandler);
        // Fallback if voiceschanged never fires
        setTimeout(() => {
             synth.removeEventListener('voiceschanged', voicesChangedHandler);
             doSpeak();
        }, 500); 
    } else {
        doSpeak();
    }
  });
};

// Gemini AI for Image Analysis (Map Positions)
export const detectNumberPositions = async (imageSrc: string, count: number): Promise<Record<string, { x: number, y: number }>> => {
  if (count <= 0) {
    return {};
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let mimeType: string;
  let base64Data: string;

  // Handle both data URIs and external URLs
  if (imageSrc.startsWith('data:')) {
    const matches = imageSrc.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format");
    }
    mimeType = matches[1];
    base64Data = matches[2];
  } else {
    // External URL (e.g. from Pinterest in LIBRARY_DATA)
    const converted = await imageUrlToBase64(imageSrc);
    mimeType = converted.mimeType;
    base64Data = converted.base64;
  }

  // Explicitly define properties for numbers 1 to count
  const numberProperties: Record<string, any> = {};
  for (let i = 1; i <= count; i++) {
    const key = i.toString();
    numberProperties[key] = {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: "Horizontal percentage (0-100)" },
        y: { type: Type.NUMBER, description: "Vertical percentage (0-100)" }
      },
      required: ["x", "y"]
    };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Switch to Pro for better coordinate precision
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `This is a vocabulary learning board. Please identify the exact center positions of the printed numbers 1 through ${count} in the image. Return the coordinates as percentages relative to the image size (x and y, both from 0 to 100). Return ONLY a JSON object where the keys are the numbers '1' to '${count}' and the values are {x, y} objects.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: numberProperties,
        required: Object.keys(numberProperties),
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", text);
    throw new Error("AI returned invalid JSON formatting");
  }
};

// Gemini AI for Vocabulary Extraction
export const parseVocabularyFromImage = async (imageSrc: string): Promise<VocabMap> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let mimeType: string;
  let base64Data: string;

  if (imageSrc.startsWith('data:')) {
    const matches = imageSrc.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format");
    }
    mimeType = matches[1];
    base64Data = matches[2];
  } else {
    const converted = await imageUrlToBase64(imageSrc);
    mimeType = converted.mimeType;
    base64Data = converted.base64;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Extract the vocabulary list from this image. The image likely contains columns for English Word, IPA (pronunciation), and Vietnamese Meaning. 
            
            Return a JSON ARRAY of objects.
            For each item, provide:
            - id: The sequential number (string "1", "2", "3"...) corresponding to the order of words in the image.
            - word: The English word.
            - ipa: The pronunciation.
            - vn: The Vietnamese meaning.
            - hint: A short, simple English hint (e.g., "Starts with [First Letter]").

            Ensure strict JSON format.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
             id: { type: Type.STRING },
             word: { type: Type.STRING },
             ipa: { type: Type.STRING },
             vn: { type: Type.STRING },
             hint: { type: Type.STRING },
          },
          required: ["id", "word", "ipa", "vn", "hint"],
        },
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response for vocab scan");
  
  try {
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
        throw new Error("AI did not return an array");
    }

    const vocabMap: VocabMap = {};
    data.forEach((item: any) => {
        if (item.id && item.word) {
            vocabMap[item.id] = {
                word: item.word,
                ipa: item.ipa || "",
                vn: item.vn || "",
                hint: item.hint || ""
            };
        }
    });

    if (Object.keys(vocabMap).length === 0) throw new Error("No data found");
    
    return vocabMap;
  } catch (e) {
    console.error("Failed to parse Vocab AI response", text, e);
    throw new Error("AI could not extract vocabulary correctly.");
  }
};