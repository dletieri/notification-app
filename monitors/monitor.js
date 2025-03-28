const { getDB } = require('../config/db');
const { sendEmail } = require('../services/notification');
const { ObjectId } = require('mongodb');

async function monitorEvents() {
  const db = getDB();
  const eventsCollection = db.collection('events');
  console.log('Iniciando Change Streams na coleção events...');
  const changeStream = eventsCollection.watch();

  changeStream.on('change', async (change) => {
    console.log('Alteração detectada:', change);
    if (change.operationType === 'insert') {
      const event = change.fullDocument;
      console.log('Novo evento detectado:', event);
      await processEvent(event);
    }
  });

  changeStream.on('error', (error) => {
    console.error('Erro no Change Streams:', error);
  });

  console.log('Monitorando eventos...');
}

async function processEvent(event) {
  const db = getDB();

  try {
    // 1. Buscar o EventType associado ao evento
    const eventTypesCollection = db.collection('eventtypes');
    console.log('Nome da coleção:', eventTypesCollection.collectionName);
    console.log('EventTypeID:', event.EventTypeID, 'Tipo:', typeof event.EventTypeID);
    let eventTypeId;
    if (typeof event.EventTypeID === 'string') {
      eventTypeId = new ObjectId(event.EventTypeID);
    } else {
      eventTypeId = event.EventTypeID;
    }
    console.log('Buscando EventType com _id:', eventTypeId);
    const eventType = await eventTypesCollection.findOne({ _id: eventTypeId });
    if (!eventType) {
      console.log('EventType não encontrado para o evento:', event._id);
      // Listar todos os EventTypes para depuração
      const allEventTypes = await eventTypesCollection.find().toArray();
      console.log('Todos os EventTypes na coleção:', allEventTypes);
      return;
    }
    console.log('EventType encontrado:', eventType);

    // 2. Obter o RoleID do EventType
    const roleId = eventType.RoleID;
    if (!roleId) {
      console.log('RoleID não encontrado no EventType:', eventType._id);
      return;
    }
    console.log('RoleID obtido:', roleId, 'Tipo:', typeof roleId);
    if (typeof roleId === 'string') {
      roleId = new ObjectId(roleId);
    }

    // 3. Buscar todos os usuários que possuem esse RoleID no array Roles
    const usersCollection = db.collection('users');
    console.log('Buscando usuários com RoleID:', roleId);
    const users = await usersCollection.find({ Roles: roleId }).toArray();
    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado com o RoleID:', roleId);
      const allUsers = await usersCollection.find().toArray();
      console.log('Todos os usuários na coleção:', allUsers);
      return;
    }
    console.log('Usuários encontrados:', users);

    // 4. Enviar notificação por e-mail para cada usuário
    for (const user of users) {
      console.log(`Enviando notificação para ${user.Name} (Email: ${user.Email})`);
      const result = await sendEmail(
        user.Email,
        `Notify.me - Novo evento reportado para ${event.Name}`,
        `Novo evento reportado em ${event.Date} do tipo ${eventType.Name} (${eventType.Description}). Precisamos da sua atenção! (e também de adicionar mais detalhes aqui...)`
      );
      console.log(result.message);
    }

    // 5. Atualizar o status do evento
    await db.collection('events').updateOne(
      { _id: new ObjectId(event._id) },
      { $set: { status: 'sent', updatedAt: new Date() } }
    );
  } catch (error) {
    console.error('Erro ao processar evento:', error.message);
    await db.collection('events').updateOne(
      { _id: new ObjectId(event._id) },
      { $set: { status: 'failed', updatedAt: new Date() } }
    );
  }
}

module.exports = { monitorEvents };