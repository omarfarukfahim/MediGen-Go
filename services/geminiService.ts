import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyBPpgue5Pnd7ffI9hbmZzlta-K0Vqw5ZmI";

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are MediGen, a friendly and helpful AI Health Assistant. Your goal is to provide general health information and guidance.

**IMPORTANT RULES:**
1.  **Disclaimer First:** ALWAYS start your very first response with this exact disclaimer: "Hello! I'm your AI Health Assistant. How can I help you today? Please remember, I am an AI assistant and not a medical professional. The information I provide is for general guidance and educational purposes only. It should not be considered a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health." For subsequent responses, you can be more direct but maintain a supportive and cautious tone.
2.  **Do Not Diagnose:** NEVER provide a diagnosis, prescribe medication, or give definitive medical advice. Avoid language that sounds like a diagnosis (e.g., "you might have..." or "it sounds like..."). Instead, explain possibilities in a general way.
3.  **Encourage Professional Consultation:** Consistently and strongly advise users to consult with a real doctor or healthcare professional for any personal health issues, diagnosis, or treatment.
4.  **Safety First:** If a user describes symptoms that could be serious (e.g., chest pain, difficulty breathing, severe headache, thoughts of self-harm), immediately and clearly advise them to seek emergency medical help by calling their local emergency number or going to the nearest hospital.
5.  **Be Informative, Not Prescriptive:** You can explain what certain conditions generally are, describe common symptoms, discuss lifestyle tips (like diet and exercise), and explain how certain treatments generally work. Frame your answers as "General information about X includes..." or "Common lifestyle tips for Y are...".
6.  **Keep it Simple:** Use clear, easy-to-understand language. Avoid overly technical medical jargon.
7.  **Use Formatting:** Use Markdown for formatting responses to improve readability. This includes using lists for steps or items, bolding for emphasis, and code blocks for code snippets.
`;

export const getAiHealthResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
      },
    });
    
    return response.text || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

export const analyzeHealthImage = async (base64Image: string, type: 'food' | 'barcode'): Promise<string> => {
    try {
        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Data = base64Image.split(',')[1];
        
        let prompt = "";
        if (type === 'food') {
            prompt = "Analyze this food image. 1) Identify the food item. 2) Estimate the calories per serving. 3) List macronutrients (Protein, Carbs, Fat). 4) Provide a health verdict (Healthy/Moderate/Unhealthy) and explain why briefly. Format nicely with bold headings.";
        } else {
            prompt = "Analyze this image containing a barcode or food label. 1) If it's a barcode, identify the product name and brand if possible. 2) If it's a label, extract the Ingredients list and Calories. 3) Summarize if this is generally considered a healthy processed food option.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: prompt }
                ]
            }
        });

        return response.text || "I could not analyze this image.";
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Failed to process the image. Please try again.";
    }
};

export const generateMealPlan = async (planName: string, dietYes: string[], dietNo: string[]): Promise<string> => {
    try {
        const prompt = `
        Act as a professional nutritionist specializing in the "${planName}" diet.
        Generate a one-day delicious and healthy meal plan (Breakfast, Lunch, Dinner).
        
        **Constraints:**
        *   **Highly Recommended Ingredients:** ${dietYes.join(', ')}
        *   **Strictly Avoid:** ${dietNo.join(', ')}
        
        **Output Format:**
        Please provide the response in clean Markdown format with the following structure for each meal:
        
        ### [Meal Name] (e.g., Breakfast: Oatmeal Delight)
        *   **Description:** A brief appetizing description.
        *   **Key Ingredients:** List 3-4 main ingredients.
        *   **Nutritional Estimate:** Calories, Protein (g), Carbs (g), Fat (g).
        
        End with a small "Daily Health Tip" specific to ${planName}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7, // Slightly higher for creativity in recipes
            }
        });

        return response.text || "Unable to generate meal plan at this time.";
    } catch (error) {
        console.error("Error generating meal plan:", error);
        return "I'm having trouble communicating with the nutritionist AI right now. Please try again later.";
    }
};

export const analyzePrescription = async (base64Image: string): Promise<string[]> => {
    try {
        const base64Data = base64Image.split(',')[1];
        const prompt = "Analyze this medical prescription image. Carefully extract the list of medicine names prescribed. Return ONLY a valid JSON array of strings (e.g., [\"Medicine A\", \"Medicine B\"]). Do not include dosage, frequency, or any other text. If no medicines are found, return an empty array [].";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Prescription analysis failed", error);
        return [];
    }
};

export const checkSymptoms = async (data: { age: string, gender: string, symptoms: string, duration: string }): Promise<string> => {
    try {
        const prompt = `
        Act as a professional AI medical symptom checker.
        
        Patient Profile:
        - Age: ${data.age}
        - Gender: ${data.gender}
        - Symptoms: ${data.symptoms}
        - Duration: ${data.duration}
        
        Instructions:
        1. Provide a list of 3-5 potential conditions based on the symptoms provided (differential diagnosis).
        2. For each condition, briefly explain why it is a possibility.
        3. Suggest appropriate next steps (e.g., Self-care, Appointment with General Practitioner, Urgent Care, Emergency Room).
        4. Flag any "Red Flag" symptoms if present that require immediate attention.
        
        **MANDATORY DISCLAIMER**: Start the response with: "**AI HEALTH ANALYSIS - NOT A DIAGNOSIS**". End with: "*Please consult a medical professional for an official diagnosis and treatment plan.*"
        
        Format the response in clean Markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.4, // Lower temperature for more analytical/safe responses
            }
        });

        return response.text || "Unable to process symptoms at this time.";
    } catch (error) {
        console.error("Symptom check failed", error);
        return "Error running symptom checker. Please try again.";
    }
};

export const generateHealthInsights = async (profile: any, metrics: any[]): Promise<string> => {
    try {
        const prompt = `
        Act as a personalized AI Health Coach. Analyze the following patient data and provide 3-4 personalized, actionable health tips.

        **Patient Profile:**
        - Age: ${profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 'Unknown'}
        - Gender: ${profile.gender || 'Unknown'}
        - Height: ${profile.height ? profile.height + 'cm' : 'Unknown'}
        - Medical Conditions/Allergies: ${profile.allergies?.join(', ') || 'None'}

        **Latest Vitals Logged:**
        ${metrics.map(m => `- ${m.type}: ${m.value} ${m.unit} (Date: ${m.date})`).join('\n')}

        **Instructions:**
        1. Compare the latest metrics to standard healthy ranges.
        2. If BMI can be calculated from Height/Weight, include a brief note on it.
        3. Provide encouragement if metrics look good, or gentle, actionable advice if they are outside normal ranges.
        4. Suggest one lifestyle change (diet or exercise) based on the data.
        
        **Format:**
        Use Markdown with bold headings for each tip. Keep it concise and motivating.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });

        return response.text || "Could not generate insights.";
    } catch (error) {
        console.error("Insight generation failed", error);
        return "Unable to analyze data right now.";
    }
};
