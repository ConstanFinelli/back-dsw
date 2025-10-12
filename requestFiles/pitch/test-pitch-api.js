/**
 * Script de prueba para la API de Canchas
 * 
 * Uso:
 * 1. Asegúrate de que el servidor esté corriendo en http://localhost:3000
 * 2. Ejecuta: node test-pitch-api.js
 * 
 * Requisitos:
 * - Node.js instalado
 * - Servidor backend corriendo
 * - Usuario admin creado (email: admin@sistema.com, password: admin123)
 */

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Función auxiliar para hacer peticiones
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json();
  return { status: response.status, data };
}

// 1. Login para obtener token
async function login() {
  console.log('\n🔐 1. Login...');
  const result = await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@sistema.com',
      password: 'admin123'
    })
  });

  if (result.status === 200 && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login exitoso');
    console.log('Token:', authToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Error en login:', result.data);
    throw new Error('Login failed');
  }
}

// 2. Obtener todas las canchas
async function getAllPitches() {
  console.log('\n📋 2. Obtener todas las canchas...');
  const result = await request('/pitchs/getAll');

  if (result.status === 200) {
    console.log(`✅ Se encontraron ${result.data.data.length} canchas`);
    result.data.data.forEach(pitch => {
      console.log(`  - Cancha #${pitch.id}: ${pitch.size}, ${pitch.groundType}, $${pitch.price}`);
    });
  } else {
    console.log('❌ Error:', result.data);
  }

  return result.data.data;
}

// 3. Obtener una cancha específica
async function getPitchById(id) {
  console.log(`\n🔍 3. Obtener cancha #${id}...`);
  const result = await request(`/pitchs/getOne/${id}`);

  if (result.status === 200) {
    console.log('✅ Cancha encontrada:');
    console.log('  ID:', result.data.data.id);
    console.log('  Rating:', result.data.data.rating);
    console.log('  Size:', result.data.data.size);
    console.log('  Ground Type:', result.data.data.groundType);
    console.log('  Roof:', result.data.data.roof);
    console.log('  Price:', result.data.data.price);
    console.log('  Image URL:', result.data.data.imageUrl || 'Sin imagen');
  } else {
    console.log('❌ Error:', result.data);
  }

  return result.data.data;
}

// 4. Crear una nueva cancha (sin imagen)
async function createPitch() {
  console.log('\n➕ 4. Crear nueva cancha...');
  
  // Nota: Para enviar con imagen, necesitarías usar FormData
  // Este ejemplo crea una cancha sin imagen
  const pitchData = {
    rating: 5,
    size: 'mediano',
    groundType: 'césped sintético',
    roof: true,
    price: 5000,
    business: 1
  };

  // Para crear con form-data (sin imagen)
  const formData = new URLSearchParams();
  Object.entries(pitchData).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  const result = await request('/pitchs/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (result.status === 201) {
    console.log('✅ Cancha creada exitosamente');
    console.log('  ID:', result.data.data.id);
    console.log('  Size:', result.data.data.size);
    console.log('  Price:', result.data.data.price);
    return result.data.data;
  } else {
    console.log('❌ Error al crear cancha:', result.data);
    return null;
  }
}

// 5. Actualizar una cancha
async function updatePitch(id) {
  console.log(`\n✏️ 5. Actualizar cancha #${id}...`);

  const updateData = {
    rating: 4,
    price: 6000
  };

  const formData = new URLSearchParams();
  Object.entries(updateData).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  const result = await request(`/pitchs/update/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (result.status === 200) {
    console.log('✅ Cancha actualizada exitosamente');
    console.log('  Rating:', result.data.data.rating);
    console.log('  Price:', result.data.data.price);
    console.log('  Message:', result.data.message);
  } else {
    console.log('❌ Error al actualizar:', result.data);
  }

  return result.data.data;
}

// 6. Eliminar una cancha
async function deletePitch(id) {
  console.log(`\n🗑️ 6. Eliminar cancha #${id}...`);

  const result = await request(`/pitchs/remove/${id}`, {
    method: 'DELETE'
  });

  if (result.status === 200) {
    console.log('✅ Cancha eliminada exitosamente');
    console.log('  Message:', result.data.message);
  } else {
    console.log('❌ Error al eliminar:', result.data);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de API de Canchas...');
    console.log('=' .repeat(50));

    // 1. Login
    await login();

    // 2. Obtener todas las canchas
    const pitches = await getAllPitches();

    // 3. Obtener una cancha específica (si existe)
    if (pitches.length > 0) {
      await getPitchById(pitches[0].id);
    }

    // 4. Crear nueva cancha
    const newPitch = await createPitch();

    // 5. Actualizar la cancha creada
    if (newPitch) {
      await updatePitch(newPitch.id);
      
      // 6. Eliminar la cancha creada
      await deletePitch(newPitch.id);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    console.error(error);
  }
}

// Ejecutar pruebas
main();
