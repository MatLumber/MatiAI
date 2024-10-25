import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Cargar los chats del usuario
  useEffect(() => {
    async function fetchChats() {
      const { data, error } = await supabase.from('chats').select('*');
      if (!error) setChats(data);
    }
    fetchChats();
  }, []);

  // Cargar los mensajes del chat seleccionado
  useEffect(() => {
    if (selectedChat) {
      async function fetchMessages() {
        const { data } = await supabase.from('chats').select('conversation').eq('id', selectedChat.id).single();
        setMessages(data.conversation || []);
      }
      fetchMessages();
    }
  }, [selectedChat]);

  // Manejar el envío de un nuevo mensaje
  async function handleSendMessage() {
    const updatedMessages = [...messages, { user: newMessage }];
    setMessages(updatedMessages);
    
    // Llamar a la API para enviar el mensaje al backend
    await supabase.from('chats').update({ conversation: updatedMessages }).eq('id', selectedChat.id);
    setNewMessage('');
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Chats</h2>
        <ul>
          {chats.map(chat => (
            <li key={chat.id} onClick={() => setSelectedChat(chat)}>
              {chat.chat_name}
            </li>
          ))}
        </ul>
      </aside>
      
      <main className={styles.chatWindow}>
        {selectedChat ? (
          <>
            <div className={styles.messages}>
              {messages.map((message, index) => (
                <div key={index} className={message.user ? styles.userMessage : styles.botMessage}>
                  {message.user || message.bot}
                </div>
              ))}
            </div>
            <div className={styles.messageInput}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
              />
              <button onClick={handleSendMessage}>Enviar</button>
            </div>
          </>
        ) : (
          <p>Selecciona un chat para empezar a conversar</p>
        )}
      </main>
    </div>
  );
}

// Función para manejar la subida de archivos
async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const { data, error } = await supabase.storage
    .from('chat-uploads')
    .upload(`uploads/${file.name}`, file);

  if (error) {
    console.error(error);
    return;
  }

  // Añadir el enlace del archivo subido a la conversación
  const fileUrl = data.Key; // Guardar la URL del archivo subido
  const updatedMessages = [...messages, { user: `Archivo subido: ${fileUrl}` }];
  setMessages(updatedMessages);
  
  // Guardar el enlace del archivo en el historial del chat
  await supabase.from('chats').update({ conversation: updatedMessages }).eq('id', selectedChat.id);
}

return (
  <>
    {/* Input de texto */}
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Escribe tu mensaje..."
    />
    
    {/* Botón de envío */}
    <button onClick={handleSendMessage}>Enviar</button>

    {/* Input de subida de archivos */}
    <input type="file" onChange={handleFileUpload} />
  </>
);

