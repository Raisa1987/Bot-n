import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';

type Role = 'user' | 'bot';

interface ChatMessage {
  role: Role;
  text: string;
  isError?: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const initialMessage = "*Whirrr... click*\\nUnidad C-19 activa. Saludos, Ingeniero Jefe. Sistemas en línea y a la espera de sus directrices y análisis estructurales para la reconstrucción tecnológica. Inserte los parámetros iniciales.";
    setMessages([{ role: 'bot', text: initialMessage }]);
  }, []);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = '50px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawText = inputValue.trim();
    if (!rawText) return;

    const newMessages = [...messages, { role: 'user', text: rawText } as ChatMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: 'bot', text: data.reply }]);
    } catch (error: any) {
      console.error("Fallo de conexión C-19:", error);
      const errorMessage = error.message.includes('HTTP Error') || error.message.includes('Failed to fetch') 
        ? "*Bzzzt... Fzzzt* \\n[ALERTA DE SISTEMA] Fallo en el enlace con el núcleo de datos. Ingeniero, revise la red de comunicaciones (API) e intente de nuevo la transmisión." 
        : error.message;
      setMessages([...newMessages, { role: 'bot', text: errorMessage, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full bg-c19-bg text-c19-text font-mono flex flex-col overflow-hidden select-none">
      {/* TOP NAVIGATION / HEADER */}
      <header className="h-20 bg-c19-panel border-b border-c19-border flex items-center justify-between px-4 md:px-8 shadow-xl z-20 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 border-2 border-c19-accent flex items-center justify-center rounded-sm rotate-45 shrink-0">
            <div className="w-4 h-4 bg-c19-accent animate-pulse -rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-[0.2em] text-white">UNIDAD C-19</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-c19-accent shadow-[0_0_8px_var(--color-c19-accent)]"></span>
              <p className="text-[9px] md:text-[10px] text-c19-accent uppercase tracking-widest opacity-80">Terminal de Diagnóstico Estructural</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[10px] text-[#334155] uppercase font-bold">Latencia Red</p>
            <p className="text-xs text-c19-accent tabular-nums">0.0042s</p>
          </div>
          <div className="h-10 w-[1px] bg-c19-border"></div>
          <div className="bg-c19-accent/10 border border-c19-accent px-4 py-1 flex items-center gap-3 rounded-sm">
            <span className="text-[10px] font-black">ESTADO:</span>
            <span className="text-xs font-bold text-white uppercase">Sincronizado</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: TELEMETRY */}
        <aside className="hidden lg:flex w-64 bg-c19-bg border-r border-c19-border p-6 flex-col gap-8 shrink-0">
          <div>
            <h3 className="text-[10px] text-[#334155] font-black uppercase mb-4 tracking-tighter">Core Telemetry</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 italic uppercase">Memory Load</span>
                <span className="text-c19-accent">42%</span>
              </div>
              <div className="w-full h-1 bg-c19-panel rounded-full overflow-hidden">
                <div className="h-full bg-c19-accent w-[42%]"></div>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 italic uppercase">API Auth Status</span>
                <span className="text-green-400">VERIFIED</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] text-[#334155] font-black uppercase mb-4 tracking-tighter">Deployment Logs</h3>
            <div className="text-[9px] font-mono space-y-2 opacity-60">
              <p>{`> Vercel Edge Runtime init...`}</p>
              <p>{`> SRP principles validated.`}</p>
              <p>{`> Endpoint /api/chat secure.`}</p>
              <p className="text-c19-accent">{`> Handshake established.`}</p>
            </div>
          </div>

          <div className="mt-auto border-t border-c19-border pt-4">
            <div className="bg-c19-panel p-3 rounded-sm text-[10px] italic">
              "La eficiencia es la única métrica que importa."
            </div>
          </div>
        </aside>

        {/* MAIN CHAT INTERFACE */}
        <main className="flex-1 flex flex-col bg-c19-bg relative min-w-0">
          <div id="chat-container" className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex flex-col gap-2 max-w-[85%] md:max-w-[80%] animate-fade-in ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`flex items-center gap-2 ${isUser ? 'mr-1' : 'ml-1'}`}>
                    {isUser && <span className="text-[10px] text-[#334155] hidden sm:inline">User</span>}
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${isUser ? 'text-white' : 'text-c19-accent'}`}>
                      {isUser ? 'Ingeniero Jefe' : 'C-19'}
                    </span>
                  </div>
                  <div className={`p-4 md:p-5 rounded-lg shadow-lg break-words w-full ${
                    isUser 
                      ? 'bg-c19-accent text-white rounded-tr-none' 
                      : 'bg-c19-panel border rounded-tl-none ' + (msg.isError ? 'border-c19-error text-c19-error' : 'border-c19-border text-c19-text')
                  }`}>
                    <div className={`prose max-w-none prose-p:my-1 prose-pre:my-1 prose-a:text-c19-accent hover:prose-a:text-c19-hover text-sm leading-relaxed ${isUser ? 'text-white' : 'prose-invert text-c19-text'}`}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[80%] animate-fade-in">
                <div className="flex items-center gap-2 ml-1">
                  <span className="text-[10px] font-bold text-c19-accent tracking-widest uppercase">C-19</span>
                </div>
                <div className="bg-c19-panel border border-c19-border p-5 rounded-lg rounded-tl-none shadow-lg flex items-center gap-3">
                  <span className="text-xs italic text-c19-accent opacity-70">Procesando telemetría...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-c19-accent rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-c19-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-c19-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="bg-c19-panel border-t border-c19-border p-4 md:p-6 shrink-0 relative">
            <form id="chat-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea 
                  id="message-input" 
                  value={inputValue}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="w-full bg-c19-bg text-c19-text border border-c19-border focus:border-c19-accent focus:ring-1 focus:ring-c19-accent rounded px-4 py-3 h-[46px] min-h-[46px] max-h-32 overflow-y-auto outline-none transition-all placeholder:text-c19-text placeholder:opacity-40 text-sm disabled:opacity-50 pr-12 resize-none"
                  placeholder="Consultar eficiencia de mecanismos de palanca grado 2..."
                  rows={1}
                />
                <span className="absolute right-4 top-3 text-[#334155] text-xs font-bold pointer-events-none hidden sm:inline">CMD_</span>
              </div>
              <button 
                type="submit" 
                id="submit-btn" 
                disabled={isTyping || !inputValue.trim()}
                className="h-[46px] aspect-square bg-c19-accent hover:bg-c19-hover text-white flex items-center justify-center rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* FOOTER STATUS BAR */}
      <footer className="h-8 bg-[#111827] border-t border-c19-border flex items-center px-4 justify-between text-[10px] font-bold shrink-0">
        <div className="flex gap-4">
          <span className="text-[#334155]">BUILD: v2.4.0-STABLE</span>
          <span className="text-[#334155] hidden sm:inline">LOC: /usr/local/bin/c19</span>
        </div>
        <div className="text-c19-accent uppercase tracking-widest hidden sm:block">
          Misión: Restauración Tecnológica en Progreso
        </div>
        <div className="text-c19-accent uppercase tracking-widest sm:hidden">
          Misión: Activa
        </div>
      </footer>
    </div>
  );
}
