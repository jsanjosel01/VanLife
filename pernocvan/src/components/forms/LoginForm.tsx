import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../../database/supabase/client";
import { toast } from "sonner";

export default function LoginForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validación básica
        if (!formData.email.trim() || !formData.password.trim()) {
            toast.error("Por favor, rellena todos los campos.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email.trim(),
                password: formData.password.trim(),
            });

            if (error) {
                // Si el login falla, avisamos al usuario
                toast.error("Correo o contraseña incorrectos.");
                return;
            }

            // Éxito: Redirigir al mapa 
            toast.success("¡Bienvenido de nuevo!");
            navigate("/mapa"); 

        } catch (err) {
            toast.error("Error inesperado de conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-sm"
            >
                {/* Header */}
                <div className="mb-6 space-y-2 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Acceder</h1>
                    <p className="text-lg text-muted-foreground">Introduce tus credenciales para acceder</p>
                </div>

                <div className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <Input 
                            className="h-12 text-lg" 
                            type="email" 
                            placeholder="tucorreo@gmail.com" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    
                    {/* Contraseña */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div className="relative">
                            <Input 
                                className="h-12 text-lg pr-14"
                                type={showPassword ? "text" : "password"}
                                placeholder="Tu contraseña" 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                        
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                ¿Has olvidado tu contraseña?
                            </Link>
                        </div>
                    </div>
                </div>

                <Button className="mt-6 h-12 w-full text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            <span>Iniciando sesión...</span>
                        </>
                    ) : (
                        <span>Iniciar Sesión</span>
                    )}
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta? {" "}
                    <Link to="/signup" className="font-semibold text-primary hover:underline">
                        Regístrate
                    </Link>
                </p>
            </form>
        </div>
    );
}