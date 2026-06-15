import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, MapPin, Lock } from "lucide-react";
import { heroImage } from "@/data/mockData";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useCafeteriaAdmin } from "@/contexts/CafeteriaAdminContext";
import acbLogo from "@/assets/acb-logo.jpg";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const { cafeterias, buildings } = useCafeteriaAdmin();
  const buildingCounts = useMemo(
    () => cafeterias.reduce<Record<string, number>>((counts, cafe) => {
      counts[cafe.buildingId] = (counts[cafe.buildingId] ?? 0) + 1;
      return counts;
    }, {}),
    [cafeterias]
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      {/* Hero */}
      <div className="relative mx-auto max-w-lg overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img src={heroImage} alt="Corporate cafeteria" className="h-full w-full object-cover brightness-50" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-5 left-4 right-4">
            <p className="text-sm font-medium text-primary">{greeting} 👋</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">What's for lunch?</h2>
          </div>
        </div>
      </div>

      {/* Building Selection */}
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h3 className="mb-3 text-base font-semibold text-foreground">Select your building</h3>
        <div className="space-y-3">
          {buildings.map((building, i) => (
            <button
              key={building.id}
              onClick={() => navigate(`/building/${building.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
              aria-label={`Select ${building.name}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-muted">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-card-foreground">{building.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {building.address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {buildingCounts[building.id] ?? 0} outlets
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>

        {/* Admin Portal Button */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground mb-3">Admin Management</p>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full gap-2"
            size="sm"
          >
            <Lock className="h-4 w-4" />
            Admin Portal
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
