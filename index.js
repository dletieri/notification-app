const { connectDB } = require('./config/db');
const { monitorEvents } = require('./monitors/monitor');

async function start() {
  await connectDB();
  await monitorEvents();
  console.log('Aplicação iniciada');
}

start();