// src/app/api/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Re-define necessary Input Types (should match frontend state types) ---
// (You could share these types from a common types file)
interface Category { id: number; name: string; }
interface Option { id: number; name: string; priceModifier: number; customizationCategoryId: number; }
interface CustomizationCategory { id: number; name: string; productId: number; options: Option[]; }
interface ProductSimplified { id: number; name: string; description: string | null; basePrice: number; isAvailable: boolean; categoryId: number; createdAt: string; updatedAt: string; category: Category; customizationCategories: CustomizationCategory[]; beanRewardModifier?: number; }
interface ProductInfoSimplified { id: number; name: string; }
interface OptionInfo { id: number; name: string; }
interface OrderItemCustomizationHistory { id: number; orderItemId: number; optionId: number; priceImpactAtOrder: number; option: OptionInfo; }
interface OrderItemHistory { id: number; orderId: number; productId: number; quantity: number; unitPrice: number; notes: string | null; product: ProductInfoSimplified; orderItemCustomizations: OrderItemCustomizationHistory[]; }
interface OrderHistoryItem { id: number; userId: number; orderTime: string; orderType: string; status: string; totalAmount: number; beanEarnAmount: number; beanRedeemAmount: number; tableId: number | null; pickupCode: string | null; estimatedCompletionTime: string | null; createdAt: string; updatedAt: string; orderItems: OrderItemHistory[]; table: { tableNumber: number } | null; }
interface CurrentWeather { temperature: number; rain: number; weatherCode: number; units: { temperature: string; rain: string; }; }

// --- Define Request Body Structure ---
interface RecommendationRequest {
    products: ProductSimplified[];
    orderHistory: OrderHistoryItem[];
    currentWeather: CurrentWeather | null;
    answers: string[];
}

// --- Define Structure Expected from AI (based on prompt instructions) ---
interface AIRecommendation {
    name: string;
    reasoning: string;
}

// --- Define Final Structure Sent Back to Frontend ---
interface FinalRecommendation {
    id: number;
    name: string;
    description?: string | null;
    basePrice: number;
    // imageUrl?: string | null; // Decide if you want to add this back for display
    reasoning: string;
}

// --- API Configuration ---
const MODEL_NAME = "gemini-1.5-flash-latest"; // Use a capable model
const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
    console.log("Received request at /api/recommendations");

    if (!API_KEY) {
        console.error("❌ Missing GEMINI_API_KEY environment variable");
        return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    let requestBody: RecommendationRequest;
    try {
        requestBody = await req.json();
        console.log("Request body parsed successfully.");
    } catch (error) {
        console.error("❌ Invalid request body:", error);
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { products, orderHistory, currentWeather, answers } = requestBody;

    // Basic input validation
    if (!products || !Array.isArray(products) || !answers || !Array.isArray(answers)) {
         console.error("❌ Missing or invalid required fields (products, answers)");
        return NextResponse.json({ message: "Missing or invalid required fields (products, answers)" }, { status: 400 });
    }
    console.log("Input validation passed.");
    console.log(`Products count: ${products.length}`);
    console.log(`Order history count: ${orderHistory?.length ?? 0}`);
    console.log(`Current weather available: ${!!currentWeather}`);
    console.log(`Quiz answers: ${answers.join(', ')}`);


    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.7, // Balance creativity and predictability
            // topK: 1, // Often not needed with JSON output
            // topP: 1, // Often not needed with JSON output
            // maxOutputTokens: 2048, // Limit response size if needed
            responseMimeType: "application/json", // CRITICAL: Ask for JSON output
        };

        // Construct the prompt dynamically using the helper function
        const prompt = buildPrompt(products, orderHistory, currentWeather, answers);

        console.log("--- Sending Prompt to Gemini ---");
        // console.log(prompt); // Log full prompt only if debugging is needed - can be large
        console.log("Prompt constructed (length approx):", prompt.length);
        console.log("--------------------------------");


        const parts = [{ text: prompt }];

        console.log("Calling Gemini API...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            // Optional safety settings (defaults are usually reasonable)
            // safetySettings: [...]
        });
        console.log("Gemini API call finished.");

        const aiResponseText = result.response.text();
        console.log("--- Received AI Response Text ---");
        console.log(aiResponseText);
        console.log("---------------------------------");

        let aiRecommendations: AIRecommendation[] = [];
        try {
             // Gemini should return valid JSON directly because we asked for it
             aiRecommendations = JSON.parse(aiResponseText);

             // Validate the parsed structure
             if (!Array.isArray(aiRecommendations) || aiRecommendations.some(rec => typeof rec.name !== 'string' || typeof rec.reasoning !== 'string')) {
                 console.error("❌ AI response is not a valid JSON array of {name, reasoning} objects.");
                 throw new Error("AI response is not in the expected JSON array format.");
             }
             console.log(`Parsed ${aiRecommendations.length} recommendations from AI.`);
        } catch (parseError) {
             console.error("❌ Failed to parse AI response as JSON:", parseError);
             // Log the raw text again for easier debugging if parsing failed
             console.error("Raw AI Response Text:", aiResponseText);
             return NextResponse.json({ message: "AI returned an unexpected or invalid format." }, { status: 500 });
        }


        // --- Enrich AI recommendations with our data (price, id, etc.) ---
        console.log("Enriching AI recommendations with local product data...");
        const finalRecommendations: FinalRecommendation[] = aiRecommendations
            .map(aiRec => {
                // Find the full product details (case-insensitive name matching is safer)
                const productDetails = products.find(p => p.name.toLowerCase() === aiRec.name.toLowerCase());

                if (!productDetails) {
                    console.warn(`⚠️ AI recommended product "${aiRec.name}" not found in available products list. Skipping.`);
                    return null; // Skip products not found
                }

                // Construct the final object to send to the frontend
                return {
                    id: productDetails.id,
                    name: productDetails.name, // Use our canonical name
                    description: productDetails.description,
                    basePrice: productDetails.basePrice,
                    // imageUrl: productDetails.imageUrl, // Add image back IF needed for display AND available in ProductSimplified
                    reasoning: aiRec.reasoning, // Add the AI's reasoning
                };
            })
            .filter((rec): rec is FinalRecommendation => rec !== null); // Filter out any nulls (products not found)

        console.log(`✅ Successfully processed ${finalRecommendations.length} recommendations.`);
        return NextResponse.json({ recommendations: finalRecommendations });

    } catch (error: any) {
        console.error("❌ Error during AI call or processing:", error);
        // Log specific Gemini API errors if available
        if (error.message) {
             console.error("Error Message:", error.message);
        }
        return NextResponse.json({ message: "Failed to get recommendations due to a server error.", error: error.message || 'Unknown AI error' }, { status: 500 });
    }
}

