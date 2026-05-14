import { Link } from "react-router-dom";


export const TermsPage = () => {
  return (
    // <div className="min-h-screen bg-background pt-32 pb-20 px-6 font-sans">
    <div className="flex justify-center bg-background pt-10 pb-40 px-4">
      <div className="max-w-3xl mx-auto bg-card p-8 md:p-12 rounded-[32px] border border-border shadow-sm">
        <h2 className="text-4xl font-black text-primary mb-8 tracking-tight">Términos y Condiciones</h2>
        
        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">1. Uso del Servicio</h3>
            <p className="text-sm">
              VanLife es una plataforma informativa para la comunidad camper. Al usarla, aceptas que la información sobre lugares de pernocta es orientativa. Siempre debes respetar la señalización local y las normativas municipales.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">2. Responsabilidad del Usuario</h3>
            <p className="text-sm">
              Eres responsable de mantener la limpieza y el respeto en los puntos de pernocta. VanLife no se hace responsable de multas, sanciones o incidentes derivados del uso de la información mostrada en el mapa.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">3. Contenido Generado por el Usuario</h3>
            <p className="text-sm">
              Al publicar comentarios o fotos, garantizas que tienes el derecho de hacerlo y nos otorgas permiso para mostrarlos en la plataforma. No se permiten insultos ni contenido ofensivo.
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