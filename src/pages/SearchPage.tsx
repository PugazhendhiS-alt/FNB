import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Search, Leaf, Plus, Building2, MapPin, Clock, ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCafeteriaAdmin } from "@/contexts/CafeteriaAdminContext";
import { toast } from "sonner";

export default function SearchPage() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "vegan">("all");
  const [searchType, setSearchType] = useState<"outlets" | "menu">("menu");
  const { addItem } = useCart();
  const { cafeterias, menuItems, buildings } = useCafeteriaAdmin();

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  const buildingCounts = useMemo(
    () => cafeterias.reduce<Record<string, number>>((counts, cafe) => {
      counts[cafe.buildingId] = (counts[cafe.buildingId] ?? 0) + 1;
      return counts;
    }, {}),
    [cafeterias]
  );

  const buildingCafeterias = useMemo(
    () => (selectedBuildingId ? cafeterias.filter((c) => c.buildingId === selectedBuildingId) : []),
    [selectedBuildingId, cafeterias]
  );

  const buildingMenuItems = useMemo(
    () => menuItems.filter((m) => buildingCafeterias.some((c) => c.id === m.cafeteriaId)),
    [buildingCafeterias, menuItems]
  );

  const filteredOutlets = useMemo(() => {
    if (!query.trim()) return buildingCafeterias;
    const q = query.toLowerCase();
    return buildingCafeterias.filter(
      (c) => c.name.toLowerCase().includes(q) || c.cuisine.toLowerCase().includes(q)
    );
  }, [query, buildingCafeterias]);

  const filteredMenuItems = useMemo(() => {
    let filtered = buildingMenuItems;
    if (dietFilter === "veg") filtered = filtered.filter((i) => i.isVeg);
    if (dietFilter === "vegan") filtered = filtered.filter((i) => i.isVegan);
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [query, dietFilter, buildingMenuItems]);

  const getCafeName = (cafeteriaId: string) => cafeterias.find((c) => c.id === cafeteriaId)?.name || "";

  // Step 1: Building selection
  if (!selectedBuildingId) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Search" />
        <div className="mx-auto max-w-lg px-4 pt-4">
          <h2 className="mb-1 text-lg font-bold text-foreground">Select a building</h2>
          <p className="mb-5 text-sm text-muted-foreground">Choose a building to search its outlets and menu</p>
          <div className="space-y-3">
            {buildings.map((building, i) => (
              <button
                key={building.id}
                onClick={() => setSelectedBuildingId(building.id)}
                className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.98] animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
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
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {buildingCounts[building.id] ?? 0} outlets
                </span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Step 2: Search within building
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Search" />
      <div className="mx-auto max-w-lg px-4 pt-4">
        {/* Back to building selection */}
        <button
          onClick={() => { setSelectedBuildingId(null); setQuery(""); setDietFilter("all"); }}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {selectedBuilding?.name}
        </button>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === "outlets" ? "Search outlets, cuisine..." : "Search dishes, category..."}
            className="w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search"
          />
        </div>

        {/* Search type toggle */}
        <div className="mb-4 flex gap-2">
          {(["outlets", "menu"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setSearchType(t); setQuery(""); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                searchType === t ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t === "outlets" ? "🏪 Outlets" : "🍽️ Menu Items"}
            </button>
          ))}
        </div>

        {/* Diet filters (menu only) */}
        {searchType === "menu" && (
          <div className="mb-4 flex gap-2">
            {(["all", "veg", "vegan"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDietFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  dietFilter === f ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "veg" ? "🥬 Veg" : "🌱 Vegan"}
              </button>
            ))}
          </div>
        )}

        {/* Outlets results */}
        {searchType === "outlets" && (
          filteredOutlets.length === 0 ? (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              <p>No outlets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOutlets.map((cafe, i) => (
                <a
                  key={cafe.id}
                  href={`/cafeteria/${cafe.id}`}
                  className="flex overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:border-primary/30 hover:shadow-elevated active:scale-[0.98] animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                >
                  <img src={cafe.image} alt={cafe.name} className="h-24 w-24 flex-shrink-0 object-cover" loading="lazy" />
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <h3 className="font-semibold text-sm text-card-foreground">{cafe.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{cafe.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {cafe.openTime} – {cafe.closeTime}
                      </span>
                      {cafe.isOpen ? (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">Open</span>
                      ) : (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">Closed</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        )}

        {/* Menu items results */}
        {searchType === "menu" && (
          query.trim() === "" && dietFilter === "all" ? (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              <p>Start typing to search for dishes in {selectedBuilding?.name}</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              <p>No items found matching your search</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="flex overflow-hidden rounded-xl border bg-card shadow-card">
                  <img src={item.image} alt={item.name} className="h-24 w-24 flex-shrink-0 object-cover" loading="lazy" />
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-card-foreground">{item.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{getCafeName(item.cafeteriaId)}</p>
                        </div>
                        {(item.isVeg || item.isVegan) && (
                          <span className="flex-shrink-0 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                            <Leaf className="inline h-3 w-3" /> {item.isVegan ? "V" : "VG"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">₹{item.price.toFixed(2)}</span>
                      <button
                        onClick={() => { addItem(item); toast.success(`Added ${item.name}`, { duration: 1500 }); }}
                        className="flex h-7 w-7 items-center justify-center rounded-full gradient-gold text-primary-foreground"
                        aria-label={`Add ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <BottomNav />
    </div>
  );
}
