import MentoriaPage from "./MentoriaPage";
import MercadoPagoSubscriptionButton from "./MercadoPagoSubscriptionButton";
import MouseGlowBackground from "@/components/mouse-glow-background";
import EntrenamientoFocusPage from "./EntrenamientoFocusPage";
export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden  text-white">
      <MouseGlowBackground />
      <div className="relative z-10 pt-16">
      <EntrenamientoFocusPage />
      </div>
    </main>
  );
}
