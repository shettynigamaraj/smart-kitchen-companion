import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/InventoryContext";
import { format } from "date-fns";

const RecipeHistory = () => {
  const navigate = useNavigate();
  const { recipes } = useInventory();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold font-heading text-foreground mb-2">
        Recipe History 📖
      </h1>
      <p className="text-muted-foreground mb-6">{recipes.length} recipes generated</p>

      {recipes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🍽️</p>
          <p>No recipes yet. Generate some!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="p-4 cursor-pointer animate-fade-in"
              onClick={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-bold text-foreground">{recipe.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(recipe.createdAt), "MMM d, yyyy")} · {recipe.mood}
                  </p>
                </div>
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
              {expanded === recipe.id && (
                <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                  <h5 className="font-bold text-foreground text-sm mb-2">Ingredients</h5>
                  <ul className="text-sm text-muted-foreground mb-3 list-disc pl-4">
                    {recipe.ingredients.map((ing, j) => (
                      <li key={j}>{ing}</li>
                    ))}
                  </ul>
                  <h5 className="font-bold text-foreground text-sm mb-2">Instructions</h5>
                  <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                    {recipe.instructions.map((step, j) => (
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

export default RecipeHistory;
