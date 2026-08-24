# ⚡ NetStro — Dashboard Profesional de Gestión de Tareas

<div align="center">

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Una aplicación web moderna, rápida y práctica para la gestión eficiente de tareas en tiempo real.**

[Capturas](#-capturas-de-pantalla) • [Características](#-características) • [Estructura del Proyecto](#-estructura-del-proyecto) • [Requisitos Previos](#-requisitos-previos) • [Instalación](#-instalación-y-ejecución) • [API REST](#-endpoints-de-la-api)

</div>

---

## 📸 Capturas de Pantalla

<div align="center">
  <img src="https://res.cloudinary.com/dvlv4drg2/image/upload/v1787527315/f42fccb4-9b3d-4377-a5f4-dcf1a13f149c_xobqas.png" alt="NetStro Task Manager Dashboard" width="850" />
</div>

---

## 🚀 Características

- **🎨 Diseño Limpio Blanco + Verde Manzana**: Interfaz moderna, clara y pulida con tipografía *Plus Jakarta Sans* y *Outfit*.
- **📊 Panel de Métricas en Vivo**: Resumen automático del total de tareas, pendientes, completadas y una barra interactiva de porcentaje de avance.
- **🔍 Buscador en Tiempo Real**: Filtrado de tareas al instante por título o descripción mientras escribes.
- **🏷️ Filtros por Estado**: Pestañas dedicadas para explorar *Todas*, *Pendientes* y *Completadas*.
- **⚡ Acciones 1-Clic**: Marca o desmarca tareas como completadas al instante con checkboxes reactivos.
- **✍️ Modal Flotante de Creación / Edición**: Formulario ligero para agregar nuevas tareas o editar existentes sin perder tu flujo de trabajo.
- **🕒 Zona Horaria Colombia (COT / UTC-5)**: Registro y visualización precisa de fechas y horas locales.
- **💾 Persistencia con SQLite**: Base de datos ligera mediante Entity Framework Core en .NET.

---

## 📁 Estructura del Proyecto

El repositorio está organizado como un **Monorepo** compuesto por el frontend en Astro y el backend en .NET Core C#:

```text
NetStro/
├── back/                      # BACKEND (.NET 10 Core Web API)
│   ├── Controllers/
│   │   └── TasksController.cs # Endpoints REST (GET, POST, PUT, DELETE)
│   ├── Data/
│   │   └── AppDbContext.cs    # Configuración de EF Core y DbContext SQLite
│   ├── Models/
│   │   └── TaskItem.cs        # Modelo C# de Tarea (Id, Title, Description, IsCompleted, CreatedAt)
│   ├── Properties/
│   │   └── launchSettings.json# Configuración del servidor (Puerto 5000)
│   ├── Program.cs             # Registro de servicios, CORS y migración de BD
│   ├── tasks.db               # Base de datos SQLite
│   └── back.csproj            # Proyecto .NET
│
└── front/                     # FRONTEND (Astro 5 + TypeScript + CSS)
    ├── src/
    │   ├── components/        # Componentes UI Modulares
    │   │   ├── Header.astro   # Logotipo, Badge API y Botón "+ Nueva Tarea"
    │   │   ├── Metrics.astro  # Tarjetas de Estadísticas y Barra de Progreso
    │   │   ├── Controls.astro # Buscador y Pestañas de Filtro
    │   │   ├── TaskModal.astro# Modal Flotante de Creación/Edición
    │   │   └── Footer.astro   # Pie de página
    │   ├── styles/            # Hojas de estilo CSS independientes
    │   │   ├── global.css     # Variables CSS, reset y fuentes
    │   │   ├── dashboard.css  # Estilos del Dashboard, tarjetas y buscador
    │   │   └── modal.css      # Estilos del Modal flotante
    │   ├── scripts/           # Lógica JavaScript / TypeScript del Cliente
    │   │   ├── dashboard.ts   # Eventos DOM, renderizado dinámico y lógica CRUD
    │   │   └── utils.ts       # Formato de fechas (es-CO) y Toasts
    │   ├── services/          # Capa HTTP API REST
    │   │   └── api.ts         # Integración fetch con el Backend
    │   ├── layouts/           # Plantilla base HTML
    │   │   └── Layout.astro
    │   └── pages/             # Enrutamiento de Astro
    │       └── index.astro    # Composición limpia (~40 líneas)
    ├── package.json
    └── astro.config.mjs
```

---

## 📋 Requisitos Previos

Asegúrate de tener instalado el siguiente software antes de comenzar:

- [Node.js](https://nodejs.org/) (versión 18.0 o superior)
- [.NET SDK](https://dotnet.microsoft.com/download) (versión 8.0 o 10.0)
- Git

---

## 🛠️ Instalación y Ejecución

Sigue estos sencillos pasos para poner en marcha el proyecto en tu máquina local.

### 1. Clonar el repositorio
```bash
git clone https://github.com/Esteban-Lucas-Hernandez/NetStro.git
cd NetStro
```

### 2. Iniciar el Backend (.NET)
En una ventana de terminal, dirígete a la carpeta `back` e inicia el servidor API:

```bash
cd back
dotnet run
```
> El backend se compilará automáticamente y se ejecutará en **`http://localhost:5000`**. La base de datos SQLite `tasks.db` se creará automáticamente en la primera ejecución.

### 3. Iniciar el Frontend (Astro)
Abre una **segunda ventana de terminal**, dirígete a la carpeta `front` e instala las dependencias:

```bash
cd front
npm install
npm run dev
```
> El servidor de desarrollo de Astro se ejecutará en **`http://localhost:4321`**.

---

## 🔌 Endpoints de la API REST

| Método | Endpoint | Descripción | Body / Respuesta |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Obtener todas las tareas | Retorna un arreglo de `TaskItem[]` |
| **GET** | `/api/tasks/{id}` | Obtener una tarea por su ID | Retorna el objeto `TaskItem` |
| **POST** | `/api/tasks` | Crear una nueva tarea | Body: `{ "title": "...", "description": "..." }` |
| **PUT** | `/api/tasks/{id}` | Actualizar una tarea existente | Body: `{ "id": 1, "title": "...", "description": "...", "isCompleted": true }` |
| **DELETE** | `/api/tasks/{id}` | Eliminar una tarea por ID | Retorna estado 204 No Content |

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Astro, TypeScript, HTML5, CSS3 Vanilla.
- **Backend**: .NET Core Web API (C#).
- **Base de Datos**: SQLite con Entity Framework Core.
- **Tipografía**: Google Fonts (*Plus Jakarta Sans* y *Outfit*).

---

## 📜 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
