import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../database/supabase/client";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

interface AvatarUploaderProps {
    uid: string | undefined;
    url: string | null;
    onUpload: (url: string) => void;
}


export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ uid, url, onUpload }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (url) setAvatarUrl(url);
    }, [url]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!uid || !event.target.files || event.target.files.length === 0) {
                throw new Error("Debes seleccionar una imagen para subir.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${uid}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            if (!data.publicUrl) throw new Error("Error al obtener la URL pública.");

            const publicUrl = data.publicUrl;

            setAvatarUrl(publicUrl);
            onUpload(publicUrl);
            toast.success("Foto de perfil actualizada correctamente");

        } catch (error: any) {
            console.error("Error subiendo el avatar:", error);
            toast.error(`Error al subir la imagen: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative flex flex-col items-center gap-4 group">
            <div 
                className="w-24 h-24 rounded-full bg-white border-4 border-gray-100 shadow-lg overflow-hidden shrink-0 cursor-pointer transition-all hover:border-primary/50 relative"
                onClick={triggerFileSelect}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white" />
                    )}
                </div>
            </div>

            <input
                type="file"
                id="single"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
            />
            
            {uploading && <p className="text-xs text-gray-500 animate-pulse">Subiendo...</p>}
        </div>
    );
};