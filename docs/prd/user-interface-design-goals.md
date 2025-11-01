# User Interface Design Goals

## Overall UX Vision

Crear una experiencia de análisis AMFE profesional pero sin fricción que se sienta como una evolución natural del Excel pero con la potencia de una aplicación moderna. La interfaz debe eliminar la carga cognitiva de tareas administrativas (formato, cálculos, organización) permitiendo al ingeniero concentrarse 100% en el análisis de riesgos. Visualmente limpia y minimalista pero con información densa y bien estructurada que inspire confianza profesional.

## Key Interaction Paradigms

- **Edición tipo hoja de cálculo familiar**: Matriz AMFE editable directamente como Excel pero con validaciones y auto-guardado
- **Autocompletado inteligente**: Sugerencias contextuales de modos de fallo y causas mientras escribes
- **Drag-and-drop para acciones**: Reordenar y asignar acciones correctivas visualmente
- **Navegación por tabs**: Cambio rápido entre AMFE, dashboard de acciones, y reportes
- **Atajos de teclado**: Ctrl+S para exportar, Ctrl+N para nuevo AMFE, navegar con tab/shift-tab
- **Swipe gestures en móvil**: Para navegar entre filas de la matriz AMFE

## Core Screens and Views

1. **Pantalla Principal/Lista de AMFEs**: Dashboard con todos tus análisis, botón "+ Nuevo AMFE", filtros por tipo/fecha/estado
2. **Editor de Matriz AMFE**: Vista principal con tabla editable, barra de herramientas con acciones rápidas, panel lateral de información
3. **Panel de Acciones Correctivas**: Vista separada con lista de todas las acciones, filtros por responsable/estado, indicadores visuales de vencimiento
4. **Generador de Reportes**: Vista previa del reporte, opciones de exportación PDF/Excel, configuración de formato
5. **Biblioteca de Modos de Fallo**: Popup o modal con búsqueda y filtros por categoría de industria
6. **Configuración Básica**: Preferencias de cálculo NPR, umbrales de alerta, tema visual claro/oscuro

## Accessibility: WCAG AA

Nivel WCAG AA para asegurar accesibilidad en entornos corporativos y cumplimiento normativo. Contraste mínimo 4.5:1, navegación completa por teclado, etiquetas ARIA para lectores de pantalla, y zoom hasta 200% sin pérdida de funcionalidad.

## Branding

Identidad visual profesional y minimalista que inspire confianza en ingeniería de calidad:
- **Colores primarios**: Azul industrial (#1E3A8A) para elementos principales, gris claro (#F3F4F6) para fondos
- **Acentos**: Naranja seguridad (#EA580C) para alertas y NPRs críticos, verde éxito (#16A34A) para estados completados
- **Tipografía**: System fonts (sans-serif) para máxima compatibilidad, con jerarqu clara mediante peso y tamaño
- **Iconografía**: Iconos simples y universales para acciones comunes (editar, eliminar, exportar, asignar)

## Target Device and Platforms: Web Responsive

Diseño responsive-first que funcione seamless en desktop (1920x1080), tablet (768x1024) y móvil (375x667). Prioridad desktop para trabajo intensivo de análisis, pero con plena funcionalidad en móvil para consulta y edición rápida. PWA con instalación opcional en homescreen para acceso rápido.
