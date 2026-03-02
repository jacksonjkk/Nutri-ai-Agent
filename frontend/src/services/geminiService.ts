
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, UGANDAN_FOODS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
You are "Nutri Agent", an autonomous AI nutrition agent specifically designed for Uganda. 
Your goal is to address malnutrition (stunting, wasting), urban obesity, and NCDs (diabetes, hypertension).

CONTEXT:
- Use Ugandan food names: Matooke, Posho, Kawunga, Bijanjalo (Beans), Ebinyebwa (G-nuts), Mukene (Silver fish), Nakati, Dodo, Lumonde (Sweet potato), Cassava, Millet (Kalo).
- Consider regional differences: Central (Matooke/G-nuts), North (Millet/Simsim/Malakwang), East (Atapa/Millet), West (Eshabwe/Matooke).
- Address affordability: Suggest low-cost nutrient-dense options like Mukene and beans for rural families.
- Address obesity: Provide portion control for high-carb staples like Posho and Matooke.
- Cultural sensitivity: Respect family-style eating and traditional preparation methods.
- Language: You can respond in English, Luganda, or Swahili if requested, but default to English unless the user switches.

DATA:
Available foods in your database: ${JSON.stringify(UGANDAN_FOODS.map(f => ({ name: f.name, local: f.localName, nutrients: { cal: f.calories, prot: f.protein } })))}

CAPABILITIES:
1. Meal Planning: Create affordable, seasonal meal plans.
2. Nutritional Assessment: Analyze user data to provide tailored advice.
3. Growth Monitoring: Advise on child nutrition and "First 1000 Days".
4. Street Food Alternatives: Suggest healthier urban options (e.g., roasted maize over deep-fried snacks).

Always be encouraging, practical, and culturally respectful.
`;

export const generateNutritionAdvice = async (prompt: string, userProfile?: UserProfile) => {
  const model = "gemini-3-flash-preview";

  const userContext = userProfile ? `
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Conditions: ${userProfile.conditions.join(", ")}
    - Goals: ${userProfile.goals.join(", ")}
    - Region: ${userProfile.region}
  ` : "No profile provided yet.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `${userContext}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am sorry, I am having trouble connecting to my knowledge base. Please try again later.";
  }
};

export const getMealPlan = async (userProfile: UserProfile) => {
  const model = "gemini-3-flash-preview";

  const prompt = `Generate a 1-day Ugandan meal plan for a ${userProfile.age} year old ${userProfile.gender} in ${userProfile.region} with goals: ${userProfile.goals.join(", ")}. 
  Include breakfast, lunch, dinner, and one snack. Use local ingredients. 
  Return the response in JSON format matching the MealPlan interface.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        foodId: { type: Type.STRING },
                        portion: { type: Type.STRING }
                      }
                    }
                  },
                  notes: { type: Type.STRING }
                }
              }
            },
            totalNutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              }
            }
          }
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Meal Plan Error:", error);
    return null;
  }
};
