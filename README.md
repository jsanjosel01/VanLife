# 🚐 **PERNOCVAN**
### *Planificación de rutas y pernoctar para la comunidad camper*

🚐 PernocVan
Proyecto Final de Ciclo: Desarrollo de Aplicaciones Web (DAW)

PernocVan es una aplicación web diseñada para la comunidad camper. Su objetivo principal es facilitar la planificación de rutas, el descubrimiento de lugares seguros para pernoctar y fomentar el intercambio de experiencias entre usuarios que comparten la pasión por la vida sobre ruedas.

---

## 🌍 **Descripción General**
**PERNOCVAN** es una aplicación web desarrollada para el ciclo de **Desarrollo de Aplicaciones Web**. Permite a cada usuario/a facilitar la planificación de rutas, el descubrimiento de nuevos lugares donde dormir y el intercambio de información entre usuarios.

---

## 🛠️ **Tecnologías Utilizadas**
* 🔹 **FRONTEND:** React + Vite + TailwindCSS
* 🔹 **BASE DE DATOS Y AUTENTICACIÓN:** Supabase (PostgreSQL + Auth + Storage)
* 🔹 **DISEÑO:** Limpio, responsive y con componentes reutilizables.
* 🔹 **OBJETIVO:** Gestionar planes de rutas y lugares seguros para pernoctar.

---

## 👥 **Matriz de Roles y Permisos**
* 👤 **Invitado**	Acceso de solo lectura: Visualizar landing page, explorar mapa público y registrarse.
* 🚐 **Registrado**	Acceso Total: Crear rutas, añadir lugares de pernocta, subir fotos, comentar y favoritos.
* 🛡️ **Admin**	Gestión: Moderar comentarios, eliminar contenido inapropiado y gestionar usuarios.

---
### 🗄️ **Estructura de Base de Datos (Supabase)**

| Tabla | Descripción |
| :--- | :--- |
| **`profiles`** | Datos del usuario (nombre, avatar, tipo de vehículo, etc.) |
| **`places`** | Información de los puntos de pernocta (coordenadas, servicios, fotos) |
| **`reviews`** | Comentarios y valoraciones de la comunidad |
| **`favorites`** | Relación de lugares guardados por cada usuario |

---

## 💻 **Comandos Útiles**
| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **📦 Instalar dependencias** | `npm install` | Descarga todas las librerías necesarias del `package.json`. |
| **🚀 Ejecutar en desarrollo** | `npm run dev` | Lanza el servidor local (Vite) para ver los cambios en tiempo real. |
| **🏗️ Build de producción** | `npm run build` | Genera la carpeta `dist` con el código optimizado para subir a Vercel. |
| **👀 Previsualizar build** | `npm run preview` | Permite probar localmente la versión de producción ya compilada. |

---

## 🧩 **Características Implementadas**
- 🗺️ **Navegación:** Gestión de rutas con **React Router**.
- ⚛️ **Arquitectura:** Componentes reutilizables y modulares (Navbar, Modales, Cards).
- 📱 **UI/UX:** Diseño totalmente *responsive* con Tailwind CSS y soporte para modo oscuro.
- 🔐 **Seguridad:** Autenticación con Supabase y políticas RLS para protección de datos.
- 🛡️ **Roles:** Sistema de permisos diferenciados para Invitados, Usuarios y Administradores.
- 📍 **Mapas:** Integración de Leaflet para la visualización de puntos de pernocta en tiempo real.
---

## 👨🏼‍🏫 **Tutorías**
**TUTOR:** David Elías Martín Nevado

> **NOTA DE SEGUIMIENTO:** Cada sesión siguió la estructura de resumen de avances, demo funcional, bloqueo de riesgos y tareas semanales.

---

### 📅 **Resumen de hilos CRONOGRAMA**

#### **ABRIL: INICIO Y CONCEPTO**
* **08-ABRIL** | 🏁 PRESENTACIÓN DE ASIGNATURA Y PROYECTO.
* **29-ABRIL** | ..

---

#### **MAYO: DISEÑO Y ESTRUCTURA**
* **13-MAYO** | ..
* **27-MAYO** | ..


---

## 👤 **Autoría del proyecto**

* 🖋️ **AUTORA:** Julia San José León
* 🎓 **ESTUDIOS:** Desarrollo de Aplicaciones Web (**DAW**)
* 🏫 **CENTRO:** IES Albarregas, Mérida
* 📅 **AÑO:** 2026
* 👨🏼‍🏫 **TUTOR:** David Elías Martín Nevado

---

> **PROYECTO FINAL DE CICLO (TFG):** Este aplicativo ha sido desarrollado como proyecto de fin de grado, cumpliendo con los estándares de diseño, desarrollo y despliegue exigidos por el equipo docente.
