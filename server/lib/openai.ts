import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate meal plans based on user preferences
export async function generateMealPlan(preferences: {
  dietType: string;
  allergies: string[];
  dislikedFoods: string[];
  goals: string;
  calorieTarget?: number;
}): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a professional nutritionist and dietitian. Create a 7-day meal plan based on the user's preferences, " +
            "allergies, and nutritional goals. For each meal, include name, calories, protein, carbs, and fat content."
        },
        {
          role: "user",
          content: `Generate a 7-day meal plan for someone with the following preferences:
            - Diet type: ${preferences.dietType}
            - Allergies: ${preferences.allergies.join(', ')}
            - Disliked foods: ${preferences.dislikedFoods.join(', ')}
            - Goals: ${preferences.goals}
            ${preferences.calorieTarget ? `- Daily calorie target: ${preferences.calorieTarget}` : ''}
            
            Format the response as a JSON object with this structure:
            {
              "days": [
                {
                  "day": 1,
                  "meals": [
                    {
                      "type": "breakfast",
                      "name": "Example Breakfast",
                      "calories": 350,
                      "protein": 20,
                      "carbs": 30,
                      "fats": 15,
                      "recipe": "Brief instructions for preparation"
                    },
                    // lunch, dinner, snack entries follow the same format
                  ]
                },
                // repeat for days 2-7
              ]
            }`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan");
  }
}

// Function to analyze food and provide nutritional insights
export async function analyzeFood(foodDescription: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Analyze the food described and provide nutritional information and insights."
        },
        {
          role: "user",
          content: `Analyze this food and provide nutritional information: ${foodDescription}
            
            Return a JSON object with:
            {
              "name": "Food name",
              "calories": estimated calories per serving,
              "protein": estimated protein in grams,
              "carbs": estimated carbs in grams,
              "fats": estimated fats in grams,
              "analysis": "Brief nutrition analysis",
              "healthRating": number from 1-10,
              "recommendations": "Brief recommendations or alternatives"
            }`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw new Error("Failed to analyze food");
  }
}

// Function to answer nutrition questions
export async function answerNutritionQuestion(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a knowledgeable nutritionist providing evidence-based answers to nutrition and diet questions. " +
            "Keep responses concise but informative. Include scientific background when relevant."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    return response.choices[0].message.content || "I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Error answering nutrition question:", error);
    throw new Error("Failed to answer nutrition question");
  }
}