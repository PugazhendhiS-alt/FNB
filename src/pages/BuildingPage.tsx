import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useCafeteriaAdmin } from "@/contexts/CafeteriaAdminContext";

export default function BuildingPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { cafeterias, buildings } = useCafeteriaAdmin();
  const building = buildings.find((b) => b.id === buildingId);
  const buildingCafeterias = cafeterias.filter((c) => c.buildingId === buildingId);

  if (!building) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Building not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={building.name} />

      <div className="mx-auto max-w-lg px-4 pt-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="mb-1 text-xl font-bold text-foreground">Cafeterias</h2>
        <p className="mb-5 text-sm text-muted-foreground">{buildingCafeterias.length} outlets available at {building.name}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {buildingCafeterias.map((cafe, i) => (
            <button
              key={cafe.id}
              onClick={() => navigate(`/cafeteria/${cafe.id}`)}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
              aria-label={`View menu for ${cafe.name}`}
            >
              <div className="relative h-36 overflow-hidden">
                <img src={cafe.image} alt={cafe.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                {!cafe.isOpen && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">Closed</span>
                  </div>
                )}
                {cafe.isOpen && (
                  <span className="absolute right-2 top-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground">Open</span>
                )}
              </div>
              <div className="p-3 text-left">
                <h3 className="font-semibold text-card-foreground">{cafe.name}</h3>
                <p className="text-xs text-muted-foreground">{cafe.cuisine}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {cafe.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {cafe.openTime} – {cafe.closeTime}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
