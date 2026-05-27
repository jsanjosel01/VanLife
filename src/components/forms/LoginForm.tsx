import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../../database/supabase/client";
import { toast } from "sonner";


// Importacion del "modal" recuperar contraseña
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";


export default function LoginForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const isFormInvalid = !formData.email.includes('@') || formData.password.length < 8;

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

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
            // toast.success("¡Bienvenido de nuevo!");
            navigate("/mapa"); 

        } catch (err) {
            toast.error("Error inesperado de conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
    setErrorMsg(null);
    setIsSuccess(false);

    
    const emailFinal = formData.email.trim().toLowerCase();

    // Validamos que tras la limpieza no esté vacío
    if (!emailFinal) {
        setErrorMsg("Por favor, introduce tu correo electrónico.");
        return;
    }

    setIsLoading(true);

    try {
        // IMPORTANTE: Enviamos 'emailFinal', NO 'formData.email'
        const { error } = await supabase.auth.resetPasswordForEmail(emailFinal, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            console.error("Detalle del error:", error);
            setErrorMsg("No se ha podido verificar el estado de tu cuenta.");
            return;
        }

        setIsSuccess(true);
        
    } catch (err) {
        setErrorMsg("Error de conexión. Inténtalo de nuevo.");
    } finally {
        setIsLoading(false);
    }
};


    return (
        <div className="flex justify-center bg-background pt-10 pb-40 px-4">
            
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-sm"
            >
                {/* Header */}
                <div className="mb-6 space-y-2 text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-primary">Acceder</h2>
                    <p className="text-lg text-muted-foreground">Introduce tus credenciales para entrar</p>
                </div>

                <div className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                    <div className="flex items-center">
                    <label className="text-sm font-medium text-foreground">
                        Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    </div>
                    <Input 
                    className="h-12 text-lg" 
                    type="text" 
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
                            className="h-12 text-lg pr-16"
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            /* Cambiado de right-4 a right-10 para no chocar con Passbolt */
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    
                    {/* Olvidaste tu contraseña */}
                    <div className="text-right">
                    <Dialog modal={false}>
                        <DialogTrigger asChild>
                        <button type="button" className="text-sm font-semibold text-primary hover:underline cursor-pointer bg-transparent">
                            ¿Has olvidado tu contraseña?
                        </button>
                        </DialogTrigger>
                        
                        {/* Cuerpo del Modal */}
                        <DialogContent className="p-0 overflow-hidden sm:max-w-105 rounded-3xl border-border bg-card text-card-foreground">
                            
                            <button className="opacity-0 absolute w-0 h-0 pointer-events-none" />
                            <div className="p-10 pb-6">
                                <DialogHeader className="space-y-3">
                                <DialogTitle className="text-2xl font-bold text-left">Recuperar contraseña</DialogTitle>
                                <DialogDescription className="text-left text-muted-foreground">
                                    Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </DialogDescription>
                                </DialogHeader>

                                <div className="py-6 space-y-4">
                                <div className="space-y-4 text-left">
                                    <label className="text-sm font-medium text-foreground ml-1">
                                    Correo electrónico <span className="text-red-500">*</span>
                                    </label>

                                    <Input type="email" placeholder="tucorreo@gmail.com" value={formData.email}
                                        onChange={(e) => {
                                        setFormData({...formData, email: e.target.value});
                                        
                                        if(errorMsg) setErrorMsg(null);
                                        if(isSuccess) setIsSuccess(false);
                                    }}
                                    className="h-12 text-lg px-4 rounded-xl border-zinc-300 focus:ring-2 bg-background" 
                                    />
                                </div>

                                {/* ALERTAS */}
                                    {errorMsg && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full border border-red-600 flex items-center justify-center text-[10px] font-bold">
                                        !
                                        </div>
                                        <span className="text-sm font-semibold">{errorMsg}</span>
                                    </div>
                                    )}

                                    {isSuccess && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full border border-emerald-600 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        </div>
                                        <span className="text-sm font-semibold">Enlace enviado correctamente</span>
                                    </div>
                                    )}
                                
                                </div>
                            </div>

                            {/* Footer */}
                            <DialogFooter className="flex flex-col items-center gap-2 p-6 bg-zinc-50/80 border-t border-zinc-200 sm:flex-col">
                                <Button 
                                type="button" 
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                                className="h-10 w-[85%] text-sm font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-zinc-700 transition-all duration-300 rounded-lg shadow-sm"
                                >
                                {isLoading ? "Enviando..." : "Enviar correo"}
                                </Button>

                                <DialogClose asChild>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => {
                                        
                                        setErrorMsg(null);
                                        setIsSuccess(false);
                                    }}
                                    className="h-10 w-[85%] text-sm font-semibold cursor-pointer text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg"
                                >
                                    Cancelar
                                </Button>
                                </DialogClose>
                            </DialogFooter>
                            </DialogContent>
                    </Dialog>
                    </div>
                </div>
                </div>

                {/* Iniciar Sesión */}
                <Button disabled={isLoading}
                className={`mt-6 h-12 w-full text-lg font-semibold transition-all duration-500 ease-out bg-primary text-primary-foreground shadow-sm
                    hover:bg-zinc-700 hover:shadow-md active:scale-[0.98]
                    ${isFormInvalid ? "cursor-not-allowed opacity-90" : "cursor-pointer"} 
                    disabled:cursor-wait`}
                >
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    <span>Iniciando sesión...</span>
                    </>
                ) : (
                    <span>Entrar</span>
                )}
                </Button>

                {/* Registro */}
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