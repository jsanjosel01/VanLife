import { Map, Star, Users } from 'lucide-react';


const features = [
  {
    title: 'Mapa Interactivo',
    description: 'Encuentra puntos de pernocta, áreas de servicio y parkings en tiempo real en cualquier parte.',
    icon: <Map className="w-8 h-8 text-white" />,
    // Asegúrate de tener estas imágenes en public/img/
    image: 'img/mapaf.jpg', 
  },
  {
    title: 'Comunidad Activa',
    description: 'Lee opiniones actualizadas sobre la seguridad y los servicios de cada lugar gracias a otros viajeros.',
    icon: <Users className="w-8 h-8 text-white" />,
    image: 'img/van6.jpg',
  },
  {
    title: 'Guarda tus Rutas',
    description: 'Añade lugares a tus favoritos y organiza tus próximos viajes en furgoneta sin perder detalle.',
    icon: <Star className="w-8 h-8 text-white" />,
    image: 'img/van7.jpg',
  },
];

export const Features = () => {
  return (
    <section className="pt-24 pb-60 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-950 sm:text-5xl tracking-tighter">
            Todo lo que necesitas para tu viaje
          </h2>
          <p className="mt-5 max-w-2xl text-xl text-gray-600 mx-auto leading-relaxed">
            VanLife está diseñado para hacer tu vida camper mucho más fácil, segura y conectada.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="relative group overflow-hidden rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[480px]"
              >
                {/* Imagen de Fondo */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />

                {/* Capa de Oscurecimiento */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Contenido */}
                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                  
                  {/* Estilo */}
                  <div className="absolute top-8 left-8">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Texto */}
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base text-gray-200 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* <button className="mt-8 self-start bg-white text-gray-950 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 shadow-md">
                    Saber más
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};