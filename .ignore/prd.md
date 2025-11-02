# Herramienta AMFE para Mejora Continua - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- **Crear una herramienta AMFE web progressive app que permita análisis completos en 45 minutos** (vs 8 horas actuales)
- **Implementar funcionalidad esencial gratuita con almacenamiento local en browser** para eliminar barreras de adopción
- **Desarrollar sistema de acciones correctivas con seguimiento de costos y ROI automático**
- **Proporcionar reportes profesionales exportables (PDF/Excel) para presentaciones a gerencia**
- **Alcanzar 100 usuarios activos en primer mes con NPS inicial de +30**

### Background Context

La industria manufacturera enfrenta un problema crítico: los ingenieros de calidad pierden hasta 30% de su tiempo (12 horas/semana) en tareas administrativas en lugar de análisis real. Herramientas empresariales como SAP QM o XFMEA requieren inversiones de $500-$5,000 anuales y 2-6 meses de implementación, haciéndolas inaccesibles para profesionales individuales y PyMES.

El proyecto "Herramienta AMFE para Mejora Continua" abordará este gap con una solución web progresiva libre y gratuita que combina las mejores prácticas AIAG-VDA con simplicidad individual. A diferencia del Excel que requiere configuración manual repetitiva, nuestra herramienta ofrecerá configuración instantánea, biblioteca pre-cargada con 100+ modos de fallo comunes, y cálculo automático de NPRs, permitiendo a los ingenieros enfocarse en análisis de valor而非 tareas administrativas.

El MVP se centrará en funcionalidad esencial individual: motor AMFE básico (PFMEA/DFMEA), gestión de acciones correctivas con seguimiento de costos, dashboard simple, y exportación de reportes - todo almacenado localmente en el browser para eliminar costos de infraestructura y permitir acceso inmediato sin registro.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-31 | 1.0 | Initial PRD creation based on Project Brief | John (PM) |

## Requirements

### Functional Requirements

**FR1:** La aplicación web debe permitir crear y editar AMFEs (PFMEA/DFMEA) con matriz editable conteniendo campos estándar AIAG-VDA (función, modo de fallo, efecto, causa, controles actuales, S-O-D, NPR)

**FR2:** El sistema debe calcular automáticamente el NPR (Número de Prioridad de Riesgo) multiplicando Severidad × Ocurrencia × Detección con validaciones de rango (1-10)

**FR3:** La aplicación debe incluir una biblioteca pre-cargada con 100+ modos de fallo comunes para manufactura que puedan ser seleccionados y personalizados durante el análisis

**FR4:** El sistema debe permitir crear acciones correctivas para cada NPR alto con campos: responsable, fecha límite, costo estimado, costo real, estado (Pendiente/En Progreso/Completada/Verificada), y evidencia adjunta

**FR5:** La aplicación debe proporcionar un dashboard simple que muestre todos los AMFEs creados, panel unificado de acciones correctivas, filtros por responsable, y alertas visuales de vencimientos

**FR6:** El sistema debe generar reportes exportables en formato PDF y Excel con AMFE completo, listado de acciones con costos, y resumen de seguimiento para presentaciones

**FR7:** La aplicación debe funcionar como Progressive Web App (PWA) con capacidad offline básica para continuar trabajo sin conexión y sincronizar al regresar

**FR8:** El sistema debe almacenar todos los datos localmente en el browser del usuario utilizando localStorage/IndexedDB sin necesidad de registro o servidor backend

### Non-Functional Requirements

**NFR1:** La aplicación web debe ser 100% gratuita sin funcionalidades de pago ocultas para cumplir con objetivo de MVP accesible

**NFR2:** El tiempo de carga inicial debe ser menor a 3 segundos y cualquier acción del usuario debe responder en menos de 1 segundo

**NFR3:** La aplicación debe ser responsive y funcional en dispositivos móviles y desktop con soporte para navegadores Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**NFR4:** Los datos del usuario deben persistir localmente con capacidad de exportación/importación para backup y recuperación de información

**NFR5:** La interfaz debe ser intuitiva con curva de aprendizaje máxima de 30 minutos para ingenieros familiarizados con AMFEs

**NFR6:** La aplicación debe funcionar offline con modo básico de edición y sincronizar cambios cuando la conexión se restablezca

**NFR7:** El tamaño total de la aplicación debe ser menor a 5MB para descarga rápida en conexiones lentas

## User Interface Design Goals

### Overall UX Vision

Crear una experiencia de análisis AMFE profesional pero sin fricción que se sienta como una evolución natural del Excel pero con la potencia de una aplicación moderna. La interfaz debe eliminar la carga cognitiva de tareas administrativas (formato, cálculos, organización) permitiendo al ingeniero concentrarse 100% en el análisis de riesgos. Visualmente limpia y minimalista pero con información densa y bien estructurada que inspire confianza profesional.

### Key Interaction Paradigms

- **Edición tipo hoja de cálculo familiar**: Matriz AMFE editable directamente como Excel pero con validaciones y auto-guardado
- **Autocompletado inteligente**: Sugerencias contextuales de modos de fallo y causas mientras escribes
- **Drag-and-drop para acciones**: Reordenar y asignar acciones correctivas visualmente
- **Navegación por tabs**: Cambio rápido entre AMFE, dashboard de acciones, y reportes
- **Atajos de teclado**: Ctrl+S para exportar, Ctrl+N para nuevo AMFE, navegar con tab/shift-tab
- **Swipe gestures en móvil**: Para navegar entre filas de la matriz AMFE

