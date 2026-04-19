import { useState } from 'react';
import { userRepository } from '../../database/repositories';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Aquí llamamos a nuestra capa de repositorio
    const { data, error: authError } = await userRepository.login(email, password);

    if (authError) {
      setError(authError.message || "Error al iniciar sesión");
    } else if (data) {
      console.log("Usuario logueado:", data);
      // Aquí podrías redirigir al usuario o actualizar tu store global
      window.location.href = '/dashboard'; 
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-bold">Iniciar Sesión</h2>
      
      <div>
        <label className="block">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="border p-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block">Contraseña</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="border p-2 w-full"
          required
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-500 text-white p-2 w-full rounded"
      >
        {loading ? 'Cargando...' : 'Entrar'}
      </button>
    </form>
  );
};