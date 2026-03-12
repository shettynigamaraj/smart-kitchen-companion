import { useNavigate } from "react-router-dom";
import { Camera, ShoppingCart, ChefHat, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/InventoryContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { ingredients, recipes, getLowStockItems } = useInventory();
  const lowStock = getLowStockItems();

  const actions = [
    {
      title: "Fridge Scan",
      description: "Detect ingredients from a photo",
      icon: Camera,
      path: "/fridge-scan",
      color: "bg-primary",
    },
    {
      title: "Grocery List",
      description: "Add from bills or screenshots",
      icon: ShoppingCart,
      path: "/grocery",
      color: "bg-secondary",
    },
    {
      title: "Recipes",
      description: "Generate AI-powered recipes",
      icon: ChefHat,
      path: "/recipes",
      color: "bg-kitchen-brown",
    },
    {
      title: "History",
      description: "View past recipes",
      icon: Clock,
      path: "/history",
      color: "bg-muted-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-8 max-w-lg mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold font-heading text-foreground">
          Smart Kitchen 🍳
        </h1>
        <p className="text-muted-foreground mt-1">
          {ingredients.length} ingredients · {recipes.length} recipes
        </p>
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-6 p-4 border-secondary bg-kitchen-peach animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-secondary" />
            <h3 className="font-heading font-bold text-foreground">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span
                key={item.id}
                className="text-sm bg-secondary/20 text-foreground px-2 py-1 rounded-md"
              >
                {item.name}: {item.quantity}{item.unit}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <Card
            key={action.title}
            onClick={() => navigate(action.path)}
            className="p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fade-in border-border"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
              <action.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-bold text-foreground">{action.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          </Card>
        ))}
      </div>

      {ingredients.length > 0 && (
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h2 className="font-heading font-bold text-lg text-foreground mb-3">
            Your Pantry
          </h2>
          <Card className="p-4 border-border">
            <div className="flex flex-wrap gap-2">
              {ingredients.slice(0, 12).map((ing) => (
                <span
                  key={ing.id}
                  className="text-sm bg-accent text-accent-foreground px-3 py-1.5 rounded-full"
                >
                  {ing.name} · {ing.quantity}{ing.unit}
                </span>
              ))}
              {ingredients.length > 12 && (
                <span className="text-sm text-muted-foreground px-3 py-1.5">
                  +{ingredients.length - 12} more
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
