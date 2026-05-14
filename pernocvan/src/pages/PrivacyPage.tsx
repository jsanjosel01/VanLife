import { Link } from "react-router-dom";


export const PrivacyPage = () => {
  return (
    // <div className="min-h-screen bg-background pt-32 pb-20 px-6 font-sans">
    <div className="flex justify-center bg-background pt-10 pb-40 px-4">
      <div className="max-w-3xl mx-auto bg-card p-8 md:p-12 rounded-[32px] border border-border shadow-sm">
        <h2 className="text-4xl font-black text-primary mb-8 tracking-tight">Política de Privacidad</h2>
        
        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">1. Datos Recogidos</h3>
            <p className="text-sm">
              Solo recogemos los datos necesarios para tu cuenta: nombre de usuario, correo electrónico y la información que decidas compartir en tus reseñas.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">2. Uso de la Ubicación</h3>
            <p className="text-sm">
              Utilizamos tu ubicación en tiempo real para mostrarte los puntos de pernocta más cercanos a ti. Estos datos no se almacenan en nuestros servidores de forma permanente.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">3. Seguridad</h3>
            <p className="text-sm">
              Tus datos están protegidos mediante el sistema de autenticación de Supabase, garantizando que tu contraseña y tu información personal estén cifradas y seguras.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
          
          <p className="text-[10px] text-muted-foreground uppercase font-black">VanLife 2026©</p>
        </div>
      </div>
    </div>
  );
};