import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InventoryProvider } from "@/contexts/InventoryContext";
import Dashboard from "./pages/Dashboard";
import FridgeScan from "./pages/FridgeScan";
import GroceryList from "./pages/GroceryList";
import Recipes from "./pages/Recipes";
import RecipeHistory from "./pages/RecipeHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InventoryProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fridge-scan" element={<FridgeScan />} />
            <Route path="/grocery" element={<GroceryList />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/history" element={<RecipeHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
