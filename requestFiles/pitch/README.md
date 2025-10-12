# API de Canchas (Pitches)

## Descripción
API para gestionar canchas deportivas con soporte para imágenes usando Cloudinary.

## Endpoints Disponibles

### 1. Obtener todas las canchas
```http
GET /api/pitchs/getAll
```
**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "rating": 5,
      "size": "mediano",
      "groundType": "césped sintético",
      "roof": true,
      "price": 5000,
      "imageUrl": "https://res.cloudinary.com/...",
      "driveFileId": "courts/court_1_...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "business": {
        "id": 1,
        "businessName": "Complejo Deportivo XYZ"
      }
    }
  ]
}
```

---

### 2. Obtener una cancha por ID
```http
GET /api/pitchs/getOne/:id
```
**Autenticación:** No requerida

**Parámetros:**
- `id` (number): ID de la cancha

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "rating": 5,
    "size": "mediano",
    "groundType": "césped sintético",
    "roof": true,
    "price": 5000,
    "imageUrl": "https://res.cloudinary.com/...",
    "business": { ... }
  }
}
```

**Respuesta error (404):**
```json
{
  "error": "Pitch not found"
}
```

---

### 3. Crear nueva cancha
```http
POST /api/pitchs/add
```
**Autenticación:** Requerida (admin o business_owner)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
| Campo | Tipo | Requerido | Valores permitidos | Descripción |
|-------|------|-----------|-------------------|-------------|
| rating | number | Sí | 1-5 | Calificación de la cancha |
| size | string | Sí | pequeño, mediano, grande | Tamaño de la cancha |
| groundType | string | Sí | césped natural, césped sintético, cemento, arcilla | Tipo de superficie |
| roof | boolean | Sí | true, false | Si tiene techo |
| price | number | Sí | > 0 | Precio por hora |
| business | number | Sí | > 0 | ID del negocio |
| image | file | No | jpg, png, gif, etc. | Imagen de la cancha (max 5MB) |

**Ejemplo con cURL:**
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

**Respuesta exitosa (201):**
```json
{
  "data": {
    "id": 1,
    "rating": 5,
    "size": "mediano",
    "groundType": "césped sintético",
    "roof": true,
    "price": 5000,
    "imageUrl": "https://res.cloudinary.com/...",
    "driveFileId": "courts/court_1_...",
    "business": { ... }
  }
}
```

**Respuestas de error:**
- `400`: Datos inválidos
- `401`: No autenticado
- `403`: Sin permisos
- `500`: Error del servidor

---

### 4. Actualizar cancha
```http
PATCH /api/pitchs/update/:id
```
**Autenticación:** Requerida (admin o business_owner)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
Todos los campos son opcionales. Solo envía los que quieres actualizar.

| Campo | Tipo | Valores permitidos |
|-------|------|-------------------|
| rating | number | 1-5 |
| size | string | pequeño, mediano, grande |
| groundType | string | césped natural, césped sintético, cemento, arcilla |
| roof | boolean | true, false |
| price | number | > 0 |
| image | file | jpg, png, gif, etc. (max 5MB) |

**Nota:** Si envías una nueva imagen, la anterior se eliminará automáticamente de Cloudinary.

**Ejemplo con cURL:**
```bash
curl -X PATCH http://localhost:3000/api/pitchs/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "rating=4" \
  -F "price=6000" \
  -F "image=@/path/to/new-image.jpg"
```

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "rating": 4,
    "price": 6000,
    "imageUrl": "https://res.cloudinary.com/...",
    ...
  },
  "message": "Pitch updated successfully"
}
```

---

### 5. Eliminar cancha
```http
DELETE /api/pitchs/remove/:id
```
**Autenticación:** Requerida (admin o business_owner)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Parámetros:**
- `id` (number): ID de la cancha a eliminar

**Nota:** La imagen asociada se eliminará automáticamente de Cloudinary.

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "rating": 5,
    ...
  },
  "message": "Pitch deleted successfully"
}
```

