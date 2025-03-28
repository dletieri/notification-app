const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('eventdb');
    console.log('Conectado ao MongoDB com sucesso');
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    console.error('Banco de dados não foi inicializado!');
    process.exit(1);
  }
  return db;
}

module.exports = { connectDB, getDB };