# Registro de Cambios - Migración a Sistema de Turnos Hospitalario

## Resumen de Cambios
Se han migrado todos los archivos de un sistema escolar a un **sistema de gestión de turnos para hospital**.

## Cambios Realizados por Archivo

### Páginas Principales

#### 1. **inicio.html** (Login)
- ✓ Título: "Sistema Escolar - Iniciar Sesión" → "Sistema de Turnos - Hospital Central"
- ✓ Ícono: `fa-graduation-cap` → `fa-hospital`
- ✓ Subtítulo: "Plataforma de Gestión Educativa" → "Sistema de Gestión de Turnos"

#### 2. **banner.html** (Header del Sistema)
- ✓ Título: "Sistema Escolar" → "Hospital Central"
- ✓ Subtítulo: "Plataforma de Gestión Educativa Integral" → "Sistema de Gestión de Turnos Médicos"
- ✓ Ícono: `fa-graduation-cap` → `fa-hospital`

### Portales por Rol

#### 3. **admin.html** (Panel Administrativo)
- ✓ Título: "Panel Administrativo - Sistema Escolar" → "Panel Administrativo - Hospital Central"
- ✓ Rol: Administrador de Hospital (no cambió estructura, solo contexto)

#### 4. **profesor.html** (Portal de Médicos)
- ✓ Título: "Portal Docente - Sistema Escolar" → "Portal Médico - Hospital Central"
- ✓ Sidebar actualizado: "Docente" → "Médico"

#### 5. **alumno.html** (Portal de Pacientes)
- ✓ Título: "Portal Estudiante - Sistema Escolar" → "Portal Paciente - Hospital Central"
- ✓ Sidebar actualizado: "Alumno" → "Paciente"

### Índices/Sidebars

#### 6. **indiceadmin.html** (Menu Administrador)
- ✓ Título: "Panel Administrativo" → "Administrador - Hospital Central"
- ✓ Ícono: `fa-cog` → `fa-hospital`
- ✓ Menu actualizado:
  - "Gestionar Usuarios" → "Gestionar Turnos"
  - "Asistencia" → "Gestionar Usuarios"
  - "Materias" → "Especialidades"
  - "Horarios" → "Horarios de Médicos"
  - "Faltas" → "Turnos Realizados"
  - "Sueldos" → "Reporte de Asistencia"

#### 7. **indiceprof.html** (Menu Médico)
- ✓ Título: "Portal Docente" → "Portal Médico - Hospital Central"
- ✓ Ícono: `fa-chalkboard-user` → `fa-user-md`
- ✓ Secciones:
  - "Docencia" → "Mis Turnos"
  - "Mis Materias" → "Mi Horario"
  - "Asistencia" → "Turnos del Día"
  - "Horarios" → "Mis Disponibilidades"
  - "Administración" → "Pacientes"
  - "Calificaciones" → "Mis Pacientes"
  - "Faltas de Alumnos" → "Historial Médico"

#### 8. **indicealum.html** (Menu Paciente)
- ✓ Título: "Portal Estudiante" → "Portal Paciente - Hospital Central"
- ✓ Ícono: `fa-user-graduate` → `fa-user-injured`
- ✓ Secciones:
  - "Mi Información" → "Mis Turnos"
  - "Mi Asistencia" → "Mis Turnos"
  - "Mis Faltas" → "Historial de Turnos"
  - "Mis Horarios" → "Reservar Turno"
  - "Académico" → "Médicos"
  - "Mis Materias" → "Ver Especialidades"
  - "Calificaciones" → "Mis Médicos"

### Módulos Funcionales

#### 9. **abm.html** (Gestión de Usuarios → Turnos)
- ✓ Título: "Gestionar Usuarios" → "Gestionar Turnos - Hospital Central"
- ✓ Ícono: `fa-users-cog` → `fa-calendar-check`
- ✓ Descripción: "Administra usuarios" → "Administra los turnos del hospital"
- ✓ Tabla:
  - Columnas actualizadas: ID Turno, Paciente, Médico, Especialidad, Fecha, Hora, Estado, Acciones
  - Datos de ejemplo con información médica relevante
  - Estados: Confirmado, Pendiente, Cancelado

#### 10. **horarios.html** (Horario Académico → Disponibilidad)
- ✓ Título: "Horarios" → "Horarios de Disponibilidad - Hospital Central"
- ✓ Descripción: "Horarios de clases" → "Horarios de disponibilidad de médicos"
- ✓ Select: Cursos → Médicos (con especialidades)
- ✓ Tabla:
  - Contenido: Disponibilidad de turnos por médico
  - Indicadores: "Disponible" (verde), "Lleno" (rojo)
  - Muestra ocupación: "X/3 turnos"

