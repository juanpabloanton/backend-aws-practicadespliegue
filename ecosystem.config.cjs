// Carga las variables de .env (nunca se commitea, está en .gitignore)
require('dotenv').config();
const path = require('path');

// Ruta absoluta al loader de tsx: usar el especificador "tsx" a secas falla en
// modo cluster porque Node lo resuelve contra /home/ubuntu en vez de este proyecto.
const tsxLoader = path.join(__dirname, 'node_modules/tsx/dist/loader.mjs');

module.exports = {
  apps: [{
    name: "backend-aws-practicadespliegue",
    script: "src/index.ts",
    interpreter: "node",
    interpreter_args: `--import ${tsxLoader}`, // el proyecto es TS/ESM, no hay build a dist/
    instances: "max",                 // Modo Cluster: usa todos los núcleos de la CPU
    exec_mode: "cluster",
    watch: false,                     // en producción no watchear archivos

    // Producción: variables de entorno (los valores reales viven en .env, no aquí)
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || 3000,
      MONGODB_URI: process.env.MONGODB_URI
    },

    // Logs y Monitoreo del Servidor
    error_file: "/var/www/backend-aws-practicadespliegue/logs/err.log",
    out_file: "/var/www/backend-aws-practicadespliegue/logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true
  }],

  // Automatización del Despliegue desde tu PC local
  deploy: {
    production: {
      user: "ubuntu",
      host: "16.59.147.182",
      ref: "origin/main",
      repo: "git@github.com:juanpabloanton/backend-aws-practicadespliegue.git",
      path: "/var/www/backend-aws-practicadespliegue",
      "post-deploy": "ln -sf /var/www/backend-aws-practicadespliegue/.env .env && npm install && pm2 reload ecosystem.config.cjs --env production && pm2 save",
      ssh_options: 'IdentityFile="C:/Users/Asus Tuf/Documents/Patron_de_diseño_api/practica_despliegue/backend.pem"' // Ruta a tu llave .pem en TU PC LOCAL (Windows)
    }
  }
};
