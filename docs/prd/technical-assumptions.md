# Technical Assumptions

## Repository Structure: Monorepo

Utilizaremos monorepo con frontend y backend en el mismo repositorio para simplicidad de desarrollo y despliegue. Estructura clara con directorios separados para frontend (React), backend (functions de Supabase Edge Functions si necesarias), y documentación compartida.

## Service Architecture

**Arquitectura Serverless con Supabase como plataforma principal:**
- **Frontend**: React.js + TypeScript deployado en Vercel
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **Edge Functions**: Supabase Edge Functions para lógica de servidor cuando necesite
- **File Storage**: Supabase Storage para archivos adjuntos de evidencias
- **Real-time**: Supabase Realtime para sincronización automática

## Testing Requirements

**Unit + Integration**: Testing completo con Jest + React Testing Library para componentes, y Cypress para end-to-end tests críticos. No se requiere testing manual intensivo debido a naturaleza automatizada de la aplicación. Focus en testing de cálculos NPR y persistencia de datos.

## Additional Technical Assumptions and Requests

**Supabase Configuration:**
- **Database**: PostgreSQL con schema optimizado para AMFEs y relaciones
- **Auth**: Autenticación opcional con email/password para backup en la nube (puede usar sin registro también)
- **Row Level Security**: Políticas para que solo dueño pueda acceder a sus AMFEs
- **Storage**: Para archivos de evidencia de acciones correctivas
- **Realtime**: Sincronización automática entre dispositivos del mismo usuario

**Frontend Stack:**
- **React 18** con TypeScript para tipado seguro
- **State Management**: Zustand o React Query para simplicidad
- **UI Framework**: Tailwind CSS + Headless UI para componentes accesibles
- **Forms**: React Hook Form con Zod para validaciones
- **Charts**: Recharts para visualización de NPRs y dashboard

**Performance & Offline:**
- **PWA**: Service Worker con Workbox para caching y offline
- **Data Sync**: Estrategia híbrida: localStorage + Supabase sync
- **Bundle Size**: Tree-shaking agresivo y lazy loading para mantener <5MB

**Deployment:**
- **Frontend**: Vercel (dominio personalizado)
- **Backend/DB**: Supabase (plan gratuito)
- **CDN**: Automático a través de Vercel Edge Network
- **CI/CD**: GitHub Actions para automatizar despliegue

**Cost Optimization:**
- **Supabase Free Tier**: Diseño optimizado para mantener uso dentro de límites gratuitos
- **Image Optimization**: Optimización automática de uploads
- **Caching Strategy**: Agresivo caching de datos estáticos y bibliotecas
- **Data Compression**: Compresión de payloads JSON
