# GUÍA RÁPIDA - Sistema de Turnos Hospital Central

## 🚀 Inicio Rápido

### Credenciales de Acceso

**Página de inicio:** [inicio.html](inicio.html)

#### Opción 1: Acceso como Administrador
```
Usuario: admin
Contraseña: admin123
→ Acceso: Panel Administrativo Completo
```

#### Opción 2: Acceso como Médico
```
Usuario: medico
Contraseña: medico123
→ Acceso: Portal Médico
```

#### Opción 3: Acceso como Paciente
```
Usuario: paciente
Contraseña: paciente123
→ Acceso: Portal Paciente
```

---

## 📋 Funcionalidades Principales

### Para Administradores (admin)
1. **Gestionar Turnos** - Crear, modificar y cancelar turnos
2. **Registrar Médicos** - Agregar nuevos médicos al sistema
3. **Ver Especialidades** - Gestionar especialidades disponibles
4. **Horarios** - Configurar horarios de atención
5. **Reportes** - Reporte de asistencia y turnos realizados

### Para Médicos (medico)
1. **Ver Mi Horario** - Consultar agenda personal
2. **Turnos del Día** - Ver los turnos programados
3. **Mis Pacientes** - Lista de pacientes
4. **Disponibilidades** - Configurar mis horarios disponibles

### Para Pacientes (paciente)
1. **Mis Turnos** - Ver turnos próximos
2. **Reservar Turno** - Agendar nuevo turno médico
3. **Historial** - Ver turnos anteriores
4. **Ver Médicos** - Consultar especialidades y médicos
5. **Mis Datos** - Información personal

---

## 🏗️ Estructura del Sistema

### Especialidades Disponibles
- **Cardiología** - Dr. López
- **Pediatría** - Dra. García
- **Dermatología** - (disponible)
- **Traumatología** - Dr. Rodríguez
- **Oftalmología** - Dra. Martínez
- **Neurología** - (disponible)
- **Psicología** - (disponible)
- **Medicina General** - (disponible)

### Horarios de Atención
- **Mañana:** 08:00 - 12:30 (con descanso 10:00-10:15)
- **Tarde:** 14:00 - 18:00
- **Turnos por franja:** 3 turnos por hora

### Estados de Turnos
- ✅ **Confirmado** - Turno confirmado
- ⏳ **Pendiente** - Esperando confirmación
- ❌ **Cancelado** - Turno cancelado
- 📋 **Completado** - Turno realizado

---

## 🔧 Procedimientos Comunes

### Registrar un Nuevo Médico (Admin)
1. Acceder como Administrador
2. Ir a "Registrar Médico"
3. Completar formulario:
   - Nombre, Apellido, DNI
   - Email, Teléfono
   - Seleccionar Especialidad
   - Crear Usuario y Contraseña
4. Guardar

### Crear un Nuevo Turno (Admin)
1. Acceder a "Gestionar Turnos"
2. Click en "Nuevo Turno"
3. Seleccionar:
   - Paciente
   - Médico/Especialidad
   - Fecha y Hora
4. Confirmar turno

### Reservar Turno (Paciente)
1. Ir a "Reservar Turno"
2. Seleccionar:
   - Especialidad médica
   - Médico preferido
   - Fecha disponible
   - Horario disponible
3. Confirmar reserva

### Ver Horario Disponible (Médico)
1. Entrar a "Mi Horario"
2. Seleccionar semana
3. Ver disponibilidades por día
4. Actualizar disponibilidad si es necesario

---

## 💾 Base de Datos

**Sistema:** PostgreSQL
**Base de datos:** hospital_turnos
**Usuario:** postgres
**Puerto:** 5432

### Tablas Principales
- `usuarios` - Usuarios del sistema
- `turnos` - Registro de turnos
- `medicos` - Información de médicos
- `pacientes` - Datos de pacientes
- `especialidades` - Especialidades médicas

---

## 📞 Información de Contacto

**Hospital Central**
- Teléfono: +54 (11) XXXX-XXXX
- Email: turnos@hospitalcentral.gov
- Emergencias: 911

---

## 🐛 Solución de Problemas

### No puedo acceder con mis credenciales
- Verificar que el usuario y contraseña sean correctos
- Asegurar que Caps Lock esté apagado
- Limpiar caché del navegador

### El sistema es lento
- Verificar conexión a internet
- Reiniciar navegador
- Limpiar caché de navegador

### No puedo ver datos en las tablas
- Verificar que hay datos en la base de datos
- Asegurar conexión a PostgreSQL
- Revisar logs de error

---

## ℹ️ Información General

- **Versión:** 1.0
- **Última actualización:** Junio 2026
- **Navegador recomendado:** Chrome, Firefox, Safari, Edge
- **Responsive:** Compatible con dispositivos móviles
- **Idioma:** Español

---

**¡Bienvenido al Sistema de Turnos del Hospital Central!**
