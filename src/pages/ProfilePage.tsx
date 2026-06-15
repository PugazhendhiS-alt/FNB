import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ChevronRight, User, Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import acbLogo from "@/assets/acb-logo.jpg";

const profileItems = [
  { icon: User, label: "Edit Profile" },
];

export default function ProfilePage() {
  const { isInstallable, install } = useInstallPrompt();

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Profile" showCart={false} />
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-gold text-2xl font-bold text-primary-foreground">
            JD
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Jane Doe</h2>
            <p className="text-sm text-muted-foreground">jane.doe@company.com</p>
          </div>
        </div>


        {/* Install banner */}
        {isInstallable && (
          <button
            onClick={install}
            className="mb-6 flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Install ACB Food</p>
              <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
            </div>
          </button>
        )}

        {/* Menu */}
        <div className="space-y-1">
          {profileItems.map(({ icon: Icon, label }) => (
            <button key={label} className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-secondary">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
