// Carga las variables de .env (nunca se commitea, está en .gitignore)
require('dotenv').config();

module.exports = {
  apps: [{
    name: "backend-aws-practicadespliegue",
    script: "src/index.ts",
    interpreter: "node",
    interpreter_args: "--import tsx", // el proyecto es TS/ESM, no hay build a dist/
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
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production && pm2 save",
      ssh_options: 'IdentityFile=C:/Users/ASUSTU~1/DOCUME~1/PATRON~1/PRACTI~3/backend.pem' // Ruta corta (8.3) a tu llave .pem en TU PC LOCAL (Windows), sin espacios para evitar problemas de parseo de ssh
    }
  }
};
