import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Loader2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GroceryList = () => {
  const navigate = useNavigate();
  const { ingredients, addIngredient, addIngredients, removeIngredient } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [manualUnit, setManualUnit] = useState("g");

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("kitchen-ai", {
          body: { action: "bill-scan", image: base64 },
        });
        if (error) throw error;
        setScannedItems(data.ingredients || []);
        toast.success(`Found ${data.ingredients?.length || 0} items!`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to scan bill");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddScanned = () => {
    addIngredients(scannedItems);
    setScannedItems([]);
    toast.success("Items added to pantry!");
  };

  const handleManualAdd = () => {
    if (!manualName.trim() || !manualQty) return;
    addIngredient({ name: manualName.trim(), quantity: Number(manualQty), unit: manualUnit });
    setManualName("");
    setManualQty("");
    toast.success(`${manualName} added!`);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold font-heading text-foreground mb-2">
        Grocery List 🛒
      </h1>

      {/* Bill Upload */}
      <Card className="p-4 mb-4">
        <h3 className="font-heading font-bold text-foreground mb-2">Scan a Bill or Screenshot</h3>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleBillUpload} className="hidden" />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> Upload Bill / Screenshot</>
          )}
        </Button>
      </Card>

      {scannedItems.length > 0 && (
        <Card className="p-4 mb-4 animate-scale-in">
          <h3 className="font-heading font-bold text-foreground mb-3">Scanned Items</h3>
          <div className="space-y-2 mb-3">
            {scannedItems.map((item, i) => (
              <div key={i} className="flex justify-between bg-accent rounded-lg px-3 py-2">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground text-sm">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleAddScanned} className="w-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4 mr-2" /> Add All to Pantry
          </Button>
        </Card>
      )}

      {/* Manual Add */}
      <Card className="p-4 mb-6">
        <h3 className="font-heading font-bold text-foreground mb-3">Add Manually</h3>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Ingredient" value={manualName} onChange={(e) => setManualName(e.target.value)} className="flex-1" />
          <Input type="number" placeholder="Qty" value={manualQty} onChange={(e) => setManualQty(e.target.value)} className="w-20" />
          <select
            value={manualUnit}
            onChange={(e) => setManualUnit(e.target.value)}
            className="rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="pcs">pcs</option>
          </select>
        </div>
        <Button onClick={handleManualAdd} className="w-full bg-secondary text-secondary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </Card>

      {/* Current Inventory */}
      <h2 className="font-heading font-bold text-lg text-foreground mb-3">Current Pantry</h2>
      {ingredients.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No ingredients yet. Add some!</p>
      ) : (
        <div className="space-y-2">
          {ingredients.map((ing) => (
            <Card key={ing.id} className="p-3 flex justify-between items-center">
              <div>
                <span className="font-medium text-foreground">{ing.name}</span>
                <span className="text-muted-foreground text-sm ml-2">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
              <button onClick={() => removeIngredient(ing.id)} className="text-destructive/60 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroceryList;
