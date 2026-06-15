import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "text-blue-600 bg-blue-100" },
  preparing: { label: "Preparing", icon: Clock, className: "text-orange-600 bg-orange-100" },
  ready: { label: "Ready for Pickup", icon: CheckCircle2, className: "text-green-600 bg-green-100" },
  completed: { label: "Completed", icon: CheckCircle2, className: "text-green-700 bg-green-100" },
  cancelled: { label: "Cancelled", icon: AlertCircle, className: "text-red-600 bg-red-100" },
} as const;

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Orders" />
      <div className="mx-auto max-w-lg px-4 pt-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Package className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-foreground">No orders yet</h2>
            <p className="text-sm text-muted-foreground">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Active Orders</h2>
            {orders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={order.id} className="rounded-xl border bg-card p-4 shadow-card animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-muted-foreground">{order.id}</p>
                      <p className="font-semibold text-card-foreground">{order.userName}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">• {item.quantity}× {item.name}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-muted-foreground">{orderTime}</span>
                    <span className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
