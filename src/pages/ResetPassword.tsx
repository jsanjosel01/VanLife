import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/database/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "" 
  });

  // VALIDACIONES DE CONTRASEÑA
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>+]/.test(formData.password); 
  const hasMinLength = formData.password.length >= 8;

  const isFormValid = hasUpperCase && hasNumber && hasSymbol && hasMinLength;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("La contraseña no cumple los requisitos.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.password });
      if (error) throw error;

      toast.success("¡Contraseña actualizada correctamente!");
      
      // Al terminar con éxito, limpiamos y redirigimos
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Error inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-background pt-12 pb-40 px-4">

      <form onSubmit={handleUpdate} className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Nueva contraseña</h1>
          <p className="text-lg text-muted-foreground">Establece tu nueva clave de acceso</p>
        </div>

        <div className="space-y-6">
          {/* Nueva contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nueva contraseña <span className="text-red-500">*</span></label>
            <div className="relative">
            <Input 
                className="h-12 text-lg pr-16"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-10 top-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <p className="mt-2 text-xs text-muted-foreground">
                Mínimo 8 caracteres, una mayúscula, un número y un símbolo (ej: !, @, #, $).
            </p>
            </div>
          </div>

          <Button disabled={loading || !isFormValid} className={`h-12 w-full text-lg font-semibold transition-all duration-300 rounded-xl ${isFormValid ? "bg-primary text-white" : "bg-zinc-200 text-zinc-400 cursor-pointer"}`}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar nueva contraseña"}
          </Button>
        </div>
      </form>
    </div>
  );
}