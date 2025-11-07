🏃‍♀️ Mi Diario de Carreras

Aplicación web para registrar entrenamientos (running, bici, caminata, etc.), visualizar métricas básicas y guardar la información de forma local o en una API real con Express + MySQL.
___________________________________________________________________________________________________________

✨ Funcionalidades
Registro de entrenamientos

📅 fecha (YYYY-MM-DD)

🏃 tipo (Running, Bicicleta, Caminata, Otra)

📏 distancia (km)

⏱️ duración (HH:MM:SS o MM:SS)

🔥 intensidad (Baja, Media, Alta)

🙂 sentimiento (Feliz, Cansada, etc.)

♀️ ciclo_menstrual (Folicular, Ovulatoria, Lútea, Menstrual) – opcional

🍌 alimentacion_previa (texto) – opcional

📝 comentarios

Lista de registros con

✅ chips de colores por intensidad, sentimiento y ciclo

🧮 cálculo automático del pace (min/km)

📊 resumen de total de km y cantidad de entradas

✏️ edición con modo inline

🗑️ eliminación

Persistencia

💾 localStorage (modo demo, sin servidor)

🌐 API real (Express + MySQL) si está disponible
_________________________________________________________________________________

🧱 Estructura del proyecto
.
├─ index.html
├─ style.css
├─ README.md
│
├─ helpers/
│  └─ utils.js           # helpers reutilizables (fecha, pace, etc.)
│
├─ data/
│  └─ api.js             # capa HTTP cruda: fetch a API Express
│
├─ ui/
│  ├─ data-layer.js      # decide origen: API real o LocalStorage fallback
│  ├─ form.js            # lógica del formulario: leer/validar/llenar/editar
│  ├─ render.js          # render del listado + resumen + chips
│  └─ index.js           # “pegamento”: conecta UI, data y render
│
└─ server/               # backend Node + Express (opcional)
   ├─ server.js
   ├─ db-mysql.js
   └─ sql/
      ├─ 001_schema.sql  # CREATE DATABASE/TABLE
      ├─ 002_seed.sql    # datos iniciales
      └─ 003_queries.sql # consultas útiles
__________________________________________________________________________________
🔄 Flujo de la UI
flowchart TD
  U[Usuario] --> F[ui/form.js]
  F --> I[ui/index.js]
  I --> D[ui/data-layer.js]
  D -->|si hay API| A[data/api.js]
  D -->|si no| LS[localStorage]
  A --> R[ui/render.js]
  LS --> R
  R --> UI[Pantalla]
____________________________________________________________________________________
▶️ Cómo ejecutar (solo front)

Abrir el proyecto en VS Code.

Usar Live Server o abrir index.html en el navegador.

Registrar entrenamientos desde el formulario.

Los datos se guardan en localStorage.

____________________________________________________________________________________

🗄️ Usar con API real (Express + MySQL)

Tener MySQL corriendo y crear BD/tablas con:

server/sql/001_schema.sql

server/sql/002_seed.sql

Configurar credenciales en db-mysql.js:

MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DB


Instalar dependencias y levantar servidor:

cd server
npm install
node server.js


La API se expone en:

GET /api/entrenamientos

POST /api/entrenamientos

PUT /api/entrenamientos/:id

DELETE /api/entrenamientos/:id

En index.html ya está configurado:

<script>window.API_BASE = 'http://localhost:3000/api';</script>


👉 Si la API responde, la UI muestra “Origen de datos: API (entrenamientos)”.
👉 Si no, cae automáticamente a LocalStorage.
_____________________________________________________________________________________
🧪 Consistencia de nombres

Todos los campos viajan con los mismos nombres en HTML → UI → API → BD:

fecha, tipo, distancia_km, duracion, intensidad,
sentimiento, ciclo_menstrual, alimentacion_previa, descripcion
______________________________________________________________________________________

🧩 Buenas prácticas aplicadas

✔️ Separación clara por capas

✔️ Comentarios y secciones

✔️ Fallback seguro a localStorage

✔️ API REST limpia y consistente

✔️ Integración de variables deportivas específicas (alimentación, ciclo menstrual)
_______________________________________________________________________________________
🚀 Próximos pasos

🔜 Filtros por fecha y tipo

🔜 Exportar a CSV

🔜 Gráficos de evolución