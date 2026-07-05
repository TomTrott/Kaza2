// On importe les fonctions métier (logique + accès DB) depuis le service
const {
  listConversations,
  getMessages,
  sendMessage,
  startConversation,
  getOrCreateConversation,
} = require('../services/messagesService');

// Petit helper : si l'erreur a un code de statut HTTP défini (400, 403, 404...), on l'utilise
function statusFromError(e) {
  if (e && e.status) return e.status;
  return 500;
}

// Vérifie qu'une valeur (venant de req.params ou req.body) est bien un entier positif valide
function toValidId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// liste les conversations de l'utilisateur connecté
async function list(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id; // vient du middleware requireAuth
    const conversations = await listConversations(db, userId);
    res.json(conversations);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

//récupère les messages d'une conversation
async function getConversationMessages(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;

    // Validation de l'id de conversation reçu dans l'URL
    const conversationId = toValidId(req.params.id);
    if (!conversationId) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }

    const messages = await getMessages(db, conversationId, userId);
    res.json(messages);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

// envoie un message dans une conversation existante
async function send(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;

    const conversationId = toValidId(req.params.id);
    if (!conversationId) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }

    const { content } = req.body;
    const message = await sendMessage(db, conversationId, userId, content);
    res.status(201).json(message); // 201 = ressource créée
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

// crée (ou récupère) une conversation ET envoie le premier message
async function start(req, res) {
  const db = req.app.locals.db;
  try {
    const senderId = req.user.id;

    // Validation du destinataire envoyé dans le body
    const recipientId = toValidId(req.body.recipient_id);
    if (!recipientId) {
      return res.status(400).json({ error: 'recipient_id is required and must be a valid id' });
    }

    const { content } = req.body;
    const result = await startConversation(db, senderId, recipientId, content);
    res.status(201).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

// récupère l'id d'une conversation existante, ou la crée (sans envoyer de message)
async function getOrCreate(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;

    const recipientId = toValidId(req.body.recipient_id);
    if (!recipientId) {
      return res.status(400).json({ error: 'recipient_id is required and must be a valid id' });
    }

    const conversationId = await getOrCreateConversation(db, userId, recipientId);
    res.json({ conversationId });
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = { list, getConversationMessages, send, start, getOrCreate };