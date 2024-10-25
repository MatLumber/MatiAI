import { supabase } from '../../lib/supabaseClient';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { userId, chatId, message } = req.body;

  // Obtener el historial del chat
  const { data: chat } = await supabase.from('chats').select('conversation').eq('id', chatId).single();

  const conversation = chat.conversation || [];
  conversation.push({ user: message });

  // Llamar a OpenAI API
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: conversation.map(msg => ({ role: 'user', content: msg.user })),
  });

  const botReply = response.data.choices[0].message.content;
  conversation.push({ bot: botReply });

  // Actualizar la conversación en la base de datos
  await supabase.from('chats').update({ conversation }).eq('id', chatId);

  res.json({ botReply });
}
