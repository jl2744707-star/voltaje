function ingresar() {
    const usuario = document.getElementById('usuario').value;
    const pass = document.getElementById('contraseña').value;

    // Credenciales de prueba para el sistema de turnos del hospital
    if (usuario === "admin" && pass === "admin123") {
        window.location.href = "admin.html";
    } 
    else if (usuario === "medico" && pass === "medico123") {
        window.location.href = "profesor.html"; 
    } 
    else if (usuario === "paciente" && pass === "paciente123") {
        window.location.href = "alumno.html";
    } 
    else {
        alert("Usuario o contraseña incorrectos. Por favor, intente de nuevo. Use:\n\nAdmin: admin/admin123\nMédico: medico/medico123\nPaciente: paciente/paciente123");
    }
}