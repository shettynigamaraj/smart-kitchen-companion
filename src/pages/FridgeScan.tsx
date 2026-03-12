import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FridgeScan = () => {
  const navigate = useNavigate();
  const { addIngredients } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [added, setAdded] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setDetected([]);
      setAdded(false);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kitchen-ai", {
        body: {
          action: "fridge-scan",
          image: imagePreview,
        },
      });
      if (error) throw error;
      setDetected(data.ingredients || []);
      toast.success(`Detected ${data.ingredients?.length || 0} ingredients!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to scan image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = () => {
    addIngredients(detected);
    setAdded(true);
    toast.success("Ingredients added to your pantry!");
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-2xl font-extrabold font-heading text-foreground mb-2">
        Fridge Scan 📸
      </h1>
      <p className="text-muted-foreground mb-6">
        Take a photo of your fridge and AI will detect ingredients
      </p>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />

      {!imagePreview ? (
        <Card
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-accent-foreground" />
          </div>
          <p className="font-heading font-bold text-foreground">Tap to take a photo</p>
          <p className="text-sm text-muted-foreground mt-1">or upload an image</p>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <Card className="overflow-hidden">
            <img src={imagePreview} alt="Fridge" className="w-full h-64 object-cover" />
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" /> Retake
            </Button>
            <Button onClick={handleScan} disabled={loading} className="flex-1 bg-primary text-primary-foreground">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Camera className="h-4 w-4 mr-2" /> Scan</>
              )}
            </Button>
          </div>

          {detected.length > 0 && (
            <Card className="p-4 animate-scale-in">
              <h3 className="font-heading font-bold text-foreground mb-3">
                Detected Ingredients
              </h3>
              <div className="space-y-2 mb-4">
                {detected.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-accent rounded-lg px-3 py-2">
                    <span className="text-foreground font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddAll}
                disabled={added}
                className="w-full bg-primary text-primary-foreground"
              >
                {added ? (
                  <><Check className="h-4 w-4 mr-2" /> Added to Pantry</>
                ) : (
                  "Add All to Pantry"
                )}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FridgeScan;
