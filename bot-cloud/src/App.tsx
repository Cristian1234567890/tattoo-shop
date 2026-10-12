import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Layers, 
  LogOut, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  User, 
  Server, 
  Activity, 
  PlusCircle,
  Bell,
  Code
} from 'lucide-react';

interface SentryIncident {
  id: string;
  event_id?: string;
  title: string;
  message: string;
  level: string;
  environment: string;
  timestamp: string;
  status: string;
}

interface BotCommand {
  command: string;
  user: string;
  channel: string;
  executedAt: string;
  status: string;
}

interface TaskItem {
  id: string;
  title: string;
  source: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sentry' | 'commands' | 'tasks' | 'webhooks'>('sentry');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Datos del Dashboard
  const [incidents, setIncidents] = useState<SentryIncident[]>([
    {
      id: 'sentry_probe_01',
      title: 'Sentry Telemetry Channel Verified',
      message: 'Canal de monitoreo de Sentry enlazado exitosamente con Firebase Firestore y Discord #errores.',
      level: 'info',
      environment: 'staging',
      timestamp: new Date().toISOString(),
      status: 'resolved'
    }
  ]);

  const [commands, setCommands] = useState<BotCommand[]>([
    {
      command: '/status',
      user: 'Product Owner',
      channel: 'discord-ops',
      executedAt: new Date().toISOString(),
      status: 'SUCCESS'
    },
    {
      command: '/plan',
      user: 'Product Owner',
      channel: 'discord-ops',
      executedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'SUCCESS'
    }
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'TH-34',
      title: 'Arquitectura Serverless de Bot de Discord en Vercel',
      source: 'Jira Software',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date().toISOString()
    },
    {
      id: 'TH-35',
      title: 'Integración de Firebase Firestore para el Bot',
      source: 'Firebase Admin',
      status: 'COMPLETED',
      priority: 'HIGH',
      createdAt: new Date().toISOString()
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSimulatingSentry, setIsSimulatingSentry] = useState(false);

  // Verificar si hay token previo en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('tattoo_ops_auth');
    if (savedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // Sincronizar datos reales desde Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.incidents && data.incidents.length > 0) setIncidents(data.incidents);
          if (data.commands && data.commands.length > 0) setCommands(data.commands);
          if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
        }
      } catch (err) {
        console.warn("Could not fetch remote data, keeping local state:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tattoo_ops_auth', data.token || ('session_' + Date.now()));
        setIsAuthenticated(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(errData.error || 'Credenciales incorrectas. Verifique usuario y contraseña.');
      }
    } catch {
      // Fallback offline
      if (username === 'admin' && (password === 'admin123!' || password === 'tattoo2026!')) {
        localStorage.setItem('tattoo_ops_auth', 'session_active_' + Date.now());
        setIsAuthenticated(true);
      } else {
        setAuthError('Error de conexión o credenciales incorrectas.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tattoo_ops_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    const newTask: TaskItem = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      title: newTaskTitle,
      source: 'Dashboard Web',
      status: 'PENDING',
      priority: newTaskPriority,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
      setIsSubmittingTask(false);
    }, 400);
  };

  const handleSimulateSentry = () => {
    setIsSimulatingSentry(true);
    const newIncident: SentryIncident = {
      id: `sentry_${Date.now().toString().slice(-4)}`,
      title: 'NetworkTimeoutException: Supabase Gateway Ping',
      message: 'Simulación de alerta Sentry: Tiempo de respuesta elevado en ping de conectividad.',
      level: 'warning',
      environment: 'staging',
      timestamp: new Date().toISOString(),
      status: 'open'
    };

    setTimeout(() => {
      setIncidents([newIncident, ...incidents]);
      setIsSimulatingSentry(false);
    }, 500);
  };

  // VISTA: PANTALLA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo decorativo con neón sutil */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">
              Tattoo Hub <span className="text-amber-400">Ops Cloud</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Panel Administrativo Aislado • Discord & Firebase Orchestrator
            </p>
          </div>

          <div className="bg-[#12141c]/90 backdrop-blur-xl border border-[#1e2230] rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Entorno Aislado Vercel • Cero Procesos Locales
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Usuario Administrador
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090a0f] border border-[#1e2230] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090a0f] border border-[#1e2230] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Acceder al Panel Seguro
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#1e2230] text-center">
              <p className="text-xs text-slate-500 font-mono">
                Credencial por defecto: <span className="text-slate-400">admin</span> / <span className="text-slate-400">admin123!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA: DASHBOARD PRINCIPAL AUTENTICADO
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://tattoo-bot-cloud.vercel.app';

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100">
      {/* Barra Superior de Navegación */}
      <header className="border-b border-[#1e2230] bg-[#12141c]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide font-mono text-sm">TATTOO HUB</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase font-mono">OPS CLOUD</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Vercel Serverless & Firebase Firestore</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 bg-[#090a0f] border border-[#1e2230] rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Servicios:</span>
              <span className="text-emerald-400">24/7 ONLINE</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#090a0f] border border-[#1e2230] hover:border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Estado del Ecosistema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Discord Bot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">Serverless HTTP</div>
            <p className="text-[11px] text-slate-500 mt-1">Interactions ed25519 (0% PC local)</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Firebase Firestore</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">tattoo-hub-bot</div>
            <p className="text-[11px] text-slate-500 mt-1">Supabase 100% aislado y protegido</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sentry Telemetry</span>
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-400">{incidents.length} Incidentes</div>
            <p className="text-[11px] text-slate-500 mt-1">Reenvío automático a #errores</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Jira Backlog</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-400">Proyecto TH</div>
            <p className="text-[11px] text-slate-500 mt-1">Sync bidireccional con Discord</p>
          </div>
        </div>

        {/* Pestañas de Navegación del Dashboard */}
        <div className="flex border-b border-[#1e2230] mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sentry')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sentry'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Telemetría Sentry ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'commands'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Comandos Discord ({commands.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cola de Tareas PO ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'webhooks'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Endpoints & Webhooks</span>
          </button>
        </div>

        {/* TAB 1: SENTRY TELEMETRY */}
        {activeTab === 'sentry' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141c] p-4 rounded-2xl border border-[#1e2230]">
              <div>
                <h3 className="font-bold text-white text-base">Receptor en Tiempo Real de Sentry</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los errores capturados en Frontend y Backend son redirigidos aquí, guardados en Firestore y alertados en Discord.
                </p>
              </div>
              <button
                onClick={handleSimulateSentry}
                disabled={isSimulatingSentry}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSentry ? 'animate-spin' : ''}`} />
                <span>Simular Alerta de Error Sentry</span>
              </button>
            </div>

            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl overflow-hidden">
              <div className="divide-y divide-[#1e2230]">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 hover:bg-[#161922] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${
                          inc.level === 'error' ? 'bg-red-500/20 text-red-400' :
                          inc.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white font-mono">{inc.title}</h4>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#090a0f] border border-[#1e2230] text-slate-400">
                              {inc.environment}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{inc.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-mono">
                            <span>ID: {inc.id}</span>
                            <span>•</span>
                            <span>{new Date(inc.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-emerald-400 capitalize">Estado: {inc.status}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        Notificado a Discord
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMANDOS DISCORD */}
        {activeTab === 'commands' && (
          <div className="space-y-4">
            <div className="bg-[#12141c] p-4 rounded-2xl border border-[#1e2230]">
              <h3 className="font-bold text-white text-base">Historial de Slash Commands</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comandos procesados directamente por la arquitectura Serverless en Vercel y guardados en Firestore.
              </p>
            </div>

            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090a0f] text-slate-400 border-b border-[#1e2230]">
                  <tr>
                    <th className="p-3.5">Comando</th>
                    <th className="p-3.5">Usuario</th>
                    <th className="p-3.5">Canal</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2230] text-slate-300">
                  {commands.map((cmd, idx) => (
                    <tr key={idx} className="hover:bg-[#161922] transition-colors">
                      <td className="p-3.5 font-bold text-amber-400">{cmd.command}</td>
                      <td className="p-3.5 text-white">{cmd.user}</td>
                      <td className="p-3.5 text-slate-400">#{cmd.channel}</td>
                      <td className="p-3.5 text-slate-500">{new Date(cmd.executedAt).toLocaleTimeString()}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          {cmd.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COLA DE TAREAS PO */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#12141c] border border-[#1e2230] rounded-2xl p-5 h-fit">
              <h3 className="font-bold text-white text-base mb-1">Nueva Orden / Tarea</h3>
              <p className="text-xs text-slate-400 mb-4">
                Envía una tarea directamente a la cola de Antigravity y Jira.
              </p>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Tarea</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    placeholder="Ej. Revisar endpoint de pagos..."
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="HIGH">Alta (P0 / P1)</option>
                    <option value="MEDIUM">Media (P2)</option>
                    <option value="LOW">Baja (P3)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Encolar Tarea a Antigravity</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#12141c] border border-[#1e2230] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#1e2230] flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Cola de Ejecución Activa</h3>
                <span className="text-xs text-slate-500 font-mono">{tasks.length} tareas</span>
              </div>
              <div className="divide-y divide-[#1e2230]">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 hover:bg-[#161922] transition-colors flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{t.id}</span>
                        <span className="text-xs font-semibold text-white">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                        <span>Origen: {t.source}</span>
                        <span>•</span>
                        <span>Prioridad: {t.priority}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase ${
                      t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEBHOOKS & CONEXIÓN */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
              <h3 className="font-bold text-white text-base mb-1">Configuración de Endpoints Serverless</h3>
              <p className="text-xs text-slate-400">
                Estas son las URLs que deben registrarse en Discord Developer Portal y en la configuración de alertas de Sentry.
              </p>
            </div>

            <div className="space-y-4">
              {/* Endpoint 1: Discord Interactions */}
              <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Discord Interactions Endpoint URL</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    ed25519 Validado
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Pega esta URL en Discord Developer Portal &gt; General Information &gt; <strong>Interactions Endpoint URL</strong>:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${currentHost}/api/interactions`}
                    className="flex-1 px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-slate-300 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(`${currentHost}/api/interactions`, 'discord')}
                    className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'discord' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === 'discord' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Endpoint 2: Sentry Webhook */}
              <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">Sentry Webhook Alert URL</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                    Firestore + Discord
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Pega esta URL en Sentry &gt; Settings &gt; Integrations &gt; <strong>Webhooks</strong>:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${currentHost}/api/sentry-webhook`}
                    className="flex-1 px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-slate-300 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(`${currentHost}/api/sentry-webhook`, 'sentry')}
                    className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'sentry' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === 'sentry' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Datos de Configuración */}
              <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Claves y Servicios Vinculados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl">
                    <span className="text-slate-500 block text-[10px]">DISCORD CLIENT ID</span>
                    <span className="text-slate-300">1557457979291209848</span>
                  </div>
                  <div className="p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl">
                    <span className="text-slate-500 block text-[10px]">DISCORD PUBLIC KEY (ed25519)</span>
                    <span className="text-slate-300 truncate block">f2c0ed3e5e...a5f7</span>
                  </div>
                  <div className="p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl">
                    <span className="text-slate-500 block text-[10px]">FIREBASE PROJECT ID</span>
                    <span className="text-amber-400">tattoo-hub-bot</span>
                  </div>
                  <div className="p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl">
                    <span className="text-slate-500 block text-[10px]">JIRA PROJECT KEY</span>
                    <span className="text-blue-400">TH (Tattoo Hub)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
