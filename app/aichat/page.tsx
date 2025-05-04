"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image"; // Keep if displaying images in recommendations
import { useCafe } from "@/context/cafe-context"; // Ensure this provides 'user'
import { MainLayout } from "@/components/main-layout";
import axiosInstance from "@/lib/axios"; // Your axios instance for backend calls

// --- Define necessary interfaces ---

// Interfaces for your backend data (Simplified, NO Images for state/AI payload)
interface Category { id: number; name: string; }
interface Option { id: number; name: string; priceModifier: number; customizationCategoryId: number; }
interface CustomizationCategory { id: number; name: string; productId: number; options: Option[]; }
interface ProductSimplified { id: number; name: string; description: string | null; basePrice: number; isAvailable: boolean; categoryId: number; createdAt: string; updatedAt: string; category: Category; customizationCategories: CustomizationCategory[]; beanRewardModifier?: number; }
interface ProductInfoSimplified { id: number; name: string; }
interface OptionInfo { id: number; name: string; }
interface OrderItemCustomizationHistory { id: number; orderItemId: number; optionId: number; priceImpactAtOrder: number; option: OptionInfo; }
interface OrderItemHistory { id: number; orderId: number; productId: number; quantity: number; unitPrice: number; notes: string | null; product: ProductInfoSimplified; orderItemCustomizations: OrderItemCustomizationHistory[]; }
interface OrderHistoryItem { id: number; userId: number; orderTime: string; orderType: string; status: string; totalAmount: number; beanEarnAmount: number; beanRedeemAmount: number; tableId: number | null; pickupCode: string | null; estimatedCompletionTime: string | null; createdAt: string; updatedAt: string; orderItems: OrderItemHistory[]; table: { tableNumber: number } | null; }

// Interfaces for Raw API Responses (including potentially unused fields like imageUrl)
interface RawProduct { id: number; name: string; description: string | null; basePrice: number; imageUrl: string | null; isAvailable: boolean; categoryId: number; createdAt: string; updatedAt: string; category: Category; customizationCategories: CustomizationCategory[]; beanRewardModifier?: number; }
interface FullOrderProductInfo { id: number; name: string; imageUrl: string | null; }
interface FullOrderItem { id: number; orderId: number; productId: number; quantity: number; unitPrice: number; notes: string | null; product: FullOrderProductInfo; orderItemCustomizations: OrderItemCustomizationHistory[]; }
interface FullOrder { id: number; userId: number; orderTime: string; orderType: string; status: string; totalAmount: number; beanEarnAmount: number; beanRedeemAmount: number; tableId: number | null; pickupCode: string | null; estimatedCompletionTime: string | null; createdAt: string; updatedAt: string; orderItems: FullOrderItem[]; table: { tableNumber: number } | null; }

// Interfaces for Open-Meteo Weather API Response
interface OpenMeteoCurrentUnits { time: string; interval: string; temperature_2m: string; rain: string; weather_code: string; }
interface OpenMeteoCurrentData { time: string; interval: number; temperature_2m: number; rain: number; weather_code: number; }
interface OpenMeteoResponse { latitude: number; longitude: number; generationtime_ms: number; utc_offset_seconds: number; timezone: string; timezone_abbreviation: string; elevation: number; current_units: OpenMeteoCurrentUnits; current: OpenMeteoCurrentData; /* hourly/daily omitted */ }

// Interface for the weather data stored in state
interface CurrentWeather { temperature: number; rain: number; weatherCode: number; units: { temperature: string; rain: string; }; }

// --- Interface for the FINAL Recommendation object (received from /api/recommendations) ---
interface Recommendation {
  id: number; // Product ID from your database
  name: string;
  description?: string | null; // From your product data
  basePrice: number; // From your product data
  imageUrl?: string | null; // Optional: From your product data (if backend adds it back)
  reasoning: string; // Crucial: From the AI via your backend
}

