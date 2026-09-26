import { connectDatabase } from './config/database.js';
import { MongoEmployeeRepository } from './repository/mongo.employee.repository.js';
import { createApp } from './app.js';

// Composition root: el único lugar donde se elige la implementación concreta.
await connectDatabase();

const app = createApp(new MongoEmployeeRepository());
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log('Servidor escuchando en el puerto ' + port);
});
