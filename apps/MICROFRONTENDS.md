# 🧩 SIMA Microfrontends

Arquitectura de microfrontends usando **Vite + Module Federation**.

## 📦 Estructura

| App               | Puerto | Rol    | Descripción                     |
| ----------------- | ------ | ------ | ------------------------------- |
| **shell-app**     | 4100   | Host   | Container principal, navegación |
| **assets-mfe**    | 4101   | Remote | Gestión de activos fijos        |
| **dashboard-mfe** | 4102   | Remote | Dashboard con métricas          |
| **users-mfe**     | 4103   | Remote | Gestión de usuarios             |

## 🚀 Quick Start

### Instalar dependencias

```bash
# Desde cada directorio de microfrontend
cd apps/shell-app && pnpm install
cd apps/assets-mfe && pnpm install
cd apps/dashboard-mfe && pnpm install
cd apps/users-mfe && pnpm install
```

### Ejecutar microfrontends

```bash
# Terminal 1 - Primero los remotes
cd apps/assets-mfe && pnpm dev

# Terminal 2
cd apps/dashboard-mfe && pnpm dev

# Terminal 3
cd apps/users-mfe && pnpm dev

# Terminal 4 - Finalmente el host
cd apps/shell-app && pnpm dev
```

### Acceder a la aplicación

- **Shell App (Principal):** http://localhost:4100
- **Assets MFE (standalone):** http://localhost:4101
- **Dashboard MFE (standalone):** http://localhost:4102
- **Users MFE (standalone):** http://localhost:4103

## 🔧 Tecnologías

- **Vite 5** - Bundler
- **@originjs/vite-plugin-federation** - Module Federation
- **React 18** - Framework
- **TypeScript** - Tipado

## 📁 Estructura de cada MFE

```
apps/<mfe-name>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts       # Configuración de federation
└── src/
    ├── main.tsx         # Entry point
    ├── App.tsx          # Componente principal
    └── styles.css       # Estilos
```

## 🎨 Diseño

- Tema oscuro premium
- Glassmorphism effects
- Gradientes vibrantes
- Micro-animaciones
- Responsive design
