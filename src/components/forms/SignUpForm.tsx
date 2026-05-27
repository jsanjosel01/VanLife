import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../ui/input";
import { Eye, EyeOff, Loader2  } from "lucide-react";
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
        username: "",
        email: "",
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

        // 1. Validación de campos obligatorios REALES (Solo los 4 que se ven en tu pantalla)
        if (
            !formData.username.trim() || 
            !formData.email.trim() || 
            !formData.password.trim() || 
            !formData.confirmPassword.trim()
        ) {
            toast.error("Por favor, rellena todos los campos del formulario");
            return;
        }
        
        // 1.5. Filtro antibugs para el username (frena la 'ñ', acentos y espacios)
        const regexUsernameValido = /^[a-zA-Z0-9_-]+$/;
        if (!regexUsernameValido.test(formData.username.trim())) {
            toast.error("El nombre de usuario no puede contener la 'ñ', acentos, espacios ni caracteres especiales");
            return;
        }

        // 2. Validación de correos
        // if (formData.email.trim() !== formData.confirmEmail.trim()) {
        //     toast.error("Los correos electrónicos no coinciden");
        //     return;
        // }

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

        // Si pasa las aduanas, activamos el estado de carga
        setIsLoading(true);
        console.log("Iniciando registro en Supabase para:", formData.email);
        
        // CONEXIÓN REAL A SUPABASE
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email.trim(), 
                password: formData.password.trim(),
                options: {
                    data: {
                        // Enviamos solo el username, que es tu campo real
                        username: formData.username.trim()
                    }
                }
            });

            if (error) {
                if (error.message.includes("already registered") || error.message.includes("already exists")) {
                    toast.error("Este correo ya está registrado.");
                } else {
                    toast.error("Error al registrar: " + error.message);
                }
                return; 
            }

            // Éxito total
            toast.success("¡Cuenta creada con éxito!");
            console.log("Usuario creado ", data.user);
            
            navigate("/login");

        } catch (err) {
            console.error("Error inesperado en el formulario:", err);
            toast.error("Ocurrió un error inesperado al procesar los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center bg-background pt-10 pb-40 px-4">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-sm">
            
            {/* Cabecera */}
            <div className="mb-6 space-y-2 text-center">
                <h2 className="text-4xl font-bold tracking-tight text-primary">Crea una cuenta</h2>
                <p className="text-lg text-muted-foreground">Únete para empezar a viajar</p>
            </div>

            <div className="space-y-5">

            {/* FORMULARIO */}
            <div className="space-y-2">
                <div className="flex items-center">
                <label className="text-sm font-medium text-foreground">Usuario <span className="text-red-500">*</span></label>
                </div>
                <Input className="h-12 text-lg"  name="username" placeholder="Nombre de usuario" value={formData.username} onChange={handleChange}/>
            </div>

            <div className="space-y-2">
                <div className="flex items-center">
                    <label className="text-sm font-medium text-foreground">Correo electrónico <span className="text-red-500">*</span></label>
                </div>      
                <Input className="h-12 text-lg" type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
            </div>


            {/* Contraseñas */}
            <div className="space-y-5"> 
                <div className="space-y-2">
                    <div className="flex items-center">
                    <label className="text-sm font-medium text-foreground">Contraseña <span className="text-red-500">*</span></label></div>
                    <div className="relative">
                        <Input className="h-12 text-lg"  type={showPassword ? "text" : "password"} name="password" placeholder="Ej: Contra1+" value={formData.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Mínimo 8 caracteres, una mayúscula, un número y un símbolo (ej: !, @, #, $).
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                    <label className="text-sm font-medium text-foreground">Confirmar contraseña <span className="text-red-500">*</span></label></div>
                    
                    <div className="relative">
                    <Input className="h-12 text-lg pr-12" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={handleChange} />
    
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
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

            </div>

            {/* CHECKBOXES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                    checked={acceptedTerms} 
                    onChange={(e) => setAcceptedTerms(e.target.checked)} 
                  /> 
                </div>
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Acepto los <Link to="/terms" className="underline hover:text-primary font-medium text-foreground">Términos y Condiciones de uso</Link>.
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="privacy" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                    checked={acceptedPrivacy} 
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)} 
                  />
                </div>
                <label htmlFor="privacy" className="text-sm text-muted-foreground">
                  Acepto la <Link to="/privacy" className="underline hover:text-primary font-medium text-foreground">Política de privacidad y tratamiento de datos</Link>.
                </label>
              </div>
            </div>

            
            <Button 
            type="submit"
            disabled={isLoading}
                className={`w-full h-12 text-lg font-semibold transition-all flex items-center justify-center gap-2 mt-8
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

            <Button variant="outline" asChild className="w-full h-12 text-lg font-semibold border-primary text-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 mt-2">
                    <Link to="/login">
                        Ya tengo cuenta
                    </Link>
                </Button>

        </form>
        </div>
        
    );
}