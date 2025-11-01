# Requirements

## Functional Requirements

**FR1:** La aplicación web debe permitir crear y editar AMFEs (PFMEA/DFMEA) con matriz editable conteniendo campos estándar AIAG-VDA (función, modo de fallo, efecto, causa, controles actuales, S-O-D, NPR)

**FR2:** El sistema debe calcular automáticamente el NPR (Número de Prioridad de Riesgo) multiplicando Severidad × Ocurrencia × Detección con validaciones de rango (1-10)

**FR3:** La aplicación debe incluir una biblioteca pre-cargada con 100+ modos de fallo comunes para manufactura que puedan ser seleccionados y personalizados durante el análisis

**FR4:** El sistema debe permitir crear acciones correctivas para cada NPR alto con campos: responsable, fecha límite, costo estimado, costo real, estado (Pendiente/En Progreso/Completada/Verificada), y evidencia adjunta

**FR5:** La aplicación debe proporcionar un dashboard simple que muestre todos los AMFEs creados, panel unificado de acciones correctivas, filtros por responsable, y alertas visuales de vencimientos

**FR6:** El sistema debe generar reportes exportables en formato PDF y Excel con AMFE completo, listado de acciones con costos, y resumen de seguimiento para presentaciones

**FR7:** La aplicación debe funcionar como Progressive Web App (PWA) con capacidad offline básica para continuar trabajo sin conexión y sincronizar al regresar

**FR8:** El sistema debe almacenar todos los datos localmente en el browser del usuario utilizando localStorage/IndexedDB sin necesidad de registro o servidor backend

## Non-Functional Requirements

**NFR1:** La aplicación web debe ser 100% gratuita sin funcionalidades de pago ocultas para cumplir con objetivo de MVP accesible

**NFR2:** El tiempo de carga inicial debe ser menor a 3 segundos y cualquier acción del usuario debe responder en menos de 1 segundo

**NFR3:** La aplicación debe ser responsive y funcional en dispositivos móviles y desktop con soporte para navegadores Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**NFR4:** Los datos del usuario deben persistir localmente con capacidad de exportación/importación para backup y recuperación de información

**NFR5:** La interfaz debe ser intuitiva con curva de aprendizaje máxima de 30 minutos para ingenieros familiarizados con AMFEs

**NFR6:** La aplicación debe funcionar offline con modo básico de edición y sincronizar cambios cuando la conexión se restablezca

**NFR7:** El tamaño total de la aplicación debe ser menor a 5MB para descarga rápida en conexiones lentas
