import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, image, mood, mode, leftover, ingredients } = await req.json();

    let messages: any[] = [];

    if (action === "fridge-scan") {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this fridge photo and identify all visible food items/ingredients. Return a JSON array of objects with "name" (string), "quantity" (number, estimate), and "unit" (string like "pcs", "g", "kg", "ml", "L"). Only return the JSON array, no other text. Example: [{"name": "Tomato", "quantity": 3, "unit": "pcs"}]`,
            },
            {
              type: "image_url",
              image_url: { url: image },
            },
          ],
        },
      ];
    } else if (action === "bill-scan") {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract grocery items from this bill/receipt/screenshot image. Return a JSON array of objects with "name" (string), "quantity" (number), and "unit" (string like "pcs", "g", "kg", "ml", "L"). Only return the JSON array, no other text. Example: [{"name": "Sugar", "quantity": 200, "unit": "g"}]`,
            },
            {
              type: "image_url",
              image_url: { url: image },
            },
          ],
        },
      ];
    } else if (action === "generate-recipes") {
      const ingredientList = ingredients?.join(", ") || "none";
      const leftoverInfo = mode === "leftover" ? `Leftover food: ${leftover}.` : "";

      messages = [
        {
          role: "system",
          content: "You are a professional chef and nutritionist. Generate creative recipes.",
        },
        {
          role: "user",
          content: `Generate 3 recipes for a ${mood} meal. ${leftoverInfo} Available ingredients: ${ingredientList}. 
          
Return a JSON array of recipe objects with these fields:
- "name" (string)
- "ingredients" (array of strings like "200g rice")  
- "instructions" (array of step strings)
- "calories" (number)
- "protein" (number in grams)
- "carbs" (number in grams)
- "fat" (number in grams)
- "cookingTime" (string like "30 mins")

Only return the JSON array, no other text.`,
        },
      ];
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from response:", content);
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (action === "generate-recipes") {
      return new Response(JSON.stringify({ recipes: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ ingredients: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("kitchen-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
