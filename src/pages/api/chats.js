import { supabase } from '../../lib/supabaseClient';

// Obtener todos los chats de un usuario
export const getChats = async (req, res) => {
  const { userId } = req.query;
  const { data, error } = await supabase.from('chats').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error });
  res.status(200).json(data);
};

// Crear un nuevo chat
export const createChat = async (req, res) => {
  const { userId, chatName } = req.body;
  const { data, error } = await supabase.from('chats').insert([{ user_id: userId, chat_name: chatName, conversation: [] }]);
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getChats(req, res);
  } else if (req.method === 'POST') {
    return createChat(req, res);
  }
}
