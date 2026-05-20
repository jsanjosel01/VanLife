# 🚐 **VANLIFE**
### *Autonomía total en ruta: Localizador de servicios para tu estilo de vida camper*

---

## 🌍 **Descripción General**
**VANLIFE** es una aplicación web desarrollada para el ciclo de **Desarrollo de Aplicaciones Web (DAW)**. 
Es una herramienta de asistencia diseñada para dotar de autonomía a la comunidad camper, permitiendo la localización y gestión inteligente de servicios esenciales para el viajero.

---

### 🎯 **Objetivo del Proyecto**
Su objetivo es simplifica la vida sobre ruedas proporcionando un mapa interactivo con puntos de interés clave: zonas de pernocta seguras, estaciones de servicio, gasolineras, puntos de recarga de agua y parkings habilitados. Permite a los usuarios planificar rutas optimizadas, descubrir tus lugares favoritos y compartir información relevante con la comunidad."

* 🔹 **Búsqueda de puntos críticos** Localización en tiempo real de gasolineras, parkings, puntos de carga eléctrica, suministro de agua potable y zonas de gestión de residuos.
* 🔹 **Planificación** Filtrado avanzado por tipo de servicio y necesidades específicas según el vehículo.
* 🔹 **Ecosistema de datos** Integración con OpenStreetMap (vía Overpass API) para ofrecer información actualizada y fiable en cualquier lugar del mapa.

---

## 📍 **¿Qué puedes encontrar en VanLife?**
## Funcionalidades: Mapa de Servicios Camper
VanLife utiliza integración con **OpenStreetMap (vía Overpass API)** para ofrecer información en tiempo real sobre puntos de interés para el viajero. Nuestra plataforma clasifica los servicios en dos grandes bloques:

### 🚐 Lugares Principales
| Categoría | Icono | Descripción |
| :--- | :---: | :--- |
| **Área AC** | 🚐 | Puntos específicos de pernocta para autocaravanas. |
| **Camping** | 🏕️ | Espacios habilitados con servicios completos de camping. |
| **Parking** | 🅿️ | Estacionamientos aptos para vehículos de grandes dimensiones. |
| **Gasolinera** | ⛽ | Estaciones de servicio geolocalizadas. |
| **Naturaleza** | 🌲 | Parques, jardines y miradores de interés turístico. |

### 🛠️ Servicios Adicionales
Nuestra aplicación permite filtrar servicios específicos para facilitar la autonomía del usuario:
* 💧 **Agua Potable:** Puntos de recarga de agua limpia.
* 🚿 **Duchas:** Instalaciones de aseo personal.
* 🚻 **Baños / WC:** Localización de aseos públicos.
* 📶 **Wifi:** Zonas con acceso a internet.
* 🪵 **Zona de Pícnic:** Áreas recreativas al aire libre.
* 🗑️ **Basuras:** Puntos de gestión de residuos.
* 🐾 **Admite Mascotas:** Lugares Pet-friendly.
* 🏥 **Farmacias y Salud:** Servicios médicos básicos cercanos.
* 🔌 **Puntos de Carga EV:** Estaciones de recarga para vehículos eléctricos.
  
---

## 🛠️ **Tecnologías Utilizadas**
* 🔹 **FRONTEND:** React + Vite + TailwindCSS
* 🔹 **BASE DE DATOS Y AUTENTICACIÓN:** Supabase (PostgreSQL + Auth + Storage)
* 🔹 **DISEÑO:** Limpio, responsive y con componentes reutilizables.
* 🔹 **OBJETIVO:** Localización y gestioón inteligente de servicios esenciales para el viajero. 
* 🔹 **MAPAS Y DATOS**: Leaflet y OpenStreetMap (Overpass API) para geolocalización.
* 🔹 **ESTADO Y LÓGICA**: Zustand para gestión global y i18next para internacionalización.

---

## 👥 **Matriz de Roles y Permisos**
* 👤 **Invitado**	Acceso de solo lectura: Visualizar landing page, explorar mapa público y registrarse.
* 🚐 **Registrado**	Acceso Total: Crear rutas, añadir lugares a favoritos.
* 🛡️ **Admin**	Gestión: Gestión de usuarios, moderar e eliminar contenido inapropiado.

---
### 🗄️ **Estructura de Base de Datos (Supabase)**

| Tabla | Descripción |
| :--- | :--- |
| **`perfiles`** | Datos del usuario (nombre, avatar, tipo de vehículo, etc.) |
| **`sitios`** | Información de los puntos de pernocta (coordenadas, servicios, fotos) |
| **`rutas_guardadas`** | Comentarios y valoraciones de la comunidad |
| **`favoritos`** | Relación de lugares guardados por cada usuario |
| **`sitios_favoritos`** | Relación de lugares guardados por cada usuario |

---

## 💻 **Comandos Útiles**
| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **📦 Instalar dependencias** | `npm install` | Descarga todas las librerías necesarias del `package.json`. |
| **🚀 Ejecutar en desarrollo** | `npm run dev` | Lanza el servidor local (Vite) para ver los cambios en tiempo real. |
| **🏗️ Build de producción** | `npm run build` | Genera la carpeta `dist` con el código optimizado para subir a Vercel. |
| **👀 Previsualizar build** | `npm run preview` | Permite probar localmente la versión de producción ya compilada. |
| **🧩 Añadir componentes** |  `npx shadcn@latest add [nombre]`shadcn@latest | Instala nuevos componentes de la librería Shadcn. |
---

---

## 🧩 **Características Implementadas**
- 🗺️ **Navegación:** Gestión de rutas con **React Router**.
- ⚛️ **Arquitectura:** Componentes reutilizables y modulares (Navbar, Modales, Cards).
- 📱 **UI/UX:** Diseño totalmente *responsive* con Tailwind CSS, Shadcn UI.
- 🔐 **Seguridad:** Autenticación con Supabase y políticas RLS para protección de datos.
- 🛡️ **Roles:** Sistema de permisos diferenciados para Invitados, Usuarios y Administradores.
- 📍 **Mapas:** Integración de Leaflet para la visualización de puntos de pernocta en tiempo real.
-  Filtrado inteligente de puntos de interés (Pernocta, Gasolineras, Puntos de Agua, Parkings).
-  ⚙️ **Gestión de Perfil**: Personalización según el tipo de vehículo para adaptar las rutas o recomendaciones.
-  🌍 **I18n** (Internacionalización): Adaptado a varios idiomas.
---

## 👨🏼‍🏫 **Tutorías**
**TUTOR:** David Elías Martín Nevado

> **NOTA DE SEGUIMIENTO:** Cada sesión siguió la estructura de resumen de avances, demo funcional, bloqueo de riesgos y tareas semanales.

---

### 📅 **Resumen de hilos CRONOGRAMA**

#### **ABRIL: INICIO Y CONCEPTO**
* **08-ABRIL** | 🏁 Presentación del proyecto y definición de objetivos (VanLife).
* **29-ABRIL** | 🏗️ Arquitectura: Diseño de base de datos en Supabase y configuración del entorno de desarrollo (Vite + Tailwind + Shadcn)
*              

---

#### **MAYO: DISEÑO Y ESTRUCTURA**
* **13-MAYO** | 🔐 Core del sistema: Implementación de Autenticación (Login/Registro/JWT) y protección de rutas.
*             | 🗺️ Funcionalidad principal: Integración de Mapas (Leaflet) con OpenStreetMap y lógica de filtrado de servicios.
       
* **27-MAYO** | 🚀 Finalización: Pruebas de integración, despliegue en producción (Vercel) y revisión de documentación.
*             

---

#### **JUNIO: FINALIZACIÓN Y PRESENTACIÓN
01-JUNIO | ✅ Presentación final del TFG ante el tribunal.

---

## 👤 **Autoría del proyecto**

* 🖋️ **AUTORA:** Julia San José León
* 🎓 **ESTUDIOS:** Desarrollo de Aplicaciones Web (**DAW**)
* 🏫 **CENTRO:** IES Albarregas, Mérida
* 📅 **AÑO:** 2026
* 👨🏼‍🏫 **TUTOR:** David Elías Martín Nevado

---

> **PROYECTO FINAL DE CICLO (TFG):** Este aplicativo ha sido desarrollado como proyecto de fin de grado, cumpliendo con los estándares de diseño, desarrollo y despliegue exigidos por el equipo docente.
