import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { SAMPLE_HUB_ARTISTS } from '../utils/geo';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import {
  Send,
  MessageCircle,
  Search,
  ExternalLink,
  ArrowLeft,
  Compass,
  CheckCheck,
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentArtistId = searchParams.get('artist');

  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileViewChat, setMobileViewChat] = useState<boolean>(Boolean(currentArtistId));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Normalized list of available artist contacts
  const contacts = useMemo(() => {
    return SAMPLE_HUB_ARTISTS.map((item, idx) => ({
      id: item.id || `artist-${idx + 1}`,
      name: `${item.data.nombre || ''} ${item.data.apellido || ''}`.trim() || 'Artista',
      studio: item.data.ciudad ? `Estudio ${item.data.ciudad}` : 'Estudio Atelier',
      style: item.data.work_type || 'Custom',
      avatar: item.data.profile || '/assets/Tattoo Machine Rotary.png',
      whatsapp: item.data.telefono || '60000000',
      prefix: item.data.phone_prefix || '507',
      hourlyRate: 70 + (idx % 4) * 15,
      isOnline: idx % 2 === 0,
      lastMessage: idx === 0 ? '¡Hola! ¿Qué idea tienes en mente?' : 'Disponible para citas este mes.',
      time: '12:30',
    }));
  }, []);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.style.toLowerCase().includes(q) ||
        c.studio.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  // Selected artist
  const activeArtist = useMemo(() => {
    if (currentArtistId) {
      const found = contacts.find((c) => c.id === currentArtistId);
      if (found) return found;
    }
    return contacts[0];
  }, [currentArtistId, contacts]);

  // Handle contact selection
  const handleSelectContact = (artistId: string) => {
    setSearchParams({ artist: artistId });
    setMobileViewChat(true);
  };

  // Fetch messages from Supabase or load conversational history
  useEffect(() => {
    if (!user || !activeArtist) return;

    const initialWelcome: Message = {
      id: `welcome-${activeArtist.id}`,
      sender_id: activeArtist.id,
      receiver_id: user.id,
      content: `¡Hola ${user.user_metadata?.nombre || ''}! Soy ${activeArtist.name}. Cuéntame sobre la idea de tu tatuaje, zona del cuerpo y tamaño aproximado para darte una cotización.`,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    };

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${activeArtist.id}),and(sender_id.eq.${activeArtist.id},receiver_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([initialWelcome]);
        }
      } catch {
        setMessages([initialWelcome]);
      }
    };

    fetchMessages();

    // Supabase Realtime channel
    const channel = supabase
      .channel(`chat_${user.id}_${activeArtist.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeArtist]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !user || !activeArtist) return;

    setIsSending(true);
    const msg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeArtist.id,
      content: text,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, msg]);
    if (!textToSend) setNewMessage('');

    try {
      await supabase.from('messages').insert([
        {
          sender_id: user.id,
          receiver_id: activeArtist.id,
          content: text,
        },
      ]);
    } catch (err) {
      console.warn('Realtime message dispatch stored locally:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickChip = (text: string) => {
    sendMessage(text);
  };

  const directWhatsAppUrl = activeArtist
    ? formatWhatsAppUrl(
        activeArtist.whatsapp,
        activeArtist.prefix,
        `¡Hola ${activeArtist.name}! Vi tu perfil en Tattoo Hub y me gustaría coordinar una cita para un tatuaje estilo ${activeArtist.style}.`
      )
    : '';

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#090d16] text-white">
      <div className="flex-1 w-full max-w-7xl mx-auto h-full min-h-0 flex overflow-hidden p-2 sm:p-4 gap-3">
        {/* ========================================================
            LEFT COLUMN: ARTIST CONTACTS LIST
            ======================================================== */}
        <aside
          className={`w-full md:w-80 lg:w-96 h-full min-h-0 flex flex-col rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden shrink-0 ${
            mobileViewChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-zinc-950/60 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <span>Mensajes de Artistas</span>
              </h2>
              <Link
                to="/artistas"
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Compass size={12} /> Explorar
              </Link>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por artista o estilo..."
                aria-label="Buscar por artista o estilo"
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Contacts Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {filteredContacts.map((contact) => {
              const isSelected = activeArtist?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`w-full p-3.5 flex items-center gap-3 transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-l-4 border-amber-500'
                      : 'hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-white/10">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
                        }}
                      />
                    </div>
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090d16] ring-1 ring-emerald-400/50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-bold text-white truncate">{contact.name}</h3>
                      <span className="text-[10px] text-zinc-400">{contact.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mb-1">
                      {contact.lastMessage}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-white/5">
                        {contact.style}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        • {contact.studio}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ========================================================
            RIGHT COLUMN: ACTIVE CHAT ROOM
            ======================================================== */}
        <main
          className={`flex-1 h-full min-h-0 flex flex-col rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden ${
            !mobileViewChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Active Chat Header */}
          {activeArtist ? (
            <div className="p-3 sm:p-4 border-b border-white/10 bg-zinc-950/70 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileViewChat(false)}
                  className="md:hidden p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                  aria-label="Volver a lista de artistas"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-amber-500/60 shadow">
                    <img
                      src={activeArtist.avatar}
                      alt={activeArtist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
                      }}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090d16]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                    {activeArtist.name}
                    <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      En línea
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {activeArtist.studio} • {activeArtist.style}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {directWhatsAppUrl && (
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition"
                    title="Abrir WhatsApp directo con este artista"
                  >
                    <MessageCircle size={14} />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}

                <Link
                  to={`/artist/${activeArtist.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-white/10 text-xs font-semibold transition"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-white/10 text-zinc-400 text-xs">
              Selecciona un artista
            </div>
          )}

          {/* Message History Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0 mb-1">
                      <img
                        src={activeArtist?.avatar || '/assets/Tattoo Machine Rotary.png'}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isMine
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-sm'
                        : 'bg-zinc-800/90 text-zinc-100 border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isMine ? 'text-amber-200/80' : 'text-zinc-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck size={12} className="text-amber-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Consultation Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => handleQuickChip('🎨 Quisiera cotizar una pieza en estilo ' + (activeArtist?.style || 'realista') + '.')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-white/10 transition shrink-0 cursor-pointer"
            >
              🎨 Cotizar diseño
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip('📅 ¿Qué disponibilidad tienes para los próximos días?')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-white/10 transition shrink-0 cursor-pointer"
            >
              📅 Consultar fechas
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip('📍 ¿Cuál es la dirección exacta del estudio?')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-white/10 transition shrink-0 cursor-pointer"
            >
              📍 Ubicación de estudio
            </button>
          </div>

          {/* Message Composer Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 sm:p-4 bg-zinc-950/80 border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Escribe un mensaje a ${activeArtist?.name || 'el artista'}...`}
              aria-label={`Escribe un mensaje a ${activeArtist?.name || 'el artista'}`}
              className="flex-1 bg-zinc-800/90 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm border border-white/10 outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
            >
              <span>Enviar</span>
              <Send size={14} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