---

## Validaciones

### Rating
- Debe ser un número entre 1 y 5
- Error: `"Rating must be between 1 and 5"`

### Size
- Valores permitidos: `pequeño`, `mediano`, `grande`
- Error: `"Invalid size. Must be: pequeño, mediano, grande"`

### Ground Type
- Valores permitidos: `césped natural`, `césped sintético`, `cemento`, `arcilla`
- Error: `"Invalid ground type"`

### Roof
- Debe ser un booleano (`true` o `false`)
- Se acepta como string: `"true"` o `"false"`

### Price
- Debe ser un número positivo
- Error: `"Price must be a positive number"`

### Business
- Debe ser un ID válido (número > 0)
- Error: `"Invalid business ID"`

### Image
- Formatos permitidos: jpg, jpeg, png, gif, webp, svg, bmp, etc.
- Tamaño máximo: 5MB
- Error: `"Only images allowed"` o `"File too large"`

---

## Autenticación

Para obtener un token JWT, primero debes hacer login:

```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@sistema.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@sistema.com",
    "category": "admin"
  }
}
```

Usa el token en el header `Authorization: Bearer TOKEN` para las rutas protegidas.

---

## Ejemplos de uso con JavaScript/Fetch

### Obtener todas las canchas
```javascript
fetch('http://localhost:3000/api/pitchs/getAll')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### Crear cancha con imagen
```javascript
const formData = new FormData();
formData.append('rating', '5');
formData.append('size', 'mediano');
formData.append('groundType', 'césped sintético');
formData.append('roof', 'true');
formData.append('price', '5000');
formData.append('business', '1');
formData.append('image', fileInput.files[0]); // desde un input file

fetch('http://localhost:3000/api/pitchs/add', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Actualizar cancha
```javascript
const formData = new FormData();
formData.append('rating', '4');
formData.append('price', '6000');

fetch('http://localhost:3000/api/pitchs/update/1', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Eliminar cancha
```javascript
fetch('http://localhost:3000/api/pitchs/remove/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Configuración de Cloudinary

Asegúrate de tener configuradas las siguientes variables de entorno en tu archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Las imágenes se subirán a la carpeta `courts/` en tu cuenta de Cloudinary.

---

## Estructura de la Base de Datos

### Tabla: pitch

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int | Primary Key, Auto Increment |
| rating | int | Calificación 1-5 |
| size | varchar | Tamaño de la cancha |
| groundType | varchar | Tipo de superficie |
| roof | boolean | Si tiene techo |
| price | decimal | Precio por hora |
| imageUrl | varchar | URL pública de la imagen |
| driveFileId | varchar | ID del archivo en Cloudinary |
| business_id | int | Foreign Key a Business |
| createdAt | datetime | Fecha de creación |
| updatedAt | datetime | Fecha de actualización |

---

## Notas Importantes

1. **Imágenes**: Al actualizar o eliminar una cancha con imagen, la imagen anterior se elimina automáticamente de Cloudinary.

2. **Permisos**: Solo usuarios con rol `admin` o `business_owner` pueden crear, actualizar o eliminar canchas.

3. **Relaciones**: Cada cancha debe estar asociada a un negocio (Business) existente.

4. **Validación**: Todos los datos son validados antes de ser guardados en la base de datos.

5. **CORS**: El servidor tiene CORS habilitado para permitir peticiones desde cualquier origen.

---

## Testing con Postman/Insomnia

1. Importa la colección desde `request.http`
2. Configura las variables de entorno:
   - `baseUrl`: http://localhost:3000/api
   - `token`: Tu JWT token
3. Ejecuta los endpoints en orden:
   - Login para obtener token
   - GET All para ver canchas existentes
   - POST Add para crear nueva cancha
   - PATCH Update para actualizar
   - DELETE Remove para eliminar
