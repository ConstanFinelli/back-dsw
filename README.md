# back-dsw
Repositorio donde se encuentra todo el contenido de back-end del TP para desarrollo de software

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- Cuenta de Cloudinary (para manejo de imágenes)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/ConstanFinelli/back-dsw.git
cd back-dsw
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database (MySQL)
DB_NAME=backdsw
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
DB_DEBUG=false

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_aqui

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

4. **Compilar TypeScript**
```bash
npm run build
```

5. **Iniciar el servidor**
```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:3000`

### Usuario Admin por Defecto

Al iniciar por primera vez, se crea automáticamente un usuario administrador:
- **Email:** admin@sistema.com
- **Password:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

## 📚 Estructura del Proyecto

```
back-dsw-4/
├── src/
│   ├── business/          # Gestión de negocios
│   ├── category/          # Categorías de usuarios
│   ├── coupon/            # Sistema de cupones
│   ├── locality/          # Localidades
│   ├── pitch/             # 🏟️ Gestión de canchas
│   ├── reservation/       # Sistema de reservas
│   ├── user/              # Gestión de usuarios
│   ├── user_coupon/       # Relación usuarios-cupones
│   ├── middlewares/       # Middlewares (auth, upload)
│   ├── services/          # Servicios (Cloudinary)
│   ├── shared/            # Configuración compartida
│   │   ├── db/            # Configuración de base de datos
│   │   └── seed/          # Seeding inicial
│   └── app.ts             # Punto de entrada
├── requestFiles/          # Archivos de prueba de API
│   └── pitch/             # 🏟️ Pruebas de canchas
│       ├── request.http   # Peticiones HTTP
│       ├── README.md      # Documentación completa
│       ├── test-pitch-api.js      # Script de pruebas Node.js
│       └── test-frontend.html     # Interfaz de prueba
└── package.json
```

## 🏟️ API de Canchas (Pitches)

El sistema incluye una API completa para gestionar canchas deportivas con las siguientes características:

### Características
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Subida de imágenes a Cloudinary
- ✅ Autenticación JWT
- ✅ Validación de datos
- ✅ Relación con negocios (Business)

### Endpoints Principales

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| GET | `/api/pitchs/getAll` | No | Obtener todas las canchas |
| GET | `/api/pitchs/getOne/:id` | No | Obtener una cancha por ID |
| POST | `/api/pitchs/add` | Sí | Crear nueva cancha |
| PATCH | `/api/pitchs/update/:id` | Sí | Actualizar cancha |
| DELETE | `/api/pitchs/remove/:id` | Sí | Eliminar cancha |

### Campos de una Cancha

```typescript
{
  id: number;                    // ID único
  rating: number;                // Calificación (1-5)
  size: string;                  // pequeño, mediano, grande
  groundType: string;            // césped natural, césped sintético, cemento, arcilla
  roof: boolean;                 // Si tiene techo
  price: number;                 // Precio por hora
  imageUrl?: string;             // URL de la imagen en Cloudinary
  driveFileId?: string;          // ID del archivo en Cloudinary
  business: Business;            // Negocio asociado
  createdAt: Date;               // Fecha de creación
  updatedAt: Date;               // Fecha de actualización
}
```

### Ejemplo de Uso

**Crear una cancha:**
```bash
curl -X POST http://localhost:3000/api/pitchs/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "rating=5" \
  -F "size=mediano" \
  -F "groundType=césped sintético" \
  -F "roof=true" \
  -F "price=5000" \
  -F "business=1" \
  -F "image=@/path/to/image.jpg"
```

**Obtener todas las canchas:**
```bash
curl http://localhost:3000/api/pitchs/getAll
```

### 🧪 Pruebas

Hemos incluido varias formas de probar la API:

1. **Archivo HTTP** (`requestFiles/pitch/request.http`)
   - Usar con extensiones REST Client de VS Code

2. **Script Node.js** (`requestFiles/pitch/test-pitch-api.js`)
   ```bash
   node requestFiles/pitch/test-pitch-api.js
   ```

3. **Interfaz HTML** (`requestFiles/pitch/test-frontend.html`)
   - Abrir directamente en el navegador
   - Interfaz visual para probar todos los endpoints

4. **Documentación Completa** (`requestFiles/pitch/README.md`)
   - Guía detallada de todos los endpoints
   - Ejemplos en múltiples lenguajes
   - Validaciones y errores

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

**Obtener token:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "password": "admin123"
  }'
```

**Usar token:**
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗄️ Base de Datos

El proyecto usa MikroORM con MySQL. Las tablas se crean automáticamente al iniciar el servidor.

### Entidades Principales
- **User**: Usuarios del sistema
- **Category**: Categorías de usuarios (user, business_owner, admin)
- **Business**: Negocios/Complejos deportivos
- **Pitch**: Canchas deportivas
- **Reservation**: Reservas de canchas
- **Coupon**: Cupones de descuento
- **Locality**: Localidades

## 📦 Tecnologías Utilizadas

- **Express**: Framework web
- **TypeScript**: Lenguaje de programación
- **MikroORM**: ORM para base de datos
- **MySQL**: Base de datos
- **JWT**: Autenticación
- **Cloudinary**: Almacenamiento de imágenes
- **Multer**: Manejo de archivos
- **bcryptjs**: Encriptación de contraseñas

## 🛠️ Scripts Disponibles

```bash
npm run build        # Compilar TypeScript
npm run start:dev    # Iniciar en modo desarrollo con watch
```

## 📝 Notas Importantes

1. **Seeding Automático**: Al iniciar por primera vez, se crean automáticamente:
   - 3 categorías de usuarios (user, business_owner, admin)
   - 1 usuario administrador

2. **Imágenes**: Las imágenes se suben a Cloudinary y se eliminan automáticamente al actualizar o eliminar canchas.

3. **CORS**: El servidor tiene CORS habilitado para permitir peticiones desde cualquier origen.

4. **Validaciones**: Todos los endpoints tienen validaciones de datos antes de guardar en la base de datos.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👥 Autores

- Constan Finelli
- [Otros colaboradores]

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación en `requestFiles/pitch/README.md`
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo
