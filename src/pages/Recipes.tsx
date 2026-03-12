import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChefHat, Loader2, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const moods = [
  { label: "Heavy Meal", emoji: "🍖", value: "heavy" },
  { label: "Light Meal", emoji: "🥗", value: "light" },
  { label: "Healthy", emoji: "💪", value: "healthy" },
  { label: "Sweet", emoji: "🍰", value: "sweet" },
  { label: "Spicy", emoji: "🌶️", value: "spicy" },
];

const Recipes = () => {
  const navigate = useNavigate();
  const { ingredients, addRecipe } = useInventory();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [mode, setMode] = useState<"leftover" | "ingredient" | null>(null);
  const [leftoverInput, setLeftoverInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!selectedMood || !mode) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kitchen-ai", {
        body: {
          action: "generate-recipes",
          mood: selectedMood,
          mode,
          leftover: leftoverInput,
          ingredients: ingredients.map((i) => `${i.name} (${i.quantity}${i.unit})`),
        },
      });
      if (error) throw error;
      const recipes = data.recipes || [];
      setGeneratedRecipes(recipes);
      recipes.forEach((r: any) => addRecipe({ ...r, mood: selectedMood }));
      toast.success(`Generated ${recipes.length} recipes!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto pb-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold font-heading text-foreground mb-2">
        Recipe Generator 🧑‍🍳
      </h1>
      <p className="text-muted-foreground mb-6">Choose your mood and cooking style</p>

      {/* Mood Selection */}
      <h3 className="font-heading font-bold text-foreground mb-3">What's your mood?</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelectedMood(m.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedMood === m.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="animate-fade-in">
          <h3 className="font-heading font-bold text-foreground mb-3">Cooking Mode</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card
              onClick={() => setMode("leftover")}
              className={`p-4 cursor-pointer transition-all ${
                mode === "leftover" ? "ring-2 ring-primary bg-accent" : ""
              }`}
            >
              <p className="font-heading font-bold text-foreground">🍚 Leftover</p>
              <p className="text-sm text-muted-foreground">Use leftover food</p>
            </Card>
            <Card
              onClick={() => setMode("ingredient")}
              className={`p-4 cursor-pointer transition-all ${
                mode === "ingredient" ? "ring-2 ring-primary bg-accent" : ""
              }`}
            >
              <p className="font-heading font-bold text-foreground">🥬 Ingredients</p>
              <p className="text-sm text-muted-foreground">From your pantry</p>
            </Card>
          </div>
        </div>
      )}

      {mode === "leftover" && (
        <div className="mb-6 animate-fade-in">
          <Input
            placeholder="What leftover do you have? (e.g., rice, pasta)"
            value={leftoverInput}
            onChange={(e) => setLeftoverInput(e.target.value)}
          />
        </div>
      )}

      {mode && (
        <Button
          onClick={handleGenerate}
          disabled={loading || (mode === "leftover" && !leftoverInput)}
          className="w-full bg-primary text-primary-foreground mb-6"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><ChefHat className="h-4 w-4 mr-2" /> Generate Recipes</>
          )}
        </Button>
      )}

      {/* Results */}
      {generatedRecipes.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-heading font-bold text-lg text-foreground">Your Recipes</h3>
          {generatedRecipes.map((recipe, i) => (
            <Card
              key={i}
              className="p-4 cursor-pointer"
              onClick={() => setExpandedRecipe(expandedRecipe === i ? null : i)}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-heading font-bold text-foreground">{recipe.name}</h4>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="h-3 w-3" /> {recipe.cookingTime}
                </div>
              </div>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1 text-secondary">
                  <Flame className="h-3 w-3" /> {recipe.calories} cal
                </span>
                <span className="text-muted-foreground">P: {recipe.protein}g</span>
                <span className="text-muted-foreground">C: {recipe.carbs}g</span>
                <span className="text-muted-foreground">F: {recipe.fat}g</span>
              </div>
              {expandedRecipe === i && (
                <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                  <h5 className="font-bold text-foreground text-sm mb-2">Ingredients</h5>
                  <ul className="text-sm text-muted-foreground mb-3 list-disc pl-4">
                    {recipe.ingredients.map((ing: string, j: number) => (
                      <li key={j}>{ing}</li>
                    ))}
                  </ul>
                  <h5 className="font-bold text-foreground text-sm mb-2">Instructions</h5>
                  <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                    {recipe.instructions.map((step: string, j: number) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipes;
