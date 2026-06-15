import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import acbLogo from "@/assets/acb-logo.jpg";

interface AppHeaderProps {
  title?: string;
  showCart?: boolean;
}

export function AppHeader({ title, showCart = true }: AppHeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={acbLogo} alt="ACB Business" className="h-9 w-9 rounded-lg" />
          {title ? (
            <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
          ) : (
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              ACB <span className="text-primary">Food</span>
            </h1>
          )}
        </Link>
        {showCart && (
          <Link to="/cart" className="relative p-2 text-foreground transition-colors hover:text-primary" aria-label={`Cart with ${totalItems} items`}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
