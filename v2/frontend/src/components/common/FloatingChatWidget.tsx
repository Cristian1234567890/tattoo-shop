import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Clock,
  Search,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SAMPLE_HUB_ARTISTS } from '../../utils/geo';

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export const FloatingChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Normalized list of contact artists
  const contacts = useMemo(() => {
    return SAMPLE_HUB_ARTISTS.map((item, idx) => ({
      id: item.id || `artist-${idx + 1}`,
      name: `${item.data.nombre || ''} ${item.data.apellido || ''}`.trim() || 'Artista',
      studio: item.data.ciudad ? `Estudio ${item.data.ciudad}` : 'Estudio Atelier',
      style: item.data.work_type || 'Blackwork',
      avatar: item.data.profile || '/assets/GB Tattoo.jpg',
      isOnline: idx % 2 === 0,
    }));
  }, []);

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

  const activeContact = useMemo(() => {
    if (!selectedContactId) return null;
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  // Load initial welcome message when opening a contact thread
  useEffect(() => {
    if (!activeContact || !user) return;
    const initialWelcome: ChatMessage = {
      id: `welcome-${activeContact.id}`,
      sender_id: activeContact.id,
      receiver_id: user.id,
      content: `¡Hola ${user.user_metadata?.nombre || ''}! Soy ${activeContact.name}. Cuéntame sobre la idea de tu tatuaje, zona del cuerpo y tamaño aproximado para cotizarte.`,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    };
    setMessages([initialWelcome]);
  }, [activeContact, user]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, attachedImage]);

  // Client-side image compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede exceder 5 MB.');
        return reject(new Error('File too large'));
      }
      if (!file.type.startsWith('image/')) {
        alert('Solo se admiten formatos de imagen (PNG, JPG, WebP).');
        return reject(new Error('Invalid image format'));
      }

      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setIsCompressing(false);
          resolve(compressed);
        };
        img.onerror = () => {
          setIsCompressing(false);
          alert('El archivo seleccionado no es una imagen válida o está dañado.');
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        setIsCompressing(false);
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file);
      setAttachedImage(compressedDataUrl);
    } catch (err) {
      console.warn('Image processing cancelled or failed:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputMessage.trim() && !attachedImage) || !activeContact || !user) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: inputMessage.trim(),
      image_url: attachedImage || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setAttachedImage(null);
  };

  // Only render when authenticated and not already on the full-screen /chat page
  if (!isAuthenticated || !user || location.pathname === '/chat') {
    return null;
  }

  return (
    <aside aria-label="Widget de chat flotante" className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="floating-chat-trigger"
          data-testid="floating-chat-trigger"
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white/20 cursor-pointer"
          aria-label="Abrir chat flotante"
        >
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse" />
        </button>
      )}

      {/* Floating Chat Container Modal */}
      {isOpen && (
        <div
          data-testid="floating-chat-window"
          className="w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[85vh] rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="p-3.5 bg-violet-600 dark:bg-zinc-950 border-b border-violet-500/30 dark:border-zinc-800 text-white flex items-center justify-between shrink-0">
            {activeContact ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setSelectedContactId(null)}
                  className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  aria-label="Volver a lista de artistas"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/30">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-full h-full object-cover"
                  />
                  {activeContact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-xs font-bold truncate">{activeContact.name}</p>
                  <p className="text-[10px] text-violet-200 dark:text-zinc-400 truncate">
                    {activeContact.studio} • {activeContact.style}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Chat con Tatuadores</h4>
                  <p className="text-[10px] text-violet-200 dark:text-zinc-400">
                    Mensajes y cotizaciones directas
                  </p>
                </div>
              </div>
            )}

            <button
              data-testid="close-floating-chat"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Cerrar chat flotante"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Contact List OR Active Conversation */}
          {!activeContact ? (
            /* LISTA DE CONTACTOS / ARTISTAS */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-zinc-900/50">
              <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar tatuador o estudio..."
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    data-testid="chat-contact-item"
                    onClick={() => setSelectedContactId(contact.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800/80 transition-all text-left cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-zinc-700/50"
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {contact.name}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">Online</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {contact.studio} • {contact.style}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* CONVERSACIÓN ACTIVA */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-zinc-950">
              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm ${
                          isMe
                            ? 'bg-violet-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-bl-none border border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        {msg.image_url && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-black/10">
                            <img
                              src={msg.image_url}
                              alt="Adjunto de tatuaje"
                              className="max-h-48 w-full object-cover rounded-xl"
                            />
                          </div>
                        )}
                        {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMe ? 'text-violet-200' : 'text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-violet-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 30-Day Image Expiration Notice */}
              <div
                data-testid="chat-retention-notice"
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800/80 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5"
              >
                <Clock className="w-3 h-3 text-violet-500 shrink-0" />
                <span className="truncate">
                  Imágenes adjuntas se conservan por 30 días para optimización.
                </span>
              </div>

              {/* Image Preview if Attached */}
              {attachedImage && (
                <div className="px-3 py-2 bg-slate-100 dark:bg-zinc-900 flex items-center gap-2 border-t border-slate-200 dark:border-zinc-800">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-violet-500">
                    <img
                      src={attachedImage}
                      alt="Boceto previo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 rounded-full text-white cursor-pointer"
                      aria-label="Quitar adjunto"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                    Imagen optimizada lista para enviar
                  </span>
                </div>
              )}

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="file"
                  data-testid="chat-file-input"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  data-testid="chat-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="p-2 rounded-xl text-slate-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Adjuntar imagen de referencia o boceto (máx 5 MB)"
                  aria-label="Adjuntar imagen"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  data-testid="chat-input-message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
                />

                <button
                  type="submit"
                  data-testid="chat-send-btn"
                  disabled={!inputMessage.trim() && !attachedImage}
                  className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-40 cursor-pointer shadow-sm"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default FloatingChatWidget;
