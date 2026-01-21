# ITM Calibraciones - Project Structure

This project follows a **Modular Architecture** to ensure scalability and maintainability.

## Directory Structure

```
src/
├── api/                # Global API configuration (axios instance)
├── assets/             # Global static assets (images, fonts)
├── components/         # Shared/Uncategorized components
│   ├── layout/         # Layout components (ProtectedRoutes, etc.)
│   └── ui/             # Reusable UI components (Buttons, Inputs, etc.)
├── hooks/              # Global custom hooks
├── layout/             # Main application layout (Sidebar, Topbar, MainLayout)
├── modules/            # Domain-specific modules
│   ├── auth/           # Authentication Module (Login, Register, Types, API)
│   ├── dashboard/      # Dashboard Module
│   ├── service-orders/ # Service Orders Module
│   └── ...             # Future modules (clients, inventory, etc.)
├── router/             # Application Routing configuration
├── store/              # Global State Management (Zustand)
├── theme/              # Material UI Theme configuration
└── utils/              # Global utility functions
```

## Module Structure

Each folder inside `modules/` should follow this structure:

```
module-name/
├── api/          # API calls specific to this module
├── components/   # Components specific to this module
├── hooks/        # Hooks specific to this module
├── pages/        # Page components (routes point here)
└── types/        # TypeScript interfaces/types for this module
```

## Key Technologies

- **React + TypeScript**
- **Material UI v5** (Theme & Components)
- **Zustand** (State Management)
- **React Query** (Server State / API Caching)
- **React Router DOM** (Routing)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
