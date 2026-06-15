import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, CreditCard, Smartphone, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { QRCodeSVG } from "qrcode.react";

const paymentMethods = [
  { id: "upi", label: "UPI", desc: "Google Pay / PhonePe / Paytm", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", desc: "•••• 4242", icon: CreditCard },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const confirmedItemsRef = useRef<typeof items | null>(null);
  const confirmedTotalRef = useRef<number>(0);

  const grandTotal = confirmed ? confirmedTotalRef.current : totalPrice;

  const orderCode = useMemo(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }, []);

  useEffect(() => {
    if (items.length === 0 && !confirmed) {
      navigate("/");
    }
  }, [items, confirmed, navigate]);

  const { addOrder } = useOrders();

  const handleConfirm = async () => {
    confirmedItemsRef.current = [...items];
    confirmedTotalRef.current = totalPrice;

    const orderPayload = {
      cafeteriaId: items[0]?.item.cafeteriaId ?? '',
      userId: 'guest',
      userName: 'Guest User',
      userEmail: 'guest@example.com',
      items: items.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
        price: item.price,
        image: item.image ?? '',
      })),
      totalAmount: totalPrice,
      status: 'pending' as const,
      specialInstructions: '',
    };

    try {
      await addOrder(orderPayload);
      toast.success('Order placed successfully');
    } catch (error) {
      toast.error('Order created locally; remote sync failed.');
    }

    setConfirmed(true);
    clearCart();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(orderCode);
    toast.success("Code copied!");
  };

  if (confirmed) {
    const orderedItems = confirmedItemsRef.current || [];
    const qrData = JSON.stringify({
      orderId: orderCode,
      date: new Date().toISOString(),
      items: orderedItems.map(({ item, quantity }) => ({
        name: item.name,
        qty: quantity,
        price: item.price,
      })),
      subtotal: totalPrice,
      total: grandTotal,
      payment: selectedPayment,
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 pb-20">
        <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-success">
            <CheckCircle2 className="h-8 w-8 text-success-foreground" />
          </div>
          <h2 className="mb-1 text-2xl font-bold text-foreground">Order Confirmed!</h2>
          <p className="mb-5 text-sm text-muted-foreground">Show this QR code at the outlet for pickup.</p>

          {/* QR Code */}
          <div className="mb-4 rounded-2xl border bg-white p-5 shadow-elevated">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#1a1408"
            />
          </div>

          {/* Order code */}
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-widest gradient-gold-text">{orderCode}</span>
            <button onClick={copyCode} className="text-muted-foreground hover:text-foreground" aria-label="Copy order code">
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Order details card */}
          <div className="mb-4 w-full rounded-xl border bg-card p-4 text-left shadow-card">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Order Details</p>
            <div className="space-y-1.5">
              {orderedItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{quantity}× {item.name}</span>
                  <span className="font-medium text-foreground">₹{(item.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t pt-3">
              <div className="flex justify-between text-sm font-bold text-foreground">
                <span>Total Paid</span>
                <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">* Prices inclusive of taxes</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">⏱ Estimated pickup: 10–15 min</p>
          </div>

          <button onClick={() => navigate("/")} className="w-full rounded-full gradient-gold px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
            Back to Home
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Checkout" showCart={false} />

      <div className="mx-auto max-w-lg px-4 pt-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>

        {/* Payment method selector */}
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
          {paymentMethods.map((pm) => {
            const isSelected = selectedPayment === pm.id;
            return (
              <button
                key={pm.id}
                onClick={() => setSelectedPayment(pm.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "bg-card hover:border-primary/20"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isSelected ? "gradient-gold" : "bg-secondary"}`}>
                  <pm.icon className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{pm.label}</p>
                  <p className="text-xs text-muted-foreground">{pm.desc}</p>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                  {isSelected && <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="mb-6 rounded-xl border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Order Summary</h3>
          {items.map(({ item, quantity }) => (
            <div key={item.id} className="flex justify-between py-1.5 text-sm">
              <span className="text-muted-foreground">{quantity}× {item.name}</span>
              <span className="font-medium text-foreground">₹{(item.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 border-t pt-3 space-y-1.5">
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">* All prices are inclusive of taxes</p>
          </div>
        </div>

        <button onClick={handleConfirm} className="w-full rounded-xl gradient-gold py-3.5 text-center text-base font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]">
          Place Order · ₹{grandTotal.toFixed(2)}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
