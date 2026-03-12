import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  addedAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookingTime: string;
  mood: string;
  createdAt: string;
}

interface InventoryContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  addIngredient: (ingredient: Omit<Ingredient, "id" | "addedAt">) => void;
  addIngredients: (items: Omit<Ingredient, "id" | "addedAt">[]) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  deductIngredients: (usedIngredients: { name: string; amount: number }[]) => void;
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt">) => void;
  getLowStockItems: () => Ingredient[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
};

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem("kitchen-ingredients");
    return saved ? JSON.parse(saved) : [];
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem("kitchen-recipes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("kitchen-ingredients", JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem("kitchen-recipes", JSON.stringify(recipes));
  }, [recipes]);

  const addIngredient = (item: Omit<Ingredient, "id" | "addedAt">) => {
    const existing = ingredients.find(
      (i) => i.name.toLowerCase() === item.name.toLowerCase() && i.unit === item.unit
    );
    if (existing) {
      setIngredients((prev) =>
        prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      );
    } else {
      setIngredients((prev) => [
        ...prev,
        { ...item, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
      ]);
    }
  };

  const addIngredients = (items: Omit<Ingredient, "id" | "addedAt">[]) => {
    items.forEach(addIngredient);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const deductIngredients = (usedIngredients: { name: string; amount: number }[]) => {
    setIngredients((prev) =>
      prev
        .map((ing) => {
          const used = usedIngredients.find(
            (u) => u.name.toLowerCase() === ing.name.toLowerCase()
          );
          if (used) {
            const newQty = Math.max(0, ing.quantity - used.amount);
            return { ...ing, quantity: newQty };
          }
          return ing;
        })
        .filter((ing) => ing.quantity > 0)
    );
  };

  const addRecipe = (recipe: Omit<Recipe, "id" | "createdAt">) => {
    setRecipes((prev) => [
      { ...recipe, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const getLowStockItems = () => ingredients.filter((i) => i.quantity <= 10);

  return (
    <InventoryContext.Provider
      value={{
        ingredients,
        recipes,
        addIngredient,
        addIngredients,
        updateIngredient,
        removeIngredient,
        deductIngredients,
        addRecipe,
        getLowStockItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
