import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Datos del usuario real (ajusta el ID según tu base de datos)
// Ejecuta: SELECT id, name, email FROM user; para ver tus usuarios
const fakeUser = {
  id: 1, // ⚠️ CAMBIA ESTO por un ID real de tu tabla user
  email: "admin@sistema.com", // Email del usuario admin que creaste
  category: "user", // Puede ser: 'admin', 'business_owner', 'user'
  name: "Usuario de Prueba"
};

// Generar token
const token = jwt.sign(
  fakeUser,
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('\n🔑 TOKEN GENERADO:\n');
console.log(token);
console.log('\n📋 Copia este token y úsalo en el header Authorization:\n');
console.log(`Authorization: Bearer ${token}`);
console.log('\n👤 Usuario fake:', fakeUser);
console.log('\n⏰ Expira en: 24 horas\n');
