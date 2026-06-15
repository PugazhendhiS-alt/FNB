import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Leaf, Minus, Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";
import { useCafeteriaAdmin } from "@/contexts/CafeteriaAdminContext";
import { toast } from "sonner";

export default function CafeteriaPage() {
  const { cafeteriaId } = useParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems, updateQuantity } = useCart();
  const { cafeterias, menuItems } = useCafeteriaAdmin();
  const cafe = cafeterias.find((c) => c.id === cafeteriaId);
  const items = menuItems.filter((m) => m.cafeteriaId === cafeteriaId);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const [activeCategory, setActiveCategory] = useState(() => categories[0] || "");

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0] || "");
    }
  }, [categories, activeCategory]);

  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  const getCartQty = (itemId: string) => cartItems.find((ci) => ci.item.id === itemId)?.quantity || 0;

  if (!cafe) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Cafeteria not found</div>;
  }

  const handleAdd = (item: typeof items[0]) => {
    addItem(item);
    toast.success(`Added ${item.name}`, { duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={cafe.name} />

      {/* Hero banner */}
      <div className="relative mx-auto max-w-lg">
        <div className="relative h-44 overflow-hidden">
          <img src={cafe.image} alt={cafe.name} className="h-full w-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button onClick={() => navigate(-1)} className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm" aria-label="Go back">
            <ArrowLeft className="h-4 w-4 text-card-foreground" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-foreground">{cafe.name}</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {cafe.openTime} – {cafe.closeTime}</span>
              <span>{cafe.cuisine}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-4">
        {/* Category tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "gradient-gold text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const qty = getCartQty(item.id);
            return (
              <div key={item.id} className="flex overflow-hidden rounded-xl border bg-card shadow-card animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}>
                <img src={item.image} alt={item.name} className="h-28 w-28 flex-shrink-0 object-cover" loading="lazy" />
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight text-card-foreground">{item.name}</h3>
                      {(item.isVeg || item.isVegan) && (
                        <span className="flex-shrink-0 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success" title={item.isVegan ? "Vegan" : "Vegetarian"}>
                          <Leaf className="inline h-3 w-3" /> {item.isVegan ? "V" : "VG"}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-primary">₹{item.price.toFixed(2)}</span>
                      {item.calories && <span className="ml-2 text-xs text-muted-foreground">{item.calories} cal</span>}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAdd(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full gradient-gold text-primary-foreground shadow-sm transition-transform active:scale-90"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item.id, qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground hover:text-foreground" aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button onClick={() => handleAdd(item)} className="flex h-7 w-7 items-center justify-center rounded-full gradient-gold text-primary-foreground" aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