#### 11. **materias.html** (Gestionar Materias → Especialidades)
- ✓ Título: "Gestionar Materias" → "Especialidades Médicas - Hospital Central"
- ✓ Ícono: `fa-book` → `fa-stethoscope`
- ✓ Descripción: "Materias disponibles" → "Especialidades médicas disponibles"
- ✓ Tabla:
  - Código → Código de Especialidad
  - Nombre → Especialidad
  - Docente → Médico Responsable
  - Curso → Descripción
  - Créditos → Turnos Diarios

#### 12. **asistencia.html** (Asistencia Escolar → Turnos del Sistema)
- ✓ Título: "Sistema de Asistencia Escolar" → "Sistema de Turnos del Hospital"
- ✓ Enfoque: Pasó de asistencia a turnos

#### 13. **faltas.html** (Registro de Faltas → Historial de Turnos)
- ✓ Título: "Registro de Faltas" → "Historial de Turnos Realizados - Hospital Central"
- ✓ Ícono: `fa-times-circle` → `fa-history`
- ✓ Descripción: "Control de inasistencias" → "Registro de turnos completados"
- ✓ Tabla:
  - Alumno → Paciente
  - Materia → Médico
  - Fecha → Fecha
  - Tipo → Especialidad
  - Justificado → Estado
  - (Agregadas columnas: Hora, Estado)

#### 14. **registro.html** (Crear Cuenta → Registrar Médico)
- ✓ Título: "Sistema Escolar - Nuevo Registro" → "Hospital Central - Registro de Médico"
- ✓ Encabezado: "Crear Nueva Cuenta" → "Registrar Nuevo Médico"
- ✓ Descripción: "Registrarte en el sistema" → "Registrar un nuevo médico"
- ✓ Campo "Rol" cambiado a "Especialidad Médica" con opciones:
  - Cardiología
  - Pediatría
  - Dermatología
  - Traumatología
  - Oftalmología
  - Neurología
  - Psicología
  - Medicina General

#### 15. **sueldo.html** (Gestión de Sueldos → Reporte de Asistencia)
- ✓ Título: "Gestión de Sueldos" → "Reporte de Asistencia - Hospital Central"
- ✓ Encabezado: "Gestión de Sueldos" → "Reporte de Asistencia de Médicos"
- ✓ Descripción: "Remuneraciones" → "Control de asistencia del personal médico"
- ✓ Select: Empleados Docentes → Médicos por Especialidad

### Archivos de Lógica

#### 16. **eje1.js** (Autenticación)
- ✓ Actualizado credenciales de prueba:
  - Usuario: "admin" / Contraseña: "admin123"
  - Usuario: "medico" / Contraseña: "medico123"
  - Usuario: "paciente" / Contraseña: "paciente123"
- ✓ Mensaje de error mejorado con las credenciales correctas

#### 17. **db.js** (Configuración de Base de Datos)
- ✓ Nombre de usuario: "posgres" → "postgres" (corregido typo)
- ✓ Host: "localhots" → "localhost" (corregido typo)
- ✓ Base de datos: "practica2" → "hospital_turnos"
- ✓ Contraseña: "jorge2026" → "hospital2026"
- ✓ Agregados comentarios para claridad
- ✓ Corregida sintaxis: `new pool` → `new Pool`

### Archivos Nuevos

#### 18. **README.md** (Documentación)
- Guía completa del sistema
- Descripción de características
- Instrucciones de acceso
- Estructura de archivos
- Información de especialidades
- Configuración de base de datos

#### 19. **CAMBIOS.md** (Este archivo)
- Registro detallado de todos los cambios
- Facilitará futuras migraciones o actualizaciones

## Contexto de Cambios

### Equivalencias Terminológicas

| Sistema Escolar | Sistema Hospitalario |
|-----------------|---------------------|
| Alumno | Paciente |
| Profesor/Docente | Médico |
| Materia | Especialidad Médica |
| Clase | Turno Médico |
| Asistencia | Turnos del Día |
| Faltas | Historial de Turnos |
| Calificaciones | Historial Médico |
| Sueldo | Reporte de Asistencia |

## Estado de Completitud

✓ Todos los archivos HTML actualizados
✓ Archivos JavaScript actualizados
✓ Archivos de configuración actualizados
✓ Documentación creada
✓ Registro de cambios creado

## Próximos Pasos Recomendados

1. Actualizar la base de datos con schema hospitalario
2. Crear tablas específicas para:
   - Pacientes (con historia clínica)
   - Médicos (con especialidades)
   - Turnos
   - Especialidades
3. Implementar validaciones de negocio
4. Mejorar la seguridad (JWT, HTTPS)
5. Crear API REST para operaciones
6. Implementar notificaciones de turnos
7. Agregar reportes más detallados

---

**Fecha de migración:** 9 de junio de 2026
**Versión anterior:** Sistema Escolar v1.0
**Versión nueva:** Sistema de Turnos Hospital v1.0
