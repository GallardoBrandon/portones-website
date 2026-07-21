# Portones & Mercancía - Sistema de Gestión

## Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

## Estructura de la Base de Datos

### Tabla: `customers`
- `id` - ID del cliente
- `name` - Nombre
- `email` - Email
- `phone` - Teléfono
- `message` - Mensaje
- `created_at` - Fecha de creación

### Tabla: `products`
- `id` - ID del producto
- `name` - Nombre del producto
- `price` - Precio
- `description` - Descripción
- `updated_at` - Fecha de última actualización

### Tabla: `images`
- `id` - ID de la imagen
- `title` - Título de la imagen
- `image_data` - Datos de la imagen (base64)
- `created_at` - Fecha de creación

## API Endpoints

### Clientes
- `POST /api/customers` - Crear cliente
- `GET /api/customers` - Listar clientes

### Productos
- `GET /api/products` - Listar productos
- `PUT /api/products/:id` - Actualizar precio de producto

### Imágenes
- `POST /api/images` - Subir imagen
- `GET /api/images` - Listar imágenes
- `GET /api/images/:id` - Obtener datos de imagen
- `DELETE /api/images/:id` - Eliminar imagen

## Autenticación Admin
- **Usuario**: (sin usuario, solo contraseña)
- **Contraseña por defecto**: `admin123`
- **Para cambiar**: editar variable `ADMIN_PASSWORD` en `script.js`

## Características

✅ Panel administrativo separado
✅ Gestión de precios en tiempo real
✅ Subida de imágenes
✅ Base de datos SQLite
✅ API REST
✅ Formulario de contacto con guardado en BD
✅ Interfaz responsive

## Archivos
- `server.js` - Servidor Express
- `database.js` - Configuración de SQLite
- `index.html` - Frontend
- `script.js` - Lógica del cliente
- `styles.css` - Estilos
- `package.json` - Dependencias
- `database.db` - Base de datos (se crea automáticamente)