// --- Helper Function to Build the Prompt ---
function buildPrompt(
    products: ProductSimplified[],
    orderHistory: OrderHistoryItem[],
    currentWeather: CurrentWeather | null,
    answers: string[]
): string {
    // Prepare concise data representations for the prompt
    const weatherString = currentWeather
        ? `Temp: ${currentWeather.temperature}${currentWeather.units.temperature}, Rain: ${currentWeather.rain}${currentWeather.units.rain} (Code: ${currentWeather.weatherCode})` // Provide interpretation hints below if needed
        : "Weather data not available";

    // Limit product list size for the prompt to avoid excessive length/tokens
    const maxProductsInPrompt = 25;
    const productString = products.slice(0, maxProductsInPrompt).map(p =>
        `- Name: ${p.name}, Price: ${p.basePrice.toFixed(2)}${p.description ? `, Desc: ${p.description.substring(0, 40)}...` : ''}`
    ).join('\n');
    const productCountString = products.length > maxProductsInPrompt ? ` (Showing first ${maxProductsInPrompt} of ${products.length})` : '';

    // Summarize order history - focus on frequently ordered items or variety
    const maxHistoryOrders = 5;
    const historyItems = orderHistory.slice(0, maxHistoryOrders)
        .flatMap(o => o.orderItems.map(i => i.product.name)); // Get just product names from recent orders
    const historySummary = historyItems.length > 0
        ? `Recent items ordered: ${[...new Set(historyItems)].slice(0, 5).join(', ')}` // Show unique recent items
        : "No recent order history available or provided.";

    // Format quiz answers clearly
    const quizSummary = `Taste: ${answers[0] || 'Not specified'}, Preferred Temp: ${answers[1] || 'Not specified'}, Flavor Note: ${answers[2] || 'Not specified'}`;

    // The core prompt asking the AI to act as a barista
    return `
You are "Barista Bot", an expert AI assistant for a coffee shop. Your task is to recommend exactly 2 or 3 distinct items from the cafe's menu based ONLY on the context provided below. Be friendly and helpful.

**Context:**

1.  **Current Weather:**
    ${weatherString}
    *(Weather Codes: 0-1=Clear, 2-3=Partly Cloudy/Cloudy, 45-48=Fog, 51-67=Rain/Drizzle, 71-77=Snow, 80-82=Showers, 95-99=Thunderstorm)*

2.  **Available Products:**
${productString}${productCountString}
    *(Note: Full menu includes various coffees, teas, pastries like croissants, muffins, etc.)*

3.  **User's Recent Orders Summary:**
    ${historySummary}

4.  **User's Quiz Preferences:**
    ${quizSummary}

**Your Task:**

1.  Analyze all the context provided.
2.  Recommend **exactly 2 or 3** different items from the "Available Products" list.
3.  **Prioritize** items that strongly match the user's quiz preferences (Taste, Temp, Flavor).
4.  **Consider** the weather (e.g., suggest Iced Coffee/Tea if hot (>25C), Hot Chocolate/Latte if cold (<15C) or rainy).
5.  **Reference** order history subtly (e.g., suggest a known favorite if it fits preferences, or suggest something new if they always order the same thing and preferences allow).
6.  Ensure recommendations are suitable for a coffee shop.

**Output Format:**

Return ONLY a valid JSON array of objects. Do NOT include any text, markdown, or explanations outside the JSON structure.
Each object in the array MUST have EXACTLY these two string keys:
- "name": The exact name of the recommended product from the "Available Products" list.
- "reasoning": A brief, friendly, single-sentence explanation for *why* this specific item is recommended, referencing the weather, preferences, or history.

**Example of Correct JSON Output:**
[
  {"name": "Caramel Macchiato", "reasoning": "A perfect warm and sweet choice that matches your preference for 'Sweet' drinks on this cool day."},
  {"name": "Almond Croissant", "reasoning": "This nutty pastry complements coffee wonderfully and offers something different from your recent orders."}
]
`;
}