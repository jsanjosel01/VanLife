
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

export const Footer = () => {
    return (
        
        <footer className="bg-gradient-to-b from-background to-primary/40 text-muted-foreground border-t border-border transition-colors duration-500">
            <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
                
                {/* Marca */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground tracking-tighter">
                        Pervan
                    </h2>
                    <p className="text-sm leading-relaxed">
                        Tu plataforma para descubrir los mejores lugares donde pernoctar con tu furgo.
                        Explora con libertad.
                    </p>
                </div>

                {/* Navegación */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Cuenta</h3>
                  <ul className="space-y-3 text-sm">
                      <li><Link to="/signup" className="hover:text-primary transition-colors">Únete a la comunidad</Link></li>
                      <li><Link to="/login" className="hover:text-primary transition-colors">Inicia sesión</Link></li>
                      <li><Link to="/mapa" className="hover:text-primary transition-colors">Explorar Mapa</Link></li>
                  </ul>
              </div>

                {/* Legal */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Legal</h3>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/terms" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
                        <li><Link to="/privacy" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
                    </ul>
                </div>

                {/* Contacto */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Contacto</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                             <span className="opacity-70">Email:</span>
                             <a href="mailto:pernocvan@gmail.com" className="text-foreground hover:text-primary transition-colors">
                                pervan@gmail.com
                             </a>
                        </li>
                    </ul>
                </div>

            </div>

            {/* Pie inferior  */}
            <div className="bg-primary py-8 border-t border-border/40"> 
                <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium">© {new Date().getFullYear()} Pervan</span>
                    <span className="hidden md:inline opacity-20">|</span>
                    
                    <div className="flex items-center gap-2 text-xs">
                        <span>Para la comunidad camper</span>
                        <Truck size={16} className="opacity-70" /> 
                    </div>
                </div>
            </div>
        </footer>
    );
};