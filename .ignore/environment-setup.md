# Configuración de Variables de Entorno - AMFE Tool

Esta guía describe cómo configurar las variables de entorno para la aplicación AMFE Tool en diferentes entornos.

## 📋 Resumen de Configuración

La aplicación ya está **completamente configurada** con las siguientes características:

- ✅ **Conexión a Supabase** activa y funcionando
- ✅ **Autenticación** configurada con soporte para usuarios anónimos
- ✅ **Variables de entorno** completamente definidas
- ✅ **Validación automática** de configuración
- ✅ **Configuración de producción** preparada

## 🗂️ Archivos de Configuración

### Archivos Principales
- `.env.local` - Variables de desarrollo local
- `.env.example` - Plantilla para nuevos desarrolladores
- `.env.production.example` - Plantilla para producción

### Archivos de Soporte
- `src/utils/env.ts` - Validación de variables de entorno
- `src/vite-env.d.ts` - Definiciones TypeScript para variables
- `src/lib/supabase.ts` - Cliente de Supabase configurado

## 🔧 Variables de Entorno Disponibles

### Supabase (Requerido)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Aplicación
```bash
VITE_APP_NAME=AMFE Tool
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Auditoría Médica Facilitada con Evidencias
VITE_APP_URL=http://localhost:3000
VITE_APP_SUPPORT_EMAIL=support@amfe-tool.com
```

### Autenticación
```bash
VITE_DISABLE_AUTH=false              # Deshabilitar autenticación
VITE_ENABLE_ANONYMOUS_AUTH=true      # Permitir usuarios anónimos
VITE_AUTH_SESSION_TIMEOUT=3600000    # Tiempo de sesión (1 hora)
VITE_ENABLE_MAGIC_LINK=true          # Habilitar magic links
```

### Feature Flags
```bash
VITE_ENABLE_ANALYTICS=false          # Google Analytics
VITE_ENABLE_ERROR_REPORTING=false    # Reporte de errores
VITE_ENABLE_PERFORMANCE_MONITORING=false  # Monitor de rendimiento
VITE_ENABLE_DEBUG_MODE=true          # Modo debug
```

### Desarrollo
```bash
VITE_DEV_MODE=true                   # Modo desarrollo
VITE_LOG_LEVEL=debug                 # Nivel de log (error, warn, info, debug)
VITE_ENABLE_MOCK_DATA=false          # Datos de prueba
VITE_ENABLE_API_MOCKING=false        # Mock de APIs
```

### Archivos
```bash
VITE_MAX_FILE_SIZE=10485760          # Tamaño máximo (10MB)
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif
VITE_MAX_FILES_PER_UPLOAD=5
```

### Cache
```bash
VITE_ENABLE_CACHE=true               # Habilitar cache
VITE_CACHE_TTL=300000                # Tiempo de cache (5 minutos)
```

### Seguridad
```bash
VITE_ENABLE_RATE_LIMITING=true       # Rate limiting
VITE_RATE_LIMIT_REQUESTS=100         # Límite de requests
VITE_RATE_LIMIT_WINDOW=900000        # Ventana de tiempo (15 minutos)
```

## 🚀 Configuración Rápida

### Para Desarrollo
1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd amfe-tool
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example apps/web/.env.local
   # Editar apps/web/.env.local con tus credenciales de Supabase
   ```

4. **Iniciar aplicación**
   ```bash
   pnpm dev
   ```

### Para Producción
1. **Crear archivo de producción**
   ```bash
   cp apps/web/.env.production.example apps/web/.env.production
   ```

2. **Configurar variables de producción**
   ```bash
   # Editar apps/web/.env.production con valores reales
   VITE_SUPABASE_URL=https://your-production-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   VITE_APP_URL=https://your-domain.com
   ```

3. **Construir aplicación**
   ```bash
   pnpm build
   ```

## 🔐 Obtener Credenciales de Supabase

1. **Crear cuenta en [Supabase](https://supabase.com)**
2. **Crear nuevo proyecto**
3. **Obtener URL y API Key**:
   - Ir a Settings → API
   - Copiar Project URL
   - Copiar anon/public key

4. **Configurar en `.env.local`**:
   ```bash
   VITE_SUPABASE_URL=tu-project-url
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

## ✅ Validación Automática

La aplicación incluye validación automática de variables de entorno:

- **Verifica variables requeridas** al iniciar
- **Valida formatos** (URLs, emails, JWT)
- **Muestra errores detallados** en desarrollo
- **Previene despliegues** con configuración incorrecta

### Mensajes de Error Comunes

```bash
❌ Missing required environment variable: VITE_SUPABASE_URL
❌ Invalid format for environment variable: VITE_SUPABASE_ANON_KEY
❌ Production deployment detected with placeholder Supabase URL
```

## 🛠️ Configuración Avanzada

### Base de Datos
La aplicación utiliza las siguientes tablas en Supabase:

- `user_profiles` - Perfiles de usuario
- `failure_modes` - Modos de fallo
- `amfes` - Análisis AMFE
- `amfe_items` - Ítems de análisis
- `corrective_actions` - Acciones correctivas
- `evidence` - Evidencias adjuntas

### Políticas de Seguridad
- **Row Level Security (RLS)** habilitado
- **Acceso anónimo** configurado
- **Sesiones persistentes** con refresh automático
- **PKCE flow** para autenticación segura

## 📊 Monitoreo y Debug

### Modo Debug
```bash
VITE_ENABLE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Analytics en Producción
```bash
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## 🚨 Importante

1. **Nunca commitear** archivos `.env.local` o `.env.production`
2. **Usar valores reales** en producción (no placeholders)
3. **Configurar RLS** correctamente en Supabase
4. **Rotar claves** periódicamente
5. **Monitorear** el uso y errores en producción

## 🆘 Soporte

Si tienes problemas con la configuración:

1. **Verificar la consola** del navegador para errores
2. **Revisar variables de entorno** con el componente de prueba
3. **Acceder a** `http://localhost:3000/test-connection`
4. **Consultar logs** de Supabase en el dashboard

---

## ✅ Estado Actual de la Configuración

**Tu aplicación está completamente configurada y funcionando:**

- ✅ Servidor corriendo en `http://localhost:3000`
- ✅ Conexión a Supabase establecida
- ✅ Autenticación configurada
- ✅ Variables de entorno definidas
- ✅ Validación automática activa
- ✅ Componente de prueba funcional en `/test-connection`

¡Puedes comenzar a usar la aplicación inmediatamente!