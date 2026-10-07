import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { useSearchParams } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artist');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !artistId) return;

    // Fetch chat partner info
    const fetchPartner = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', artistId)
        .single();
      if (!error && data) {
        setChatPartner(data);
      }
    };
    fetchPartner();

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${artistId}),and(sender_id.eq.${artistId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };
    fetchMessages();

    // Subscribe to new messages via Supabase Realtime
    const channel = supabase
      .channel('chat_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`, // listen to messages sent to me
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, artistId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !artistId) return;

    const msg = {
      sender_id: user.id,
      receiver_id: artistId,
      content: newMessage.trim(),
    };

    // Optimistic UI update
    const tempMsg: Message = { ...msg, id: Math.random().toString(), created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([msg]);
    if (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">
          Inicia sesión para usar el chat.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
        <div className="bg-gray-800 rounded-t-xl p-4 border-b border-gray-700 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
             {chatPartner && (
               <img 
                 src={chatPartner.profile_image_url || `https://ui-avatars.com/api/?name=${chatPartner.full_name || 'User'}&background=random`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
               />
             )}
          </div>
          <div>
            <h2 className="text-white font-bold">{chatPartner?.full_name || 'Cargando...'}</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400 font-medium">En línea</span>
              <span className="text-zinc-500">•</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold text-[11px] flex items-center gap-1">
                <span>🗣️ Idioma:</span>
                <span>{chatPartner?.preferred_language === 'en' ? 'Inglés (EN)' : 'Español (ES)'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-900 overflow-y-auto p-4 space-y-4 border-x border-gray-800">
          {messages.map((msg, idx) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${isMine ? 'text-primary-light' : 'text-gray-500'} text-right`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="bg-gray-800 p-4 rounded-b-xl flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2 font-bold transition">
            Enviar
          </button>
        </form>
      </main>
    </div>
  );
};