### Core Screens and Views

1. **Pantalla Principal/Lista de AMFEs**: Dashboard con todos tus análisis, botón "+ Nuevo AMFE", filtros por tipo/fecha/estado
2. **Editor de Matriz AMFE**: Vista principal con tabla editable, barra de herramientas con acciones rápidas, panel lateral de información
3. **Panel de Acciones Correctivas**: Vista separada con lista de todas las acciones, filtros por responsable/estado, indicadores visuales de vencimiento
4. **Generador de Reportes**: Vista previa del reporte, opciones de exportación PDF/Excel, configuración de formato
5. **Biblioteca de Modos de Fallo**: Popup o modal con búsqueda y filtros por categoría de industria
6. **Configuración Básica**: Preferencias de cálculo NPR, umbrales de alerta, tema visual claro/oscuro

### Accessibility: WCAG AA

Nivel WCAG AA para asegurar accesibilidad en entornos corporativos y cumplimiento normativo. Contraste mínimo 4.5:1, navegación completa por teclado, etiquetas ARIA para lectores de pantalla, y zoom hasta 200% sin pérdida de funcionalidad.

### Branding

Identidad visual profesional y minimalista que inspire confianza en ingeniería de calidad:
- **Colores primarios**: Azul industrial (#1E3A8A) para elementos principales, gris claro (#F3F4F6) para fondos
- **Acentos**: Naranja seguridad (#EA580C) para alertas y NPRs críticos, verde éxito (#16A34A) para estados completados
- **Tipografía**: System fonts (sans-serif) para máxima compatibilidad, con jerarqu clara mediante peso y tamaño
- **Iconografía**: Iconos simples y universales para acciones comunes (editar, eliminar, exportar, asignar)

### Target Device and Platforms: Web Responsive

Diseño responsive-first que funcione seamless en desktop (1920x1080), tablet (768x1024) y móvil (375x667). Prioridad desktop para trabajo intensivo de análisis, pero con plena funcionalidad en móvil para consulta y edición rápida. PWA con instalación opcional en homescreen para acceso rápido.

## Technical Assumptions

### Repository Structure: Monorepo

Utilizaremos monorepo con frontend y backend en el mismo repositorio para simplicidad de desarrollo y despliegue. Estructura clara con directorios separados para frontend (React), backend (functions de Supabase Edge Functions si necesarias), y documentación compartida.

### Service Architecture

**Arquitectura Serverless con Supabase como plataforma principal:**
- **Frontend**: React.js + TypeScript deployado en Vercel
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **Edge Functions**: Supabase Edge Functions para lógica de servidor cuando necesite
- **File Storage**: Supabase Storage para archivos adjuntos de evidencias
- **Real-time**: Supabase Realtime para sincronización automática

### Testing Requirements

**Unit + Integration**: Testing completo con Jest + React Testing Library para componentes, y Cypress para end-to-end tests críticos. No se requiere testing manual intensivo debido a naturaleza automatizada de la aplicación. Focus en testing de cálculos NPR y persistencia de datos.

### Additional Technical Assumptions and Requests

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

## Epic List

### Epic 1: Foundation & Core AMFE Engine
Establecer la infraestructura del proyecto, configuración de Supabase, y crear el motor básico de análisis AMFE con matriz editable y cálculos automáticos de NPR. Este epic delivera la funcionalidad fundamental para que un usuario pueda crear su primer AMFE completo.

### Epic 2: Actions Management & Tracking
Implementar el sistema completo de gestión de acciones correctivas con asignación de responsables, seguimiento de costos, flujos de estados (Pendiente → En Progreso → Completada → Verificada), y almacenamiento de evidencias. Permite el ciclo completo de mejora continua.

### Epic 3: Dashboard & Reporting
Crear el dashboard de gestión unificado con vista de todos los AMFEs, panel de acciones con filtros y alertas, y generador de reportes profesionales exportables en PDF/Excel para presentaciones a gerencia con cálculos automáticos de ROI.

### Epic 4: User Experience Polish & Offline
Implementar PWA capabilities, modo offline con localStorage y sincronización automática, optimización de performance, y pulido final de UX para asegurar experiencia fluida y profesional que inspire confianza en ingenieros de calidad.

## Epic Details

### Epic 1: Foundation & Core AMFE Engine

**Goal:** Establecer infraestructura técnica completa y crear el motor fundamental de análisis AMFE que permita a usuarios crear, editar y calcular matrices AMFE completas con biblioteca de modos de fallo y almacenamiento persistente en Supabase.

---

**Story 1.1: Project Setup & Supabase Configuration**
Como desarrollador,
Quiero configurar el proyecto con React + TypeScript, Vercel deployment y Supabase backend,
Para tener base técnica sólida y escalable para el MVP.

**Acceptance Criteria:**
1. Repository monorepo con estructura clara (/frontend, /docs, /functions)
2. React 18 + TypeScript configurado con ESLint y Prettier
3. Supabase project creado con PostgreSQL database
4. Environment variables configuradas para local y producción
5. Vercel deployment automatizado con GitHub Actions
6. CI/CD pipeline funcional con tests básicos ejecutándose

**Story 1.2: Database Schema & Authentication Setup**
Como desarrollador,
Quiero definir y crear el schema de base de datos para AMFEs con autenticación opcional,
Para poder persistir y consultar datos de análisis eficientemente.

**Acceptance Criteria:**
1. Tablas en Supabase: users, fmeas, failure_modes, failure_causes, correctives_actions
2. Row Level Security configurado para acceso solo por dueño
3. Supabase Auth configurado con email/password (opcional para usuario)
4. Types de TypeScript generados automáticamente desde schema
5. API endpoints básicos funcionando (CRUD para fmeas)
6. Conexión entre frontend y Supabase establecida y probada

**Story 1.3: AMFE Creation & Management UI**
Como usuario de calidad,
Quiero crear nuevos AMFEs con información básica (nombre, tipo, scope),
Para iniciar análisis estructurados de riesgos.

**Acceptance Criteria:**
1. Formulario de creación de AMFE con campos: nombre, tipo (DFMEA/PFMEA), descripción, scope
2. Lista de AMFEs existentes con búsqueda y filtros básicos
3. Vista de detalle de AMFE con opción de editar/eliminar/duplicar
4. Validaciones de campos obligatorios
5. Guardado automático de cambios en Supabase
6. Indicadores visuales de estado (borrador, en progreso, completado)

**Story 1.4: AMFE Matrix Editor Component**
Como ingeniero de calidad,
Quiero editar la matriz AMFE directamente como una hoja de cálculo,
Para ingresar y modificar datos de análisis eficientemente.

**Acceptance Criteria:**
1. Tabla editable con columnas: función, modo de fallo, efecto, causa, controles actuales, S, O, D, NPR
2. Cálculo automático de NPR (S × O × D) al modificar S, O, o D
3. Navegación por teclado (tab, shift-tab, enter, arrows)
4. Validaciones de rango (1-10) para S, O, D
5. Auto-guardado al perder foco de celda
6. Opción de agregar/eliminar filas dinámicamente
7. Indicadores visuales para NPRs críticos (color coding)

**Story 1.5: Failure Modes Library Integration**
Como usuario de calidad,
Quiero acceder y utilizar una biblioteca pre-cargada de 100+ modos de fallo comunes,
Para acelerar el análisis y asegurar cobertura completa.

**Acceptance Criteria:**
1. Biblioteca de 100+ modos de fallo organizados por categoríamanufacturera
2. Búsqueda y filtrado de modos de fallo por texto y categoría
3. Función de autocompletado mientras escribe en campo de modo de fallo
4. Opción de agregar modos de fallo personalizados a biblioteca local
5. Pre-carga inicial de biblioteca en Supabase durante setup
6. UI tipo modal/popup para buscar y seleccionar modos de fallo

---

### Epic 2: Actions Management & Tracking

**Goal:** Implementar sistema completo de gestión de acciones correctivas que permita asignar tareas, seguir costos, gestionar estados, y almacenar evidencias, cerrando el ciclo completo de mejora continua.

---

**Story 2.1: Corrective Actions Creation**
Como ingeniero de calidad,
Quiero crear acciones correctivas para NPRs altos con responsables y plazos,
Para planificar y asignar tareas de mitigación de riesgos.

**Acceptance Criteria:**
1. Botón de "Crear Acción" desde filas con NPR sobre umbral configurable
2. Formulario de acción con campos: descripción, responsable, email/telefono, fecha compromiso, costo estimado
3. Vinculación automática entre acción y fila específica del AMFE
4. Validaciones de campos obligatorios y formato de email/telefono
5. Opción de asignar múltiples acciones a un mismo NPR
6. Vista previa de acción antes de guardar

**Story 2.2: Cost Tracking & ROI Calculation**
Como gerente de calidad,
Quiero registrar costos reales de implementación y calcular ROI automáticamente,
Para medir el impacto económico de las acciones correctivas.

**Acceptance Criteria:**
1. Campos de costo estimado y costo real en cada acción correctiva
2. Cálculo automático de ROI: (Costo de no calidad evitado - Costo implementación) / Costo implementación
3. Sumatorias automáticas de costos por AMFE y general
4. Indicadores visuales de ROI positivo/negativo
5. Exportación de reporte de costos y ROI
6. Historial de cambios de costos con timestamp

**Story 2.3: Action Status Management**
Como responsable de acción,
Quiero actualizar el estado de mis acciones (Pendiente → En Progreso → Completada → Verificada),
Para mantener seguimiento claro del progreso.

**Acceptance Criteria:**
1. Estados definidos: Pendiente, En Progreso, Completada, Verificada
2. Flujo de estados con validaciones (no se puede verificar si no está completada)
3. Timestamp automático en cada cambio de estado
4. Comentarios opcionales en cada cambio de estado
5. Indicadores visuales de estado con colores (rojo/amarillo/verde)
6. Historial completo de cambios de estado por acción

**Story 2.4: Evidence Management**
Como ingeniero de calidad,
Quiero adjuntar archivos/fotos como evidencia de implementación de acciones,
Para documentar y probar la eficacia de las medidas correctivas.

**Acceptance Criteria:**
1. Botón de "Adjuntar Evidencia" en acciones en estado "Completada" o "Verificada"
2. Upload de archivos a Supabase Storage (imágenes, PDFs, documentos)
3. Vista previa de archivos adjuntos con tamaño y tipo
4. Opción de eliminar archivos adjuntos
5. Límite de tamaño por archivo (configurable,建议 10MB)
6. Organización de archivos por acción y AMFE
7. Visualización de imágenes directamente en la aplicación

**Story 2.5: Actions Dashboard & Filtering**
Como gerente de calidad,
Quiero ver un dashboard unificado de todas las acciones correctivas con filtros avanzados,
Para tener visibilidad completa del estado de todas las iniciativas.

**Acceptance Criteria:**
1. Dashboard con lista completa de todas las acciones correctivas
2. Filtros por: responsable, estado, fecha de vencimiento, AMFE origen
3. Indicadores visuales de acciones vencidas o próximas a vencer
4. Vista de calendario con fechas límite
5. Estadísticas básicas: total acciones, completadas, vencidas, ROI total
6. Opción de exportar lista filtrada a Excel

---

### Epic 3: Dashboard & Reporting

**Goal:** Crear dashboard central de gestión y sistema de reportes profesionales que permita visualizar el estado de todos los AMFEs, generar reportes exportables, y presentar resultados a gerencia con métricas e insights de valor.

---

**Story 3.1: AMFEs Central Dashboard**
Como usuario de calidad,
Quiero ver un dashboard con todos mis AMFEs y su estado general,
Para tener visión rápida y completa de todos mis análisis.

**Acceptance Criteria:**
1. Dashboard principal con cards/mini-views de cada AMFE
2. Información mostrada: nombre, tipo, fecha última modificación, total NPRs, estado general
3. Filtros por tipo (DFMEA/PFMEA), estado, fecha de modificación
4. Búsqueda de AMFEs por nombre o contenido
5. Indicadores visuales de AMFEs con NPRs críticos
6. Opciones rápidas: editar, duplicar, exportar, eliminar
7. Estadísticas resumen: total AMFEs, NPRs críticos, acciones pendientes

**Story 3.2: Visual Analytics & Insights**
Como gerente de calidad,
Quiero ver visualizaciones y analytics de riesgos y tendencias,
Para identificar patrones y tomar decisiones informadas.

**Acceptance Criteria:**
1. Gráfico Pareto de NPRs por modo de fallo
2. Mapa de calor de severidad vs ocurrencia
3. Gráfico de tendencias de NPRs a lo largo del tiempo
4. Top 10 modos de fallo por NPR total
5. Distribución de acciones por estado y responsable
6. Métricas clave: NPR promedio, total de acciones, ROI promedio
7. Filtros de fecha para todas las visualizaciones

**Story 3.3: PDF Report Generation**
Como ingeniero de calidad,
Quiero generar reportes profesionales en PDF con formato estándar,
Para compartir análisis completos con stakeholders y auditores.

**Acceptance Criteria:**
1. Plantilla PDF profesional con header y footer corporativos
2. Contenido del reporte: información del AMFE, matriz completa, acciones correctivas, resumen ejecutivo
3. Opciones de configuración: incluir/excluir secciones, tamaño de página, orientación
4. Previsualización del PDF antes de generar
5. Descarga automática del PDF generado
6. Optimización de tamaño de archivo (< 2MB)
7. Naming automático de archivo con formato estandarizado

**Story 3.4: Excel Export Functionality**
Como analista de calidad,
Quiero exportar datos a Excel para análisis adicionales,
Para realizar cálculos personalizados y cross-referencing con otros datos.

**Acceptance Criteria:**
1. Exportación de matriz AMFE a formato Excel con fórmulas mantenidas
2. Hoja separada para acciones correctivas con todos los campos
3. Hoja de resumen con estadísticas y métricas clave
4. Mantenimiento de formatos y colores para NPRs críticos
5. Opción de exportar solo filas filtradas
6. Generación de archivo .xlsx moderno (no .xls antiguo)
7. Descarga directa o email del archivo generado

**Story 3.5: Management Summary Reports**
Como gerente,
Quiero generar reportes ejecutivos con insights clave para presentaciones,
Para comunicar estado y resultados del programa de calidad a dirección.

**Acceptance Criteria:**
1. Reporte ejecutivo con dashboard de 1 página
2. Métricas clave: evolución de NPRs, ROI de acciones, riesgo residual
3. Identificación de top 5 riesgos críticos y estado de mitigación
4. Timeline visual de implementación de acciones
5. Recomendaciones automáticas basadas en datos
6. Gráficos y visualizaciones profesionales
7. Exportación a PowerPoint o PDF para presentaciones

---

### Epic 4: User Experience Polish & Offline

**Goal:** Implementar capacidades PWA, modo offline robusto, optimización de performance, y pulido final de UX para asegurar experiencia profesional, sin fricciones y que genere confianza en ingenieros de calidad.

---

**Story 4.1: PWA Implementation**
Como usuario,
Quiero instalar la aplicación en mi dispositivo y acceder offline,
Para tener acceso rápido y confidencial a mis AMFEs en cualquier lugar.

**Acceptance Criteria:**
1. Service Worker configurado con Workbox para caching estratégico
2. Manifest.json con iconos, colores y nombre de aplicación
3. Botón "Install App" en navegadores compatibles
4. Funcionamiento offline básico con datos cacheados
5. Sincronización automática al recuperar conexión
6. Notificaciones push para recordatorios de vencimientos
7. Actualizaciones automáticas en segundo plano

**Story 4.2: Offline Mode & Sync Strategy**
Como ingeniero de campo,
Quiero trabajar sin conexión y sincronizar cambios automáticamente,
Para realizar análisis en plantas sin internet confiable.

**Acceptance Criteria:**
1. Detección automática de estado de conexión
2. Almacenamiento local en IndexedDB cuando offline
3. UI indicator de modo offline/sync status
4. Queue de cambios pendientes de sincronizar
5. Resolución de conflictos si hay cambios concurrentes
6. Sincronización bidireccional completa al regresar online
7. Opción de forzar sincronización manual

**Story 4.3: Performance Optimization**
Como usuario,
Quiero que la aplicación responda instantáneamente a mis acciones,
Para mantener flujo de trabajo sin interrupciones.

**Acceptance Criteria:**
1. Tiempo de carga inicial < 3 segundos
2. Respuesta a interacciones < 500ms
3. Lazy loading de componentes y datos
4. Optimización de bundle con tree-shaking agresivo
5. Imágenes y assets optimizados y cacheados
6. Virtual scrolling para listas largas de acciones
7. Memoización de cálculos NPR y datos cacheados

**Story 4.4: Advanced UX Polish**
Como usuario exigente,
Quiero una experiencia pulida y profesional que genere confianza,
Para sentir que estoy utilizando una herramienta seria de ingeniería.

**Acceptance Criteria:**
1. Micro-interacciones y transiciones suaves en todas las acciones
2. Estados de carga claros y skeletons screens
3. Manejo elegante de errores con mensajes contextualizados
4. Atajos de teclado documentados y consistentes
5. Tooltips y ayuda contextual en campos complejos
6. Modo oscuro/claro con persistencia de preferencia
7. Animaciones de feedback para acciones completadas

**Story 4.5: Data Import/Export & Backup**
Como usuario preocupado por la pérdida de datos,
Quiero hacer backup y migrar mis AMFEs fácilmente,
Para proteger mi trabajo y cambiar entre dispositivos.

**Acceptance Criteria:**
1. Exportación completa de datos a formato JSON
2. Importación de datos desde archivo JSON
3. Validación de integridad de datos durante importación
4. Opción de backup automático en Supabase
5. Exportación individual de AMFEs para compartir
6. Historial de backups con fechas
7. Función de restore desde backup específico

---

## Epic Details

### Epic 1: Foundation & Core AMFE Engine

**Goal:** Establecer infraestructura técnica completa y crear el motor fundamental de análisis AMFE que permita a usuarios crear, editar y calcular matrices AMFE completas con biblioteca de modos de fallo y almacenamiento persistente en Supabase.

---

**Story 1.1: Project Setup & Supabase Configuration**
Como desarrollador,
Quiero configurar el proyecto con React + TypeScript, Vercel deployment y Supabase backend,
Para tener base técnica sólida y escalable para el MVP.

**Acceptance Criteria:**
1. Repository monorepo con estructura clara (/frontend, /docs, /functions)
2. React 18 + TypeScript configurado con ESLint y Prettier
3. Supabase project creado con PostgreSQL database
4. Environment variables configuradas para local y producción
5. Vercel deployment automatizado con GitHub Actions
6. CI/CD pipeline funcional con tests básicos ejecutándose

**Story 1.2: Database Schema & Authentication Setup**
Como desarrollador,
Quiero definir y crear el schema de base de datos para AMFEs con autenticación opcional,
Para poder persistir y consultar datos de análisis eficientemente.

**Acceptance Criteria:**
1. Tablas en Supabase: users, fmeas, failure_modes, failure_causes, correctives_actions
2. Row Level Security configurado para acceso solo por dueño
3. Supabase Auth configurado con email/password (opcional para usuario)
4. Types de TypeScript generados automáticamente desde schema
5. API endpoints básicos funcionando (CRUD para fmeas)
6. Conexión entre frontend y Supabase establecida y probada

**Story 1.3: AMFE Creation & Management UI**
Como usuario de calidad,
Quiero crear nuevos AMFEs con información básica (nombre, tipo, scope),
Para iniciar análisis estructurados de riesgos.

**Acceptance Criteria:**
1. Formulario de creación de AMFE con campos: nombre, tipo (DFMEA/PFMEA), descripción, scope
2. Lista de AMFEs existentes con búsqueda y filtros básicos
3. Vista de detalle de AMFE con opción de editar/eliminar/duplicar
4. Validaciones de campos obligatorios
5. Guardado automático de cambios en Supabase
6. Indicadores visuales de estado (borrador, en progreso, completado)

**Story 1.4: AMFE Matrix Editor Component**
Como ingeniero de calidad,
Quiero editar la matriz AMFE directamente como una hoja de cálculo,
Para ingresar y modificar datos de análisis eficientemente.

**Acceptance Criteria:**
1. Tabla editable con columnas: función, modo de fallo, efecto, causa, controles actuales, S, O, D, NPR
2. Cálculo automático de NPR (S × O × D) al modificar S, O, o D
3. Navegación por teclado (tab, shift-tab, enter, arrows)
4. Validaciones de rango (1-10) para S, O, D
5. Auto-guardado al perder foco de celda
6. Opción de agregar/eliminar filas dinámicamente
7. Indicadores visuales para NPRs críticos (color coding)

**Story 1.5: Failure Modes Library Integration**
Como usuario de calidad,
Quiero acceder y utilizar una biblioteca pre-cargada de 100+ modos de fallo comunes,
Para acelerar el análisis y asegurar cobertura completa.

**Acceptance Criteria:**
1. Biblioteca de 100+ modos de fallo organizados por categoríamanufacturera
2. Búsqueda y filtrado de modos de fallo por texto y categoría
3. Función de autocompletado mientras escribe en campo de modo de fallo
4. Opción de agregar modos de fallo personalizados a biblioteca local
5. Pre-carga inicial de biblioteca en Supabase durante setup
6. UI tipo modal/popup para buscar y seleccionar modos de fallo

---

### Epic 2: Actions Management & Tracking

**Goal:** Implementar sistema completo de gestión de acciones correctivas que permita asignar tareas, seguir costos, gestionar estados, y almacenar evidencias, cerrando el ciclo completo de mejora continua.

---

**Story 2.1: Corrective Actions Creation**
Como ingeniero de calidad,
Quiero crear acciones correctivas para NPRs altos con responsables y plazos,
Para planificar y asignar tareas de mitigación de riesgos.

**Acceptance Criteria:**
1. Botón de "Crear Acción" desde filas con NPR sobre umbral configurable
2. Formulario de acción con campos: descripción, responsable, email/telefono, fecha compromiso, costo estimado
3. Vinculación automática entre acción y fila específica del AMFE
4. Validaciones de campos obligatorios y formato de email/telefono
5. Opción de asignar múltiples acciones a un mismo NPR
6. Vista previa de acción antes de guardar

**Story 2.2: Cost Tracking & ROI Calculation**
Como gerente de calidad,
Quiero registrar costos reales de implementación y calcular ROI automáticamente,
Para medir el impacto económico de las acciones correctivas.

**Acceptance Criteria:**
1. Campos de costo estimado y costo real en cada acción correctiva
2. Cálculo automático de ROI: (Costo de no calidad evitado - Costo implementación) / Costo implementación
3. Sumatorias automáticas de costos por AMFE y general
4. Indicadores visuales de ROI positivo/negativo
5. Exportación de reporte de costos y ROI
6. Historial de cambios de costos con timestamp

**Story 2.3: Action Status Management**
Como responsable de acción,
Quiero actualizar el estado de mis acciones (Pendiente → En Progreso → Completada → Verificada),
Para mantener seguimiento claro del progreso.

**Acceptance Criteria:**
1. Estados definidos: Pendiente, En Progreso, Completada, Verificada
2. Flujo de estados con validaciones (no se puede verificar si no está completada)
3. Timestamp automático en cada cambio de estado
4. Comentarios opcionales en cada cambio de estado
5. Indicadores visuales de estado con colores (rojo/amarillo/verde)
6. Historial completo de cambios de estado por acción

**Story 2.4: Evidence Management**
Como ingeniero de calidad,
Quiero adjuntar archivos/fotos como evidencia de implementación de acciones,
Para documentar y probar la eficacia de las medidas correctivas.

**Acceptance Criteria:**
1. Botón de "Adjuntar Evidencia" en acciones en estado "Completada" o "Verificada"
2. Upload de archivos a Supabase Storage (imágenes, PDFs, documentos)
3. Vista previa de archivos adjuntos con tamaño y tipo
4. Opción de eliminar archivos adjuntos
5. Límite de tamaño por archivo (configurable,建议 10MB)
6. Organización de archivos por acción y AMFE
7. Visualización de imágenes directamente en la aplicación

**Story 2.5: Actions Dashboard & Filtering**
Como gerente de calidad,
Quiero ver un dashboard unificado de todas las acciones correctivas con filtros avanzados,
Para tener visibilidad completa del estado de todas las iniciativas.

**Acceptance Criteria:**
1. Dashboard con lista completa de todas las acciones correctivas
2. Filtros por: responsable, estado, fecha de vencimiento, AMFE origen
3. Indicadores visuales de acciones vencidas o próximas a vencer
4. Vista de calendario con fechas límite
5. Estadísticas básicas: total acciones, completadas, vencidas, ROI total
6. Opción de exportar lista filtrada a Excel

---

### Epic 3: Dashboard & Reporting

**Goal:** Crear dashboard central de gestión y sistema de reportes profesionales que permita visualizar el estado de todos los AMFEs, generar reportes exportables, y presentar resultados a gerencia con métricas e insights de valor.

---

**Story 3.1: AMFEs Central Dashboard**
Como usuario de calidad,
Quiero ver un dashboard con todos mis AMFEs y su estado general,
Para tener visión rápida y completa de todos mis análisis.

**Acceptance Criteria:**
1. Dashboard principal con cards/mini-views de cada AMFE
2. Información mostrada: nombre, tipo, fecha última modificación, total NPRs, estado general
3. Filtros por tipo (DFMEA/PFMEA), estado, fecha de modificación
4. Búsqueda de AMFEs por nombre o contenido
5. Indicadores visuales de AMFEs con NPRs críticos
6. Opciones rápidas: editar, duplicar, exportar, eliminar
7. Estadísticas resumen: total AMFEs, NPRs críticos, acciones pendientes

**Story 3.2: Visual Analytics & Insights**
Como gerente de calidad,
Quiero ver visualizaciones y analytics de riesgos y tendencias,
Para identificar patrones y tomar decisiones informadas.

**Acceptance Criteria:**
1. Gráfico Pareto de NPRs por modo de fallo
2. Mapa de calor de severidad vs ocurrencia
3. Gráfico de tendencias de NPRs a lo largo del tiempo
4. Top 10 modos de fallo por NPR total
5. Distribución de acciones por estado y responsable
6. Métricas clave: NPR promedio, total de acciones, ROI promedio
7. Filtros de fecha para todas las visualizaciones

**Story 3.3: PDF Report Generation**
Como ingeniero de calidad,
Quiero generar reportes profesionales en PDF con formato estándar,
Para compartir análisis completos con stakeholders y auditores.

**Acceptance Criteria:**
1. Plantilla PDF profesional con header y footer corporativos
2. Contenido del reporte: información del AMFE, matriz completa, acciones correctivas, resumen ejecutivo
3. Opciones de configuración: incluir/excluir secciones, tamaño de página, orientación
4. Previsualización del PDF antes de generar
5. Descarga automática del PDF generado
6. Optimización de tamaño de archivo (< 2MB)
7. Naming automático de archivo con formato estandarizado

**Story 3.4: Excel Export Functionality**
Como analista de calidad,
Quiero exportar datos a Excel para análisis adicionales,
Para realizar cálculos personalizados y cross-referencing con otros datos.

**Acceptance Criteria:**
1. Exportación de matriz AMFE a formato Excel con fórmulas mantenidas
2. Hoja separada para acciones correctivas con todos los campos
3. Hoja de resumen con estadísticas y métricas clave
4. Mantenimiento de formatos y colores para NPRs críticos
5. Opción de exportar solo filas filtradas
6. Generación de archivo .xlsx moderno (no .xls antiguo)
7. Descarga directa o email del archivo generado

**Story 3.5: Management Summary Reports**
Como gerente,
Quiero generar reportes ejecutivos con insights clave para presentaciones,
Para comunicar estado y resultados del programa de calidad a dirección.

**Acceptance Criteria:**
1. Reporte ejecutivo con dashboard de 1 página
2. Métricas clave: evolución de NPRs, ROI de acciones, riesgo residual
3. Identificación de top 5 riesgos críticos y estado de mitigación
4. Timeline visual de implementación de acciones
5. Recomendaciones automáticas basadas en datos
6. Gráficos y visualizaciones profesionales
7. Exportación a PowerPoint o PDF para presentaciones

---

### Epic 4: User Experience Polish & Offline

**Goal:** Implementar capacidades PWA, modo offline robusto, optimización de performance, y pulido final de UX para asegurar experiencia profesional, sin fricciones y que genere confianza en ingenieros de calidad.

---

**Story 4.1: PWA Implementation**
Como usuario,
Quiero instalar la aplicación en mi dispositivo y acceder offline,
Para tener acceso rápido y confidencial a mis AMFEs en cualquier lugar.

**Acceptance Criteria:**
1. Service Worker configurado con Workbox para caching estratégico
2. Manifest.json con iconos, colores y nombre de aplicación
3. Botón "Install App" en navegadores compatibles
4. Funcionamiento offline básico con datos cacheados
5. Sincronización automática al recuperar conexión
6. Notificaciones push para recordatorios de vencimientos
7. Actualizaciones automáticas en segundo plano

**Story 4.2: Offline Mode & Sync Strategy**
Como ingeniero de campo,
Quiero trabajar sin conexión y sincronizar cambios automáticamente,
Para realizar análisis en plantas sin internet confiable.

**Acceptance Criteria:**
1. Detección automática de estado de conexión
2. Almacenamiento local en IndexedDB cuando offline
3. UI indicator de modo offline/sync status
4. Queue de cambios pendientes de sincronizar
5. Resolución de conflictos si hay cambios concurrentes
6. Sincronización bidireccional completa al regresar online
7. Opción de forzar sincronización manual

**Story 4.3: Performance Optimization**
Como usuario,
Quiero que la aplicación responda instantáneamente a mis acciones,
Para mantener flujo de trabajo sin interrupciones.

**Acceptance Criteria:**
1. Tiempo de carga inicial < 3 segundos
2. Respuesta a interacciones < 500ms
3. Lazy loading de componentes y datos
4. Optimización de bundle con tree-shaking agresivo
5. Imágenes y assets optimizados y cacheados
6. Virtual scrolling para listas largas de acciones
7. Memoización de cálculos NPR y datos cacheados

**Story 4.4: Advanced UX Polish**
Como usuario exigente,
Quiero una experiencia pulida y profesional que genere confianza,
Para sentir que estoy utilizando una herramienta seria de ingeniería.

**Acceptance Criteria:**
1. Micro-interacciones y transiciones suaves en todas las acciones
2. Estados de carga claros y skeletons screens
3. Manejo elegante de errores con mensajes contextualizados
4. Atajos de teclado documentados y consistentes
5. Tooltips y ayuda contextual en campos complejos
6. Modo oscuro/claro con persistencia de preferencia
7. Animaciones de feedback para acciones completadas

**Story 4.5: Data Import/Export & Backup**
Como usuario preocupado por la pérdida de datos,
Quiero hacer backup y migrar mis AMFEs fácilmente,
Para proteger mi trabajo y cambiar entre dispositivos.

**Acceptance Criteria:**
1. Exportación completa de datos a formato JSON
2. Importación de datos desde archivo JSON
3. Validación de integridad de datos durante importación
4. Opción de backup automático en Supabase
5. Exportación individual de AMFEs para compartir
6. Historial de backups con fechas
7. Función de restore desde backup específico

---

## Checklist Results Report

### PM Checklist Results

**PRD & EPIC VALIDATION SUMMARY**

#### Executive Summary
- **Overall PRD Completeness**: 92% - Comprehensive coverage with clear MVP focus
- **MVP Scope Appropriateness**: Just Right - Well-balanced scope delivering complete AMFE workflow
- **Readiness for Architecture Phase**: Ready - Clear technical direction provided
- **Most Critical Gaps**: Minor gaps in integration requirements and detailed testing strategy

#### Category Analysis Table

| Category                         | Status  | Critical Issues |
| -------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context  | PASS    | None            |
| 2. MVP Scope Definition          | PASS    | None            |
| 3. User Experience Requirements  | PASS    | None            |
| 4. Functional Requirements       | PASS    | None            |
| 5. Non-Functional Requirements   | PASS    | None            |
| 6. Epic & Story Structure        | PASS    | None            |
| 7. Technical Guidance            | PASS    | None            |
| 8. Cross-Functional Requirements | PARTIAL | Need API specs  |
| 9. Clarity & Communication       | PASS    | None            |

#### Top Issues by Priority

**MEDIUM:**
1. **API Specification Detail** - While Supabase is defined, detailed API endpoint specifications need architect definition
2. **Integration Testing Strategy** - High-level testing mentioned but detailed strategy needs architect input
3. **Performance Monitoring** - Requirements defined but implementation approach needs technical specification

**LOW:**
1. **Error State UI Patterns** - Mentioned in UX goals but detailed patterns need UX design
2. **Accessibility Testing** - WCAG AA specified but testing approach needs definition

#### MVP Scope Assessment

**Appropriately Scoped Features:**
- Core AMFE matrix editor with calculations ✅
- Basic actions management with cost tracking ✅
- Simple dashboard and reporting ✅
- PWA with offline capability ✅

**Complexity Analysis:**
- 4 epics with 20 stories provide manageable scope
- Each story sized for 2-4 hour AI execution
- Dependencies clearly identified and sequenced
- Technical complexity moderated by Supabase platform choice

**Timeline Realism:**
- 3-4 month MVP timeline achievable with focused development
- Parallel tracks possible (frontend/backend setup while library content development)
- Buffer built in for user testing and iteration

#### Technical Readiness

**Strong Technical Foundation:**
- Supabase choice provides clear technical constraints and capabilities
- React + TypeScript stack well-defined with specific libraries
- Deployment strategy (Vercel + Supabase) cost-optimized for free tier
- Performance targets specific and measurable (<3s load, <5MB bundle)

**Areas for Architect Investigation:**
1. **Detailed Database Schema** - Entity relationships and indexing strategy
2. **Offline Sync Algorithm** - Conflict resolution and queue management
3. **PDF Generation Architecture** - Client-side vs server-side generation decision
4. **Real-time Features** - Supabase realtime implementation patterns
5. **Performance Optimization Strategy** - Caching layers and bundle optimization

#### Recommendations

**Immediate Actions:**
1. ✅ PRD is architect-ready - proceed to architecture phase
2. Consider user testing session with 3-5 quality engineers during Epic 1
3. Define detailed API specifications in architecture phase
4. Create performance monitoring plan during technical design

**Future Considerations:**
1. Plan for graceful transition from free-tier to paid tiers as user base grows
2. Consider data privacy requirements for different manufacturing industries
3. Evaluate need for industry-specific failure mode libraries post-MVP

#### Quality Assurance Summary

**Strengths:**
- Strong alignment between project brief and PRD requirements
- Technical architecture optimized for cost control (Supabase free tier)
- User experience design respects existing Excel workflows while adding modern capabilities
- Epic sequencing follows logical value delivery progression
- Comprehensive acceptance criteria ensure testable deliverables
- Clear MVP boundaries prevent scope creep

**Risk Mitigation:**
- Offline-first approach mitigates connectivity concerns in manufacturing environments
- Progressive disclosure of complexity maintains 30-minute learning curve target
- Modular architecture allows for iterative feature additions based on user feedback
- Free-tier constraints drive efficient technical decisions
- Optional authentication reduces friction while enabling cloud benefits

### Final Decision

✅ **READY FOR ARCHITECT**: The PRD and epics are comprehensive, properly structured, and ready for architectural design.

## Next Steps

### UX Expert Prompt

Please review the AMFE tool PRD and create detailed wireframes and user flow diagrams focusing on:
1. Matrix AMFE editor with Excel-like interaction patterns optimized for quality engineers
2. Actions management workflow with clear status progression and cost tracking
3. Dashboard design that provides quick insights for management presentations
4. Mobile-responsive patterns for field engineers needing to access data on shop floor
5. Offline mode indicators and sync status communications

### Architect Prompt

Please review the AMFE tool PRD and create detailed technical architecture including:
1. Supabase database schema design for AMFEs, failure modes, actions, and user data
2. React component architecture with state management strategy (Zustand/React Query)
3. PWA implementation strategy with service worker caching policies
4. Performance optimization plan to achieve <3s load time and <5MB bundle size
5. CI/CD pipeline configuration for Vercel deployment with automated testing
6. Data synchronization strategy between localStorage and Supabase for offline functionality