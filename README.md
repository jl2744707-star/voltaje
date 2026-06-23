# Sistema de Gestión de Turnos - Hospital Central

## Descripción General
Este es un sistema web completo para la gestión de turnos médicos en el Hospital Central. Permite a pacientes reservar turnos, a médicos gestionar su agenda y a administradores supervisar todo el sistema.

## Características Principales

### 👨‍💼 Panel Administrativo
- Gestionar turnos (crear, modificar, cancelar)
- Administrar horarios de médicos
- Gestionar especialidades médicas
- Reportes de asistencia del personal
- Crear nuevos usuarios (médicos)

### 👨‍⚕️ Portal Médico
- Ver turno del día
- Gestionar horario personal
- Ver lista de pacientes
- Revisar historial médico de pacientes
- Consultar disponibilidades

### 👤 Portal Paciente
- Reservar nuevos turnos
- Ver mis turnos próximos
- Historial de turnos realizados
- Ver especialidades disponibles
- Gestionar mis datos

## Credenciales de Acceso

### Roles del Sistema

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|-----------|--------|
| Administrador | admin | admin123 | admin.html |
| Médico | medico | medico123 | profesor.html |
| Paciente | paciente | paciente123 | alumno.html |

## Estructura de Archivos

```
pagina_web/
├── inicio.html           # Página de login
├── admin.html            # Portal administrador
├── profesor.html         # Portal médico
├── alumno.html           # Portal paciente
├── banner.html           # Banner del sistema
├── abm.html              # Gestión de turnos
├── horarios.html         # Horarios de disponibilidad
├── materias.html         # Especialidades médicas
├── asistencia.html       # Turnos del día
├── faltas.html           # Historial de turnos
├── registro.html         # Registrar nuevo médico
├── sueldo.html           # Reporte de asistencia
├── styles.css            # Estilos principales
├── simple.css            # Estilos alternativos
├── eje1.js               # Lógica de autenticación
├── db.js                 # Conexión a base de datos
├── package.json          # Dependencias
└── README.md             # Este archivo
```

## Especialidades Médicas

El sistema incluye las siguientes especialidades:

- **Cardiología** - Enfermedades del corazón
- **Pediatría** - Medicina infantil
- **Dermatología** - Enfermedades de la piel
- **Traumatología** - Lesiones óseas y musculares
- **Oftalmología** - Enfermedades de los ojos
- **Neurología** - Enfermedades del sistema nervioso
- **Psicología** - Salud mental
- **Medicina General** - Consultas generales

## Funcionalidades por Módulo

### Gestión de Turnos (abm.html)
- Buscar turnos por paciente
- Crear nuevos turnos
- Editar turnos existentes
- Cancelar turnos
- Ver estado de turnos (Confirmado, Pendiente, Cancelado)

### Horarios (horarios.html)
- Ver disponibilidad de médicos
- Mostrar capacidad de turnos por franja horaria
- Turnos disponibles/llenos por día

### Especialidades (materias.html)
- Listar especialidades médicas
- Médico responsable por especialidad
- Turnos diarios disponibles
- Estado activo/inactivo

### Historial de Turnos (faltas.html)
- Ver turnos realizados por paciente
- Filtrar por rango de fechas
- Estado de turnos (Completado, No asistió, Cancelado)

## Configuración de Base de Datos

**Base de datos:** hospital_turnos
**Usuario:** postgres
**Contraseña:** hospital2026
**Host:** localhost
**Puerto:** 5432

### Tablas Principales
- `usuarios` - Datos de usuarios (pacientes, médicos, admin)
- `turnos` - Registro de turnos
- `medicos` - Información de médicos
- `especialidades` - Especialidades médicas
- `pacientes` - Datos de pacientes

## Cómo Usar

### Para Administradores
1. Acceder con usuario: `admin` / contraseña: `admin123`
2. Usar el panel administrativo para:
   - Crear y gestionar turnos
   - Registrar nuevos médicos
   - Ver reportes

### Para Médicos
1. Acceder con usuario: `medico` / contraseña: `medico123`
2. Ver agenda del día
3. Consultar datos de pacientes
4. Gestionar disponibilidad

### Para Pacientes
1. Acceder con usuario: `paciente` / contraseña: `paciente123`
2. Reservar nuevos turnos
3. Ver turnos próximos
4. Consultar historial

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js (opcional)
- **Base de datos:** PostgreSQL
- **Iconos:** Font Awesome 6.4.0
- **Responsive:** Compatible con dispositivos móviles

## Notas de Seguridad

- Las credenciales mostradas son solo para desarrollo/demostración
- En producción, usar passwords seguros
- Implementar autenticación segura (JWT, OAuth)
- Usar HTTPS en producción
- Validar todos los datos en servidor

## Soporte

Para problemas o dudas sobre el sistema, contactar al equipo de TI del Hospital Central.

---

**Versión:** 1.0
**Última actualización:** Junio 2026
