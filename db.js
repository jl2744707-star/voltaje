const { Pool } = require('pg');

// Configuración de conexión a la base de datos PostgreSQL
// Para el sistema de gestión de turnos del Hospital Central
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hospital_turnos',
    password: 'hospital2026',
    port: 5432,
});

module.exports = { pool };