import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../ui/input";
import { Eye, EyeOff, Ban, Loader2  } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

import { type ChangeEvent, type FormEvent } from "react";
import { supabase } from "../../database/supabase/client";

export default function SignUpForm() {
    const navigate = useNavigate();
    // Validaciones
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState(0);
    
    // Estados para los checkbox legales
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Validación del boton registrarse
    const isFormInvalid = !acceptedTerms || !acceptedPrivacy;
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
    });

    // Función para calcular la fuerza
    const calculateStrength = (password: string) => {
        let score = 0;
        if (password.length > 5) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9!@#$%^&*]/.test(password)) score++;
        setPasswordStrength(score);
    };

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        if (name === "password") calculateStrength(value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // 1. Validación de campos obligatorios (Si están vacíos tras quitar espacios)
        if (
            !formData.username.trim() || 
            !formData.email.trim() || 
            !formData.confirmEmail.trim() || 
            !formData.password.trim() || 
            !formData.confirmPassword.trim()
        ) {
            toast.error("Por favor, rellena todos los campos del formulario");
            return;
        }
        
        // 2. Validación de correos
        if (formData.email.trim() !== formData.confirmEmail.trim()) {
            toast.error("Los correos electrónicos no coinciden");
            return;
        }

        // 3. Validación de contraseñas
        if (formData.password.trim() !== formData.confirmPassword.trim()) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        // 4. Validación de términos legales
        if (!acceptedPrivacy || !acceptedTerms) {
            toast.error("Debes aceptar los términos y condiciones para continuar");
            return;
        }

        // Si pasa todas las aduanas, entonces cargamos
        setIsLoading(true);
        console.log("Iniciando registro en Supabase para:", formData.email);
        
        // CONEXIÓN REAL A SUPABASE 
        try {
            const { data, error } = await supabase.auth.signUp({
                // Añadimos .trim() aquí para limpiar espacios invisibles
                email: formData.email.trim(), 
                password: formData.password.trim(),
                options: {
                    data: {
                        // Limpiamos también el nombre de usuario por si acaso
                        username: formData.username.trim(), 
                    }
                }
            });

            if (error) {
                // Mensajes de error amigables
                if (error.message.includes("already registered") || error.message.includes("already exists")) {
                    toast.error("Este correo ya está registrado.");
                } else {
                    toast.error("Error al registrar: " + error.message);
                }
                return; 
            }

            // Éxito
            toast.success("¡Cuenta creada con éxito!");
            console.log("Usuario creado en DB:", data.user);
            
            navigate("/login");

        } catch (err) {
            console.error("Error inesperado:", err);
            toast.error("Ocurrió un error inesperado de conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`w-full space-y-5 animate-in fade-in duration-500 `}>
            
            {/* FORMULARIO */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Usuario <span className="text-red-500">*</span></label>
                <Input name="username" placeholder="Nombre de usuario" value={formData.username} onChange={handleChange}/>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Correo electrónico <span className="text-red-500">*</span></label>
                <Input type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar correo <span className="text-red-500">*</span></label>
                <Input type="email" name="confirmEmail" placeholder="correo@ejemplo.com" value={formData.confirmEmail} onChange={handleChange} />
            </div>

            {/* Contraseñas */}
            <div className="space-y-5"> 
                <div className="space-y-2">
                    <label className="text-sm font-medium">Contraseña <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} name="password" placeholder="Julia12+" value={formData.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-700">
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Mínimo 8 caracteres, una mayúscula, un número y un símbolo (ej: !, @, #, $).
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar contraseña <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={handleChange} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-700">
                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Mínimo 8 caracteres, una mayúscula, un número y un símbolo (ej: !, @, #, $).
                    </p>
                </div>
            </div>

            <div className="flex gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${ passwordStrength > i 
                            ? (passwordStrength === 1 ? "bg-red-500" : passwordStrength === 2 ? "bg-amber-500" : "bg-emerald-500") 
                            : "bg-muted"
                        }`}
                    />
                ))}
            </div>

            {/* CHECKBOXES LEGALES */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                        Acepto los <Link to="/terms" className="underline hover:text-primary font-medium text-foreground">Términos y Condiciones de uso</Link>.
                    </label>
                </div>

                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="privacy" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} />
                    <label htmlFor="privacy" className="text-sm text-muted-foreground">
                        Acepto la <Link to="/privacy" className="underline hover:text-primary font-medium text-foreground">Política de privacidad y tratamiento de datos</Link>.
                    </label>
                </div>
                
            </div>

            
            <Button disabled={isLoading}
                className={`w-full h-12 text-lg font-semibold transition-all flex items-center justify-center gap-2 
                        bg-primary hover:bg-primary/90 
                        ${isFormInvalid ? "cursor-not-allowed opacity-90" : "cursor-pointer"} 
                        disabled:cursor-wait`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Registrando...</span>
                    </>
                ) : (
                    <>
                        {/* Si no es válido, mostramos el icono de prohibido */}
                        <span>Registrarse</span>
                    </>
                )}
            </Button>

            <Button variant="outline" asChild className="w-full h-12 text-lg font-semibold border-primary text-primary hover:bg-primary/5 hover:text-primary transition-all duration-300">
                    <Link to="/login">
                        Ya tengo cuenta
                    </Link>
                </Button>

        </form>
    );
}