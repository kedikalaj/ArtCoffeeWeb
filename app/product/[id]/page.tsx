"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Minus, Plus, ShoppingBag, EyeIcon as Eye3d, Coffee, Sparkles, Loader2 } from "lucide-react" // Added Loader2
import Image from "next/image"
import { useCafe } from "@/context/cafe-context"
import { ARView } from "@/components/ar-view"
import { BottomNavigation } from "@/components/bottom-navigation"
import axiosInstance from "@/lib/axios"
// Optional: Import useToast for better feedback
// import { useToast } from "@/components/ui/use-toast";

// --- Interfaces (keep as before) ---
interface ProductCustomizationOption {
  id: number
  name: string
  priceImpact: number
  defaultSelected: boolean
}

interface ProductCustomization {
  id: number
  name: string
  type: "radio" | "checkbox" | "text"
  options: ProductCustomizationOption[]
}

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  imageUrl: string
  categoryId: number
  productCustomizations: ProductCustomization[]
}


export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, orderType, tableNumber } = useCafe()
  // const { toast } = useToast(); // Optional
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{ [custId: number]: number | number[] | string }>({})
  const [showAR, setShowAR] = useState(false)
  const [beansToRedeem, setBeansToRedeem] = useState<number>(0)
  // Add loading state for the API call
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- useEffect and Handlers (keep as before) ---
  useEffect(() => {
    async function fetchProduct() {
      // Fetch logic remains the same
       try {
        const res = await fetch(`http://192.168.170.205:5001/api/products/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const data: Product = await res.json()
        setProduct(data)

        const defaults: { [custId: number]: number | number[] | string } = {}
        data.productCustomizations.forEach((cust) => {
          switch (cust.type) {
            case "radio": {
              const defaultOpt = cust.options.find((o) => o.defaultSelected)
              defaults[cust.id] = defaultOpt ? defaultOpt.id : cust.options[0]?.id ?? ""
              break
            }
            case "checkbox": {
              defaults[cust.id] = cust.options
                .filter((o) => o.defaultSelected)
                .map((o) => o.id)
              break
            }
            case "text": {
              defaults[cust.id] = ""
              break
            }
          }
        })
        setSelectedOptions(defaults)
      } catch (err) {
        console.error(err)
        router.push("/menu")
      }
    }
    fetchProduct()
  }, [params.id, router])

  const handleRadioChange = (custId: number, optionIdStr: string) => {
    const optionId = Number(optionIdStr)
    setSelectedOptions((prev) => ({ ...prev, [custId]: optionId }))
  }

 const handleCheckboxChange = (custId: number, optionId: number, checked: boolean | "indeterminate") => {
      const isChecked = !!checked;
      setSelectedOptions((prev) => {
        const current = Array.isArray(prev[custId]) ? (prev[custId] as number[]) : [];
        const newSelection = isChecked
          ? [...current, optionId]
          : current.filter((id: number) => id !== optionId);
        return {
          ...prev,
          [custId]: newSelection,
        };
      });
    }

  const handleTextChange = (custId: number, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [custId]: value }))
  }

  const handleBeansChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     let value = parseInt(event.target.value, 10);
     if (isNaN(value) || value < 0) {
        value = 0;
     }
     if (user && value > user.beanBalance) {
        value = user.beanBalance;
     }
     setBeansToRedeem(value);
  }

  // --- CHECKOUT HANDLER (Modified for API Call) ---
  const handleCheckout = async () => { // Make async
    if (!product || isSubmitting) return // Prevent double submission

    setIsSubmitting(true); // Set loading state

    // --- Payload construction logic (remains the same) ---
    let payloadOrderType: "pickup" | "dine_in" | undefined = undefined;
    if (orderType === 'takeout') {
        payloadOrderType = 'pickup';
    } else if (orderType === 'dine-in') {
        payloadOrderType = 'dine_in';
    } else {
        alert("Please select Dine-in or Takeout first (go back to Scan/Select Table screen).");
        setIsSubmitting(false); // Reset loading state
        return;
    }

    const selectedOptionIds: number[] = [];
    product.productCustomizations.forEach(cust => {
        const selection = selectedOptions[cust.id];
        if (cust.type === 'radio' && typeof selection === 'number') {
            selectedOptionIds.push(selection);
        } else if (cust.type === 'checkbox' && Array.isArray(selection)) {
            selectedOptionIds.push(...selection);
        }
    });

    let notes: string | undefined = undefined;
    const textCustomization = product.productCustomizations.find(c => c.type === 'text');
    if (textCustomization && typeof selectedOptions[textCustomization.id] === 'string') {
        notes = (selectedOptions[textCustomization.id] as string).trim() || undefined;
    }

     const itemPayload = {
        productId: product.id,
        quantity: quantity,
        notes: notes,
        selectedOptionIds: selectedOptionIds,
     };

    const orderPayload: any = {
        orderType: payloadOrderType,
        beansToRedeem: beansToRedeem > 0 ? beansToRedeem : undefined,
        items: [itemPayload]
    };

    if (payloadOrderType === 'dine_in') {
        if (tableNumber !== null) {
             orderPayload.tableId = tableNumber;
        } else {
            alert("Dine-in selected, but no table number is set. Please scan or select a table first.");
             setIsSubmitting(false); // Reset loading state
             return;
        }
    }
    // --- End of payload construction ---


    // --- API Call ---
    try {
      console.log("Sending Order Payload:", JSON.stringify(orderPayload, null, 2)); // Log before sending

      // Correct Axios POST: URL is the first argument, payload is the second.
      // Axios automatically sets Content-Type: application/json for objects.
      // Method ('POST') is determined by the axiosInstance.post() call itself.
      const response = await axiosInstance.post('/api/orders', orderPayload); // Pass payload directly

      // If the code reaches here, the request was successful (status 2xx)
      const result = response.data; // Axios puts response data in response.data
      console.log("Order successful:", result);
      alert("Order Submitted Successfully!"); // Simple success feedback

      // Optional: Navigate after success
      router.push('/menu'); // Navigate back to menu for example

  } catch (error: any) { // Use 'any' or a more specific AxiosError type if installed
      console.error("Error submitting order:", error);

      // Axios wraps HTTP errors (4xx, 5xx) in error.response
      if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorData = error.response.data; // Backend error details are usually here
          const status = error.response.status;
          const statusText = error.response.statusText;

          console.error(`Order submission failed: ${status} ${statusText}`, errorData);
          // Attempt to display a message from the backend error data, or fallback
          alert(`Order Failed: ${status} ${statusText}\n${errorData?.message || 'Server error. Please try again.'}`);

      } else if (error.request) {
          // The request was made but no response was received (network error, server down)
          console.error("Order submission error: No response received", error.request);
          alert("Could not connect to the server. Please check your network connection or try again later.");
      } else {
          // Something happened in setting up the request that triggered an Error (e.g., config issue)
          console.error("Order submission error: Request setup failed", error.message);
          alert("An unexpected error occurred while preparing your order. Please try again.");
      }

  } finally {
        setIsSubmitting(false); // Reset loading state regardless of success or failure
    }
  }

  // --- CALCULATIONS (Keep as before) ---
   const extraCost = product
    ? product.productCustomizations.reduce((sum: number, cust: ProductCustomization) => {
         const selection = selectedOptions[cust.id];
        if (cust.type === "radio") {
            if (typeof selection === 'number') {
                const opt = cust.options.find((o) => o.id === selection);
                return sum + (opt?.priceImpact || 0);
            }
        } else if (cust.type === "checkbox") {
            if (Array.isArray(selection)) {
                return sum + selection.reduce(
                    (s: number, id: number) => s + (cust.options.find((o) => o.id === id)?.priceImpact || 0),
                    0
                );
            }
        }
        return sum;
      }, 0)
    : 0
  const finalTotal = product ? (product.basePrice + extraCost) * quantity : 0;

  // --- RENDER (Mostly unchanged, update button state) ---
  if (!product) {
     // Loading state remains the same
    return (
      <div className="flex flex-col min-h-screen bg-amber-50">
        <header className="sticky top-0 bg-white shadow-sm p-4 z-10">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-amber-900">Customize Order</h1>
            <div className="bg-amber-100 rounded-full px-3 py-1 text-sm flex items-center min-w-[80px] justify-center">
              <Coffee className="h-4 w-4 mr-1" /> {user?.beanBalance ?? '-'} Beans
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 flex items-center justify-center">
          <p>Loading product...</p>
        </main>
        <BottomNavigation activeItem="menu" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
       {/* Header remains the same */}
      <header className="sticky top-0 bg-white shadow-sm p-4 z-10">
         <div className="flex justify-between items-center max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={() => !isSubmitting && router.back()} disabled={isSubmitting}> {/* Disable back button during submit */}
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-amber-900 truncate mr-2">{product.name}</h1>
            <div className="bg-amber-100 rounded-full px-3 py-1 text-sm flex items-center flex-shrink-0">
              <Coffee className="h-4 w-4 mr-1" /> {user?.beanBalance ?? 0} Beans
            </div>
         </div>
      </header>

      {/* Main content remains the same structure */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full pb-24">
        {/* Product Image and AR Button */}
        <div className="relative mb-6">
         {product.imageUrl && ( <Image src={product.imageUrl} alt={product.name} width={400} height={300} className="w-full h-48 object-cover rounded-lg" priority /> )}
         {product.categoryId === 1 && ( <Button variant="outline" size="sm" className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white" onClick={() => setShowAR(true)} disabled={isSubmitting} > <Eye3d className="h-4 w-4 mr-2" /> View in AR </Button> )}
        </div>

        {/* Product Name, Desc, Price */}
         <div className="flex justify-between items-start mb-4">
            <div> <h2 className="text-2xl font-bold text-amber-900 mb-1">{product.name}</h2> <p className="text-muted-foreground text-sm">{product.description}</p> </div>
            <p className="text-xl font-bold text-amber-900 text-right pl-2 flex-shrink-0"> ${finalTotal.toFixed(2)} </p>
        </div>

        {/* Customizations */}
         {product.productCustomizations.map((cust) => ( <Card key={cust.id} className="mb-4 overflow-hidden"> <CardContent className="p-4"> <Label className="block mb-3 text-md font-semibold text-amber-800">{cust.name}</Label> {/* Radio/Checkbox/Text rendering remains the same */} {/* ... [Radio Group Code] ... */} {/* ... [Checkbox Code] ... */} {/* ... [Text Input Code] ... */} </CardContent> </Card> ))}
         {/* --- [Paste Original Radio Group Code Here] --- */}
         {/* --- [Paste Original Checkbox Code Here] --- */}
         {/* --- [Paste Original Text Input Code Here] --- */}

          {/* Customizations - (Pasting original rendering code here for completeness) */}
        {product.productCustomizations.map((cust) => (
          <Card key={cust.id} className="mb-4 overflow-hidden">
            <CardContent className="p-4">
              <Label className="block mb-3 text-md font-semibold text-amber-800">{cust.name}</Label>

               {cust.type === 'radio' && (
                <RadioGroup
                  value={String(selectedOptions[cust.id] ?? '')}
                  onValueChange={(val) => !isSubmitting && handleRadioChange(cust.id, val)} // Disable during submit
                  className="space-y-2"
                  disabled={isSubmitting}
                >
                  {cust.options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(opt.id)} id={`${cust.id}-${opt.id}`} disabled={isSubmitting}/>
                      <Label htmlFor={`${cust.id}-${opt.id}`} className={`flex-grow cursor-pointer ${isSubmitting ? 'text-muted-foreground' : ''}`}>
                        {opt.name}
                        {opt.priceImpact > 0 && ` (+$${opt.priceImpact.toFixed(2)})`}
                        {opt.priceImpact < 0 && ` (-$${Math.abs(opt.priceImpact).toFixed(2)})`}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

               {cust.type === 'checkbox' && (
                <div className="space-y-2">
                  {cust.options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${cust.id}-opt-${opt.id}`}
                        checked={Array.isArray(selectedOptions[cust.id]) && (selectedOptions[cust.id] as number[]).includes(opt.id)}
                        onCheckedChange={(checked) => !isSubmitting && handleCheckboxChange(cust.id, opt.id, checked)} // Disable during submit
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`${cust.id}-opt-${opt.id}`} className={`flex-grow cursor-pointer ${isSubmitting ? 'text-muted-foreground' : ''}`}>
                        {opt.name}
                        {opt.priceImpact > 0 && ` (+$${opt.priceImpact.toFixed(2)})`}
                        {opt.priceImpact < 0 && ` (-$${Math.abs(opt.priceImpact).toFixed(2)})`}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {cust.type === 'text' && (
                <Input
                  id={`cust-${cust.id}`}
                  value={String(selectedOptions[cust.id] || '')}
                  onChange={(e) => !isSubmitting && handleTextChange(cust.id, e.currentTarget.value)} // Disable during submit
                  placeholder={`Enter ${cust.name} (optional)`}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        ))}


        {/* Quantity Selector */}
        <div className="flex items-center justify-center my-6">
           <div className="flex items-center border rounded-md">
             <Button variant="ghost" size="icon" onClick={() => !isSubmitting && setQuantity(q => Math.max(1, q - 1))} className="h-10 w-10 text-amber-800 hover:bg-amber-100" disabled={isSubmitting}> <Minus className="h-4 w-4" /> </Button>
             <span className="w-12 text-center font-medium text-lg">{quantity}</span>
             <Button variant="ghost" size="icon" onClick={() => !isSubmitting && setQuantity(q => q + 1)} className="h-10 w-10 text-amber-800 hover:bg-amber-100" disabled={isSubmitting}> <Plus className="h-4 w-4" /> </Button>
           </div>
        </div>

        {/* Beans Redemption */}
        {user && user.beanBalance > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label htmlFor="beans-redeem" className="flex items-center mb-2 font-medium"> <Sparkles className="h-5 w-5 mr-2 text-amber-500" /> Redeem Loyalty Beans </Label>
              <Input id="beans-redeem" type="number" value={beansToRedeem} onChange={handleBeansChange} placeholder="0" min="0" max={user?.beanBalance} className="w-full" disabled={isSubmitting}/>
              <p className="text-xs text-muted-foreground mt-1">You have {user.beanBalance} beans available.</p>
            </CardContent>
          </Card>
        )}

         <div className="flex-grow"></div>
      </main>

      {/* Sticky Footer */}
       <div className="sticky bottom-[var(--bottom-nav-height)] left-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-lg mx-auto">
                <Button
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white text-lg py-3 flex items-center justify-center"
                    onClick={handleCheckout}
                    // Disable if submitting, product not loaded, or order type missing
                    disabled={isSubmitting || !product || !orderType}
                 >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-5 w-5 mr-2" />
                             {orderType ? `Send Order - $${finalTotal.toFixed(2)}` : "Select Order Type First"}
                        </>
                    )}
                </Button>
                 {/* Show error message if order type is missing and not submitting */}
                 {!orderType && !isSubmitting && <p className="text-xs text-center text-red-600 mt-1">Go back to Scan Table screen to select Dine-in or Takeout.</p>}
            </div>
       </div>

      {/* Bottom Navigation */}
      <div style={{height: 'var(--bottom-nav-height, 60px)'}}> <BottomNavigation activeItem="menu" /> </div>

    </div>
  )
}