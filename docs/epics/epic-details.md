# Epic Details

## Epic 1: Foundation & Core AMFE Engine

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

**Testing Requirements:**
- Unit tests for configuration validation (90% coverage)
- Integration tests for CI/CD pipeline
- E2E test for basic deployment smoke test
- Performance test: initial load <3s

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

## Epic 2: Actions Management & Tracking

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

## Epic 3: Dashboard & Reporting

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

## Epic 4: User Experience Polish & Offline

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
5. **Resolución de conflictos con estrategia "Last Write Wins" + confirmación usuario**
   - Al detectar conflicto, mostrar diff visual y permitir usuario elegir versión
   - Opción "Keep Both" para fusionar cambios manualmente
   - Timestamp tracking para cada cambio a nivel de celda
6. Sincronización bidireccional completa al regresar online
7. Opción de forzar sincronización manual
8. **Backup automático antes de resolver conflictos**

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

**Story 4.6: User Documentation & Help System**
Como nuevo usuario,
Quiero acceder a documentación contextual y tutoriales integrados,
Para aprender a utilizar la herramienta rápidamente sin frustración.

**Acceptance Criteria:**
1. **Sistema de ayuda contextual integrado**
   - Tooltips explicativos en todos los campos complejos (S, O, D, NPR)
   - Botón "?" en cada sección con explicaciones detalladas
   - Tours guiados para primeras acciones (crear AMFE, agregar acción)
   - Indicadores visuales de primeros pasos

2. **Centro de ayuda completo**
   - Página de ayuda con búsqueda por temas
   - Tutoriales en video cortos (2-3 min) para tareas principales
   - FAQ con preguntas comunes
   - Glosario de términos AMFE/AIAG-VDA
   - Ejemplos de AMFEs completos por industria

3. **Documentación para exportar**
   - Manual de usuario en PDF (30 páginas máx)
   - Guía rápida de referencia (2 páginas)
   - Plantillas de AMFE pre-configuradas por industria
   - Mejores prácticas y casos de uso

4. **Onboarding interactivo**
   - Checklist de progreso para nuevos usuarios
   - AMFE de ejemplo ya pre-llenado para exploración
   - Simulación guiada del flujo completo
   - Certificado de completación del tutorial

**Story 4.7: Error Handling & Data Validation**
Como usuario,
Quiero recibir mensajes claros cuando cometo errores o hay problemas,
Para entender qué sucede y cómo corregirlo rápidamente.

**Acceptance Criteria:**
1. **Validación de datos en tiempo real**
   - Validación de rangos (1-10) para S, O, D con mensajes específicos
   - Detección de modos de fallo duplicados
   - Validación de formatos de email y teléfono
   - Advertencias para NPRs inconsistentes

2. **Mensajes de error amigables**
   - Error boundary para capturar errores de JavaScript
   - Mensajes específicos con sugerencias de solución
   - Botón de "Reportar problema" con contexto incluido
   - Modo seguro para recuperación de datos perdidos

3. **Recuperación de errores**
   - Auto-save cada 30 segundos o al cambiar de celda
   - Historial de cambios con opción de deshacer
   - Recuperación automática de trabajo no guardado
   - Exportación de datos de diagnóstico

**Story 4.8: Accessibility & Compliance**
Como ingeniero con discapacidad visual,
Quiero utilizar la herramienta con lectores de pantalla,
Para realizar mi trabajo sin barreras tecnológicas.

**Acceptance Criteria:**
1. **WCAG 2.1 AA Compliance**
   - Todas las interacciones accesibles por teclado
   - ARIA labels en todos los elementos interactivos
   - Contraste de colores mínimo 4.5:1
   - Focus indicators visibles claros

2. **Soporte para lectores de pantalla**
   - Tabla AMFE navegable por screen reader
   - Anuncios de cambios de estado importantes
   - Modo de alto contraste
   - Reducción de motion para usuarios sensibles

3. **Validación de accesibilidad**
   - Tests automatizados con axe-core
   - Tests manuales con NVDA/JAWS
   - Reporte de conformidad WCAG
   - Feedback de usuarios con discapacidad

---
