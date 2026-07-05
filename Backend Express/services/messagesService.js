// Constantes de configuration
const MAX_MESSAGE_LENGTH = 5000;

// Vérifie que l'utilisateur connecté fait bien partie de la conversation
async function assertParticipant(db, conversationId, userId) {
  // On récupère la conversation par son id
  const conv = await db.getAsync(
    'SELECT id, user1_id, user2_id FROM conversations WHERE id = ?',
    [conversationId]
  );

  // Si elle n'existe pas → 404
  if (!conv) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  // Si l'utilisateur n'est ni user1 ni user2 de cette conversation → 403 (interdit)
  if (Number(conv.user1_id) !== Number(userId) && Number(conv.user2_id) !== Number(userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  // Sinon on renvoie la conversation
  return conv;
}

// Récupère une conversation existante entre 2 utilisateurs, ou la crée si elle n'existe pas
async function getOrCreateConversation(db, userId1, userId2) {
  // On force la conversion en nombre, pour éviter de stocker des chaînes/NaN en DB
  userId1 = Number(userId1);
  userId2 = Number(userId2);

  // Vérifie que ce sont bien des entiers valides
  if (!Number.isInteger(userId1) || !Number.isInteger(userId2)) {
    const err = new Error('Invalid user id');
    err.status = 400;
    throw err;
  }

  // Interdit de se créer une conversation avec soi-même
  if (userId1 === userId2) {
    const err = new Error('Cannot start a conversation with yourself');
    err.status = 400;
    throw err;
  }

  // On vérifie que le destinataire (userId2) existe vraiment en base
  const recipient = await db.getAsync('SELECT id FROM users WHERE id = ?', [userId2]);
  if (!recipient) {
    const err = new Error('Recipient not found');
    err.status = 404;
    throw err;
  }

  // On cherche si une conversation existe déjà entre ces 2 utilisateurs
  const existing = await db.getAsync(`
    SELECT id FROM conversations
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `, [userId1, userId2, userId2, userId1]);

  // Si elle existe, on renvoie son id directement
  if (existing) return existing.id;

  // Sinon on la crée
  const r = await db.runAsync(
    'INSERT INTO conversations(user1_id, user2_id) VALUES (?,?)',
    [userId1, userId2]
  );
  return r.lastID;
}

// Liste toutes les conversations d'un utilisateur, avec les infos utiles pour l'affichage
async function listConversations(db, userId) {
  return await db.allAsync(`
    SELECT
      c.id,
      c.updated_at,
      -- Récupère l'id de "l'autre" utilisateur (celui qui n'est pas userId)
      CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END AS other_user_id,
      u.name AS other_user_name,
      u.picture AS other_user_picture,
      -- Sous-requête : dernier message de la conversation
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
      -- Sous-requête : nombre de messages non lus envoyés par l'AUTRE utilisateur
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_id != ?) AS unread_count
    FROM conversations c
    -- Jointure pour récupérer le nom/photo de l'autre utilisateur
    JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
    -- On ne garde que les conversations où l'utilisateur est participant
    WHERE c.user1_id = ? OR c.user2_id = ?
    -- Tri par activité la plus récente
    ORDER BY COALESCE(last_message_at, c.updated_at) DESC
  `, [userId, userId, userId, userId, userId]);
}

// Récupère les messages d'une conversation, et marque ceux reçus comme "lus"
async function getMessages(db, conversationId, userId) {
  // Contrôle d'accès : on bloque si l'utilisateur n'est pas dans cette conversation
  await assertParticipant(db, conversationId, userId);

  // Marque comme lus tous les messages reçus (pas envoyés par moi) et pas encore lus
  await db.runAsync(
    'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL',
    [conversationId, userId]
  );

  // Renvoie tous les messages de la conversation, triés du plus ancien au plus récent
  return await db.allAsync(`
    SELECT m.*, u.name AS sender_name, u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `, [conversationId]);
}

// Envoie un message dans une conversation
async function sendMessage(db, conversationId, senderId, content) {
  // Contrôle d'accès : on bloque si l'expéditeur n'est pas dans cette conversation
  await assertParticipant(db, conversationId, senderId);

  // Validation du contenu : doit être une chaîne non vide après trim
  if (typeof content !== 'string' || !content.trim()) {
    const err = new Error('content is required');
    err.status = 400;
    throw err;
  }

  const trimmed = content.trim();

  // Limite de longueur pour éviter d'envoyer des messages énormes
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    const err = new Error(`content must be at most ${MAX_MESSAGE_LENGTH} characters`);
    err.status = 400;
    throw err;
  }

  // Insertion du nouveau message
  const r = await db.runAsync(
    'INSERT INTO messages(conversation_id, sender_id, content) VALUES (?,?,?)',
    [conversationId, senderId, trimmed]
  );

  // On met à jour la date de dernière activité de la conversation
  await db.runAsync(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [conversationId]
  );

  // On renvoie le message créé, avec les infos de l'expéditeur jointes
  return await db.getAsync(`
    SELECT m.*, u.name AS sender_name, u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
  `, [r.lastID]);
}

// Raccourci utilisé pour démarrer une conversation ET envoyer le premier message en une seule fois
async function startConversation(db, senderId, recipientId, content) {
  const conversationId = await getOrCreateConversation(db, senderId, recipientId);
  const message = await sendMessage(db, conversationId, senderId, content);
  return { conversationId, message };
}

// Export des fonctions utilisées par le controller
module.exports = {
  listConversations,
  getMessages,
  sendMessage,
  startConversation,
  getOrCreateConversation,
};