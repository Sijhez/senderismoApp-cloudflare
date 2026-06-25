# Andare - App de Senderismo

Comunidad web para compartir y explorar rutas de senderismo en Mexico. Los usuarios pueden registrarse, crear un perfil, subir rutas con imagenes y explorar las rutas de otros senderistas.

## Stack

- **Backend:** Node.js, Express 5, Mongoose
- **Vistas:** Handlebars (HBS)
- **Base de datos:** MongoDB
- **Autenticacion:** bcryptjs + express-session
- **Estilos:** Tailwind CSS 2 + Bootstrap 4 (CDN)
- **Deploy:** Cloudflare Workers (Hono + pre-compiled templates)

## Estructura del proyecto

```
├── config/             # Conexion a DB y sesion (Express)
├── controllers/        # Logica de negocio (Express)
├── middlewares/         # Route guards (Express)
├── models/             # Esquemas Mongoose (compartidos)
├── views/              # Templates Handlebars (compartidos)
├── public/             # Assets estaticos (compartidos)
├── routes/             # Rutas Express
├── seeds/              # Datos iniciales para la DB
├── scripts/            # Build de templates para Workers
├── src/                # Entrada para Cloudflare Workers (Hono)
│   ├── lib/            # DB, sesion, render
│   ├── middleware/     # Route guards (Hono)
│   └── routes/         # Rutas Hono
├── index.js            # Entrada Express (local)
└── wrangler.toml       # Configuracion Cloudflare Workers
```

---

## Entorno Local

### Requisitos

- Node.js >= 18
- MongoDB corriendo localmente o una URI de MongoDB Atlas
- npm

### Instalacion

```bash
git clone https://github.com/Sijhez/proyectoAppSenderismo.git
cd proyectoAppSenderismo
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raiz del proyecto:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/senderismoapp
SESSION=tuPalabraSecreta
```

### Seed de datos (opcional)

Para poblar la base de datos con rutas de ejemplo:

```bash
node seeds/routesSeeds.js
```

### Ejecutar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Produccion
npm start
```

La app estara disponible en `http://localhost:3000`.

---

## Deploy en Cloudflare Workers

La app tiene un segundo entry point en `src/index.js` usando **Hono**, adaptado para el runtime de Cloudflare Workers.

### Diferencias con el entorno local

| Componente | Local (Express) | Workers (Hono) |
|---|---|---|
| Framework | Express 5 | Hono |
| Sesiones | connect-mongo (MongoDB) | Cookies firmadas con HMAC-SHA256 |
| Templates | HBS en runtime | Pre-compilados en build |
| Assets | express.static | Workers Static Assets |
| Entry point | `index.js` | `src/index.js` |

### Requisitos

- Cuenta en Cloudflare (plan gratuito funciona)
- MongoDB Atlas (u otro MongoDB accesible desde internet)
- Wrangler CLI (incluido como devDependency)

### Configuracion

1. **MongoDB Atlas** — Crear un cluster gratuito en [mongodb.com/atlas](https://www.mongodb.com/atlas) y obtener la URI de conexion.

2. **Variables de entorno en Cloudflare** — En el dashboard de Cloudflare ir a **Workers & Pages > tu worker > Settings > Variables** y agregar:

   | Variable | Valor |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://usuario:password@cluster.mongodb.net/senderismoapp` |
   | `SESSION` | Una cadena secreta larga y aleatoria |

   > Si la conexion SRV falla, usar el formato `mongodb://` con el host directo del cluster.

3. **Login en Wrangler:**

   ```bash
   npx wrangler login
   ```

### Testing local del Worker

Crear un archivo `.dev.vars` en la raiz (no se sube a git):

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/senderismoapp
SESSION=tuPalabraSecreta
```

```bash
npm run dev:worker
```

### Deploy

```bash
npm run deploy
```

Esto ejecuta automticamente:
1. Pre-compila las plantillas HBS a JavaScript (`scripts/build-templates.js`)
2. Empaqueta y sube el Worker a Cloudflare

### Scripts disponibles

| Script | Descripcion |
|---|---|
| `npm start` | Inicia la app Express en produccion |
| `npm run dev` | Inicia Express con nodemon (auto-reload) |
| `npm run dev:worker` | Inicia el Worker localmente con Wrangler |
| `npm run build:templates` | Pre-compila las plantillas HBS |
| `npm run deploy` | Compila templates y despliega a Cloudflare |

---

## Funcionalidades

- Registro e inicio de sesion con validacion de password
- Perfiles de usuario con foto, datos personales y nivel de experiencia
- Crear, editar y eliminar rutas de senderismo (hasta 6 imagenes por ruta)
- Explorar todas las rutas publicadas
- Vista detallada de ruta con galeria de imagenes
- Controles de autor: solo el creador puede editar/eliminar su ruta
