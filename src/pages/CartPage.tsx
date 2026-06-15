import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  const grandTotal = totalPrice;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Cart" showCart={false} />
        <div className="flex flex-col items-center justify-center px-4 pt-24 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mb-6 text-sm text-muted-foreground">Add some delicious items from a cafeteria</p>
          <button onClick={() => navigate("/")} className="rounded-full gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
            Browse Cafeterias
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <AppHeader title="Cart" showCart={false} />

      <div className="mx-auto max-w-lg px-4 pt-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue ordering
        </button>

        <h2 className="mb-4 text-xl font-bold text-foreground">Your Order ({totalItems} items)</h2>

        <div className="space-y-3">
          {items.map(({ item, quantity }) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>
                <p className="text-sm font-medium text-primary">₹{(item.price * quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground" aria-label="Decrease quantity">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-foreground">{quantity}</span>
                <button onClick={() => updateQuantity(item.id, quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full gradient-gold text-primary-foreground transition-transform active:scale-90" aria-label="Increase quantity">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${item.name}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>


        {/* Summary */}
        <div className="mt-6 space-y-2 rounded-xl border bg-card p-4 shadow-card">
          <div className="border-b pb-2">
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">* All prices are inclusive of taxes</p>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full rounded-xl gradient-gold py-3.5 text-center text-base font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
          >
            Checkout · ₹{grandTotal.toFixed(2)}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