// --- Component Code ---

// Quiz questions (can be moved to a separate file/config)
const questions = [
    { question: "How do you like your drink?", options: ["Strong", "Mild", "Sweet", "Fruity"] },
    { question: "What's your preferred temperature?", options: ["Hot", "Iced", "Room Temperature"] },
    { question: "Pick a flavor note you enjoy:", options: ["Chocolate", "Vanilla", "Citrus", "Nutty"] },
];

export default function Aichat() {
  const router = useRouter();
  const { user } = useCafe(); // Assuming useCafe provides user object { id, name, email, etc. } or null

  // State for fetched data (using simplified types without images for processing)
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductSimplified[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);

  // Loading and error states for initial data fetch
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // State for the quiz flow
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

  // State for recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]); // Uses the final Recommendation type
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // --- Effect for fetching initial data ---
  useEffect(() => {
    const fetchData = async () => {
       // Basic check: Don't proceed if user context is loading or user is definitively logged out
       // Adjust this condition based on your context's initial state vs. loaded logged-out state
       if (user === undefined) {
           console.log("User context still loading, waiting...");
           // Keep loading state true until user is defined (either null or object)
           // Or handle loading state from useCafe if available
           return;
       }
       if (user === null) {
           console.log("User not logged in. Skipping order history fetch.");
           // Decide whether to fetch products/weather when logged out
           // For this example, we assume recommendations require login
           setIsDataLoading(false); // Stop loading as we aren't fetching required data
           return;
       }

      setIsDataLoading(true);
      setDataError(null);
      console.log("Fetching initial data (orders, products, weather)...");

      const weatherApiUrl = "https://api.open-meteo.com/v1/forecast?latitude=41.3275&longitude=19.8189&current=temperature_2m,rain,weather_code&forecast_days=1"; // Tirana, Albania

      try {
        const [ordersResponse, productsResponse, weatherResponse] = await Promise.all([
          axiosInstance.get<FullOrder[]>('/api/orders/user'), // Needs auth from axiosInstance
          axiosInstance.get<RawProduct[]>('/api/products'),   // Might or might not need auth
          fetch(weatherApiUrl)                                // Public API
        ]);

        // 1. Process Orders -> OrderHistoryItem[] (Remove product.imageUrl)
        const rawOrders = ordersResponse.data;
        const transformedHistory: OrderHistoryItem[] = rawOrders.map(order => ({
          ...order,
          orderItems: order.orderItems.map(item => ({
            ...item,
            product: { id: item.product.id, name: item.product.name }
          }))
        }));
        setOrderHistory(transformedHistory);
        console.log("✅ Processed Order History (no images):", transformedHistory.length, "orders");

        // 2. Process Products -> ProductSimplified[] (Remove imageUrl)
        const rawProducts = productsResponse.data;
        const simplifiedProducts: ProductSimplified[] = rawProducts.map(product => {
            const { imageUrl, ...rest } = product; // Exclude imageUrl
            return rest;
        });
        setAllProducts(simplifiedProducts);
        console.log("✅ Processed Products (no images):", simplifiedProducts.length, "products");

        // 3. Process Weather
        if (!weatherResponse.ok) throw new Error(`Weather API error! status: ${weatherResponse.status}`);
        const weatherData: OpenMeteoResponse = await weatherResponse.json();
        if (weatherData?.current && weatherData?.current_units) {
             const currentWeatherData: CurrentWeather = {
                temperature: weatherData.current.temperature_2m,
                rain: weatherData.current.rain,
                weatherCode: weatherData.current.weather_code,
                units: { temperature: weatherData.current_units.temperature_2m, rain: weatherData.current_units.rain }
             };
             setCurrentWeather(currentWeatherData);
             console.log("✅ Fetched Current Weather:", currentWeatherData);
        } else {
            console.warn("⚠️ Weather data received but incomplete.");
            setCurrentWeather(null); // Ensure weather state is null if data is bad
        }

      } catch (err: any) {
        console.error("❌ Failed to fetch initial data:", err);
        const message = err.response?.data?.message || err.message || "Could not load required data.";
        setDataError(message);
        // Clear potentially partial data
        setOrderHistory([]);
        setAllProducts([]);
        setCurrentWeather(null);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
    // Dependency: re-run if the user logs in or out
  }, [user]);

  // --- Quiz Logic ---
  const selectOption = (option: string) => {
    const updated = [...answers];
    updated[currentQ] = option;
    setAnswers(updated);
  };

  const resetQuiz = () => {
      setRecommendations([]);
      setAnswers(Array(questions.length).fill(""));
      setCurrentQ(0);
      setRecommendationError(null);
      setLoadingRecommendations(false);
  }

  // --- Submit Quiz and Get Recommendations ---
  const submitQuiz = async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);
    console.log("Submitting quiz...");

    // Prepare payload for backend API
    const payload = {
        products: allProducts,
        orderHistory: orderHistory,
        currentWeather: currentWeather,
        answers: answers,
    };

    try {
      console.log("Sending payload to /api/recommendations:", payload);
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `Request failed with status: ${res.status}` }));
          console.error("❌ API Error Response:", errorData);
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data: { recommendations: Recommendation[] } = await res.json();

      // Validate received data structure
      if (!data || !Array.isArray(data.recommendations)) {
          console.error("❌ Invalid recommendations format received:", data);
          throw new Error("Received invalid recommendation data from server.");
      }

      setRecommendations(data.recommendations);
      console.log("✅ Received Recommendations:", data.recommendations);

    } catch (err: any) {
      console.error("❌ Failed to get recommendations:", err);
      setRecommendationError(err.message || "Something went wrong fetching recommendations.");
      setRecommendations([]); // Clear potentially stale recommendations on error
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // --- Render Logic ---

  // 1. Initial Data Loading State
  if (isDataLoading) {
      return (
          <MainLayout>
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 mr-2 animate-spin text-amber-700" />
                  <span className="text-amber-700">Loading context...</span>
              </div>
          </MainLayout>
      );
  }

  // 2. Initial Data Loading Error State
  if (dataError) {
      return (
          <MainLayout>
             <div className="flex items-center mb-4">
                 <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button>
                 <h1 className="text-xl font-bold text-amber-900">Get a Recommendation</h1>
             </div>
              <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  <p className="font-semibold">Oops! Could not load data.</p>
                  <p>{dataError}</p>
                  <p className="mt-2">Please try refreshing the page or check your connection.</p>
              </div>
          </MainLayout>
      );
  }

  // 3. User Not Logged In State (if required data wasn't fetched)
   if (!user && !isDataLoading && !dataError) {
     // This state is reached if the useEffect determined the user is null and stopped fetching
     return (
       <MainLayout>
         <div className="flex items-center mb-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button>
             <h1 className="text-xl font-bold text-amber-900">Get a Recommendation</h1>
         </div>
         <div className="p-6 text-center bg-amber-50 rounded-lg border border-amber-200">
           <p className="text-amber-800">Please log in to get personalized recommendations based on your order history!  Të lutem hyr në llogari.</p>
           {/* Optional: Add Login Button */}
           {/* <Button onClick={() => router.push('/login')} className="mt-4">Login</Button> */}
         </div>
       </MainLayout>
     );
   }

  // 4. Main Content (Quiz or Recommendations)
  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center mb-4">
         <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
             <ArrowLeft className="h-5 w-5" />
         </Button>
         <h1 className="text-xl font-bold text-amber-900">AI Recommendation</h1>
         {/* Optional: Display simple weather info */}
         {currentWeather && (
            <span className='ml-auto text-sm text-amber-700 font-medium hidden sm:inline'>
                {currentWeather.temperature}{currentWeather.units.temperature}
                {currentWeather.rain > 0 ? ` (${currentWeather.rain}${currentWeather.units.rain} rain)` : ''}
            </span>
         )}
       </div>

      {/* Display Recommendations if available */}
      {recommendations.length > 0 ? (
         <div className="space-y-4">
            <h2 className="text-lg font-semibold text-amber-900">Barista Bot recommends:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {recommendations.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-amber-200">
                  <CardContent className="p-0">
                    {/* Optional: Display image if URL is provided and needed */}
                    {/* {item.imageUrl && (
                      <div className="relative h-40 w-full">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      </div>
                    )} */}
                    <div className="p-4"> {/* Increased padding */}
                      <h3 className="text-lg font-semibold text-amber-950">{item.name}</h3>
                      {/* Display Price */}
                      <p className="text-md font-bold text-amber-700 mt-1">
                          ${item.basePrice.toFixed(2)}
                      </p>
                      {/* Display Reasoning */}
                      <p className="text-sm text-amber-800 mt-3 italic border-l-4 border-amber-400 pl-3 py-1 bg-amber-50 rounded-r-md">
                        "{item.reasoning}"
                      </p>
                      {/* Display Description (optional) */}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                        onClick={() => router.push(`/product/${item.id}`)} // Link to product page
                      >
                        View Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
             ))}
           </div>
           {/* Start Over Button */}
             <Button variant="outline" onClick={resetQuiz} className="border-amber-300 text-amber-800 hover:bg-amber-100">Start Over</Button>
          </div>

      ) : (
         // Display Quiz Flow
         <Card className="border border-amber-200 shadow-sm">
           <CardContent className="p-4 sm:p-6"> {/* Responsive padding */}
             <h2 className="text-lg font-semibold text-amber-900 mb-2">
               Question {currentQ + 1} of {questions.length}
             </h2>
             <p className="mb-4 text-amber-700">
               {questions[currentQ].question}
             </p>

             {/* Options Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
               {questions[currentQ].options.map((opt) => (
                 <Button
                   key={opt}
                   variant={answers[currentQ] === opt ? "secondary" : "outline"}
                   className={`text-center justify-center h-12 text-base sm:text-sm ${answers[currentQ] === opt ? 'bg-amber-200 border-amber-400 ring-2 ring-amber-500 ring-offset-1' : 'border-amber-300 hover:bg-amber-50'}`}
                   onClick={() => selectOption(opt)}
                 >
                   {opt}
                 </Button>
               ))}
             </div>

             <Separator className="my-4 sm:my-6 bg-amber-200" />

             {/* Navigation Buttons */}
             <div className="flex justify-between items-center">
               <Button
                 variant="ghost"
                 disabled={currentQ === 0}
                 onClick={() => setCurrentQ((q) => Math.max(q - 1, 0))}
                 className="text-amber-700 hover:bg-amber-100 disabled:opacity-50 px-4"
               >
                 Back
               </Button>

               {currentQ < questions.length - 1 ? (
                 <Button
                   disabled={!answers[currentQ]} // Disable if no answer selected
                   onClick={() => setCurrentQ((q) => q + 1)}
                   className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 px-6 py-2"
                 >
                   Next
                 </Button>
               ) : (
                 <Button
                   disabled={!answers[currentQ] || loadingRecommendations} // Disable if no answer or loading
                   onClick={submitQuiz}
                   className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 px-6 py-2"
                 >
                   {loadingRecommendations ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Getting Recommendation...
                     </>
                   ) : (
                     "Get Recommendation"
                   )}
                 </Button>
               )}
             </div>

             {/* Display Recommendation Error (if any) */}
             {recommendationError && (
                 <p className="mt-4 text-sm text-red-600 text-center bg-red-50 p-2 rounded border border-red-200">
                     Error: {recommendationError}
                 </p>
              )}
           </CardContent>
         </Card>
      )}
    </MainLayout>
  );
}