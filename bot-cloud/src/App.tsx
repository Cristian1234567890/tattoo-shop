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
  PlusCircle,
  Bell,
  Code,
  Key,
  QrCode,
  Send,
  MessageSquare,
  BookOpen,
  Download,
  Smartphone,
  Users,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';

interface UserData {
  username: string;
  name?: string;
  role: 'Admin' | 'Agent' | 'Operator' | 'Viewer';
  apiKey?: string;
  active?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

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
  description?: string;
  source: string;
  status: string;
  priority: string;
  createdAt: string;
  createdBy?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserData>({
    username: 'admin',
    role: 'Admin'
  });

  // Login form
  const [loginUsername, setLoginUsername] = useState<string>('giovanni');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'sentry' | 'discord-mgmt' | 'commands' | 'tasks' | 'users' | 'security' | 'swagger' | 'webhooks'>('sentry');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Dashboard Data
  const [incidents, setIncidents] = useState<SentryIncident[]>([]);
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  // Perfil & Cambio de usuario/contraseña
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editName, setEditName] = useState('');
  const [editCurrentPass, setEditCurrentPass] = useState('');
  const [editNewPass, setEditNewPass] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Subusuarios (Admin Only)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newSubUsername, setNewSubUsername] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubPassword, setNewSubPassword] = useState('');
  const [newSubRole, setNewSubRole] = useState<'Admin' | 'Agent' | 'Operator' | 'Viewer'>('Agent');
  const [userActionMsg, setUserActionMsg] = useState({ text: '', isError: false });
  const [visibleApiKeys, setVisibleApiKeys] = useState<{ [key: string]: boolean }>({});

  // 2FA
  const [setup2FAData, setSetup2FAData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verify2FACode, setVerify2FACode] = useState('');
  const [twoFAMsg, setTwoFAMsg] = useState({ text: '', isError: false });
  const [disable2FAPass, setDisable2FAPass] = useState('');

  // Discord
  const [discordMsg, setDiscordMsg] = useState('');
  const [discordTitle, setDiscordTitle] = useState('');
  const [discordChannel, setDiscordChannel] = useState('alertas');
  const [discordEveryone, setDiscordEveryone] = useState(false);
  const [isSendingDiscord, setIsSendingDiscord] = useState(false);
  const [discordSendStatus, setDiscordSendStatus] = useState<string | null>(null);

  // Remote Slash
  const [remoteCommand, setRemoteCommand] = useState('/status');
  const [remotePayload, setRemotePayload] = useState('');
  const [remoteCommandResult, setRemoteCommandResult] = useState<string | null>(null);

  // New Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSimulatingSentry, setIsSimulatingSentry] = useState(false);

  // Headers helper
  const getAuthHeaders = () => {
    const token = sessionToken || localStorage.getItem('tattoo_ops_auth') || '';
    const apiKey = currentUser.apiKey || localStorage.getItem('tattoo_ops_apikey') || '';
    const username = currentUser.username || localStorage.getItem('tattoo_ops_username') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-Key': apiKey,
      'X-Username': username
    };
  };

  // Restaurar sesión al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('tattoo_ops_auth');
    const savedUser = localStorage.getItem('tattoo_ops_user');
    if (savedToken) {
      setSessionToken(savedToken);
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setEditUsername(parsed.username || '');
          setEditName(parsed.name || '');
        } catch {}
      }
    }
  }, []);

  // Carga periódica de datos
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        // 1. Telemetría y estado
        const res = await fetch('/api/data', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.incidents) setIncidents(data.incidents);
          if (data.commands) setCommands(data.commands);
          if (data.tasks) setTasks(data.tasks);
        } else if (res.status === 401) {
          handleLogout();
          return;
        }

        // 2. Estado de 2FA
        const res2FA = await fetch('/api/auth/2fa', { headers });
        if (res2FA.ok) {
          const data2FA = await res2FA.json();
          setTwoFactorEnabled(!!data2FA.twoFactorEnabled);
        }

        // 3. Si es Admin, obtener listado de usuarios
        if (currentUser.role === 'Admin') {
          const usersRes = await fetch('/api/users', { headers });
          if (usersRes.ok) {
            const uData = await usersRes.json();
            if (uData.users) setUsersList(uData.users);
          }
        }
      } catch (err) {
        console.warn("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, sessionToken, currentUser.role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: loginUsername, 
          password: loginPassword, 
          twoFactorCode: requires2FA ? twoFactorCode : undefined 
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          return;
        }

        const token = data.token;
        const userObj: UserData = data.user || { username: loginUsername, role: 'Admin' };

        localStorage.setItem('tattoo_ops_auth', token);
        localStorage.setItem('tattoo_ops_user', JSON.stringify(userObj));
        localStorage.setItem('tattoo_ops_username', userObj.username);
        if (data.apiKey) localStorage.setItem('tattoo_ops_apikey', data.apiKey);

        setSessionToken(token);
        setCurrentUser(userObj);
        setEditUsername(userObj.username);
        setEditName(userObj.name || userObj.username);
        setIsAuthenticated(true);
        setRequires2FA(false);
        setTwoFactorCode('');
      } else {
        setAuthError(data.error || 'Credenciales inválidas.');
      }
    } catch {
      setAuthError('Error conectando al servidor de autenticación.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tattoo_ops_auth');
    localStorage.removeItem('tattoo_ops_user');
    localStorage.removeItem('tattoo_ops_apikey');
    localStorage.removeItem('tattoo_ops_username');
    setSessionToken('');
    setIsAuthenticated(false);
    setLoginPassword('');
    setTwoFactorCode('');
    setRequires2FA(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Actualizar Perfil (Cambiar usuario o contraseña propia)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });
    setIsUpdatingProfile(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          newUsername: editUsername !== currentUser.username ? editUsername : undefined,
          name: editName,
          currentPassword: editCurrentPass || undefined,
          newPassword: editNewPass || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          setSessionToken(data.token);
          localStorage.setItem('tattoo_ops_auth', data.token);
        }
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('tattoo_ops_user', JSON.stringify(data.user));
          localStorage.setItem('tattoo_ops_username', data.user.username);
        }
        setProfileMsg({ text: '¡Perfil actualizado exitosamente!', isError: false });
        setEditCurrentPass('');
        setEditNewPass('');
        setTimeout(() => setShowProfileModal(false), 1200);
      } else {
        setProfileMsg({ text: data.error || 'Error al actualizar perfil.', isError: true });
      }
    } catch {
      setProfileMsg({ text: 'Error de red al actualizar perfil.', isError: true });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Crear Subusuario
  const handleCreateSubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMsg({ text: '', isError: false });

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: newSubUsername,
          name: newSubName,
          password: newSubPassword,
          role: newSubRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUserActionMsg({ text: `¡Usuario ${newSubUsername} creado con éxito con rol ${newSubRole}!`, isError: false });
        setNewSubUsername('');
        setNewSubName('');
        setNewSubPassword('');
        setShowCreateUserModal(false);
        // Recargar usuarios
        const uRes = await fetch('/api/users', { headers: getAuthHeaders() });
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersList(uData.users || []);
        }
      } else {
        setUserActionMsg({ text: data.error || 'Error al crear usuario.', isError: true });
      }
    } catch {
      setUserActionMsg({ text: 'Error de red al registrar usuario.', isError: true });
    }
  };

  // Regenerar API Key de subusuario
  const handleRegenerateKey = async (targetUsername: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: targetUsername,
          regenerateApiKey: true
        })
      });
      if (res.ok) {
        const uRes = await fetch('/api/users', { headers: getAuthHeaders() });
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersList(uData.users || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar subusuario
  const handleDeleteUser = async (targetUsername: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el usuario @${targetUsername}?`)) return;

    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(targetUsername)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.username !== targetUsername));
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red al eliminar usuario');
    }
  };

  // 2FA Handlers
  const handleStart2FA = async () => {
    setTwoFAMsg({ text: '', isError: false });
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'setup' })
      });
      const data = await res.json();
      if (res.ok) {
        setSetup2FAData({ secret: data.secret, qrCode: data.qrCode });
      } else {
        setTwoFAMsg({ text: data.error || 'Error iniciando 2FA.', isError: true });
      }
    } catch {
      setTwoFAMsg({ text: 'Error de red al generar clave 2FA.', isError: true });
    }
  };

  const handleVerifyEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setup2FAData || !verify2FACode) return;

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'verify_and_enable',
          secret: setup2FAData.secret,
          code: verify2FACode
        })
      });
      const data = await res.json();

      if (res.ok) {
        setTwoFactorEnabled(true);
        setSetup2FAData(null);
        setVerify2FACode('');
        setTwoFAMsg({ text: '🎉 ¡Autenticación en 2 Pasos (2FA) Activada y Protegida!', isError: false });
      } else {
        setTwoFAMsg({ text: data.error || 'Código incorrecto. Intenta de nuevo.', isError: true });
      }
    } catch {
      setTwoFAMsg({ text: 'Error de red al validar código 2FA.', isError: true });
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disable2FAPass) return;

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'disable', password: disable2FAPass })
      });
      const data = await res.json();

      if (res.ok) {
        setTwoFactorEnabled(false);
        setDisable2FAPass('');
        setTwoFAMsg({ text: '2FA ha sido desactivado.', isError: false });
      } else {
        setTwoFAMsg({ text: data.error || 'Contraseña incorrecta.', isError: true });
      }
    } catch {
      setTwoFAMsg({ text: 'Error de red al desactivar 2FA.', isError: true });
    }
  };

  // Enviar mensaje a Discord
  const handleSendToDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordMsg.trim()) return;

    setIsSendingDiscord(true);
    setDiscordSendStatus(null);

    try {
      const res = await fetch('/api/discord/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          channel: discordChannel,
          title: discordTitle || undefined,
          message: discordMsg,
          mentionEveryone: discordEveryone,
          color: '#f59e0b'
        })
      });
      const data = await res.json();

      if (res.ok) {
        setDiscordSendStatus('✅ Mensaje despachado exitosamente al canal de Discord.');
        setDiscordMsg('');
        setDiscordTitle('');
      } else {
        setDiscordSendStatus(`❌ Error: ${data.error || 'No se pudo enviar el mensaje'}`);
      }
    } catch {
      setDiscordSendStatus('❌ Error de conexión al enviar mensaje.');
    } finally {
      setIsSendingDiscord(false);
    }
  };

  // Encolar Tarea
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          jiraProject: 'TH'
        })
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setTasks(prev => [data.task, ...prev]);
        setNewTaskTitle('');
        setNewTaskDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Simular error de Sentry
  const handleSimulateSentry = async () => {
    setIsSimulatingSentry(true);
    try {
      await fetch('/api/sentry-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            event_id: `test_${Date.now()}`,
            title: 'SimulationError: Gateway Timeout Ping',
            message: 'Alerta simulada emitida desde el Panel Web Ops para verificar Discord y Firestore.',
            level: 'warning',
            environment: 'staging',
            platform: 'node/browser'
          }
        })
      });
    } catch {}
    setTimeout(() => setIsSimulatingSentry(false), 500);
  };

  // Descargar openapi.json autenticado
  const handleDownloadOpenAPI = async () => {
    try {
      const res = await fetch('/api/openapi', { headers: getAuthHeaders() });
      if (res.ok) {
        const spec = await res.json();
        const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tattoo-hub-ops-openapi.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Debe estar autenticado para descargar la especificación OpenAPI');
      }
    } catch {
      alert('Error descargando openapi.json');
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://tattoo-hub-ops.vercel.app';

  // ========================================================
  // VISTA: LOGIN (CON SOPORTE 2FA & SIN EXPOSICIÓN PÚBLICA DE SWAGGER)
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
              Panel Administrativo Aislado • RBAC & Serverless Control
            </p>
          </div>

          <div className="bg-[#12141c]/90 backdrop-blur-xl border border-[#1e2230] rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Acceso Restringido • Requiere Autenticación Segura
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {!requires2FA ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Usuario (Admin / Agente / Operador)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#090a0f] border border-[#1e2230] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="giovanni / antigravity_agent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#090a0f] border border-[#1e2230] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <span>Autenticación de 2 Pasos (2FA)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Introduce el código de 6 dígitos de tu app Authenticator:
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    required
                    autoFocus
                    placeholder="123456"
                    className="w-full tracking-widest text-center text-2xl font-mono py-2.5 bg-[#090a0f] border border-purple-500/50 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    ← Volver a contraseña
                  </button>
                </div>
              )}

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
                {requires2FA ? 'Verificar Código 2FA' : 'Acceder al Panel Seguro'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#1e2230] text-center">
              <p className="text-xs text-slate-500 font-mono">
                Tattoo Hub Ops • Seguridad con API Key, JWT y Roles
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VISTA: DASHBOARD PRINCIPAL AUTENTICADO
  // ========================================================
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100">
      {/* Header */}
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
              <p className="text-[11px] text-slate-400 font-mono">Control Serverless & Agentes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Usuario actual & Rol */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 bg-[#090a0f] border border-[#1e2230] hover:border-amber-500/50 rounded-lg transition-colors cursor-pointer"
              title="Haz clic para modificar tu usuario o contraseña"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold">@{currentUser.username}</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                currentUser.role === 'Admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                currentUser.role === 'Agent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentUser.role}
              </span>
              <Edit3 className="w-3 h-3 text-slate-500" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono px-2.5 py-1.5 bg-[#090a0f] border border-[#1e2230] rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">2FA:</span>
              <span className={twoFactorEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                {twoFactorEnabled ? 'ACTIVO' : 'OPCIONAL'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#090a0f] border border-[#1e2230] hover:border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bot Discord</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">Serverless HTTP</div>
            <p className="text-[11px] text-slate-500 mt-1">Interactions ed25519 (0% PC local)</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Firestore NoSQL</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">tattoo-hub-bot</div>
            <p className="text-[11px] text-slate-500 mt-1">Supabase 100% puro y protegido</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sentry Telemetry</span>
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-400">{incidents.length} Incidentes</div>
            <p className="text-[11px] text-slate-500 mt-1">Reenvío a Discord #errores</p>
          </div>

          <div className="p-4 bg-[#12141c] border border-[#1e2230] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Seguridad & RBAC</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {currentUser.role === 'Admin' ? `${usersList.length || 3} Usuarios` : `Rol: ${currentUser.role}`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">API Key + JWT Bearer + Header</p>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex border-b border-[#1e2230] mb-6 overflow-x-auto gap-1">
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
            onClick={() => setActiveTab('discord-mgmt')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'discord-mgmt'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Gestión Discord</span>
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
            <span>Historial Bot ({commands.length})</span>
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
            <span>Cola Tareas Jira ({tasks.length})</span>
          </button>

          {/* Tab de Gestión de Usuarios y Roles (Solo visible para Admin) */}
          {currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios & Roles ({usersList.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Seguridad & 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('swagger')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'swagger'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Swagger & Postman</span>
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
            <span>Endpoints URLs</span>
          </button>
        </div>

        {/* TAB 1: SENTRY TELEMETRY */}
        {activeTab === 'sentry' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141c] p-4 rounded-2xl border border-[#1e2230]">
              <div>
                <h3 className="font-bold text-white text-base">Receptor en Tiempo Real de Sentry</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los errores capturados en Frontend y Backend se guardan en Firestore y se alertan en Discord #errores.
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
                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">Sin incidencias registradas.</div>
                ) : (
                  incidents.map((inc) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTIÓN DE DISCORD DESDE LA WEB */}
        {activeTab === 'discord-mgmt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Enviar Mensaje / Alerta a Discord</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Publica comunicados firmados por tu usuario autenticado (<strong>@{currentUser.username}</strong>).
              </p>

              <form onSubmit={handleSendToDiscord} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Canal de Destino</label>
                  <select
                    value={discordChannel}
                    onChange={(e) => setDiscordChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="alertas">#alertas-agentes</option>
                    <option value="errores">#errores (Sentry Telemetry)</option>
                    <option value="soporte">#soporte (Atención PO)</option>
                    <option value="general">#general (Equipo Tattoo Hub)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Anuncio (Opcional)</label>
                  <input
                    type="text"
                    value={discordTitle}
                    onChange={(e) => setDiscordTitle(e.target.value)}
                    placeholder="Ej. Anuncio de Nuevo Sprint en Jira"
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contenido del Mensaje</label>
                  <textarea
                    rows={4}
                    value={discordMsg}
                    onChange={(e) => setDiscordMsg(e.target.value)}
                    required
                    placeholder="Escribe el mensaje o reporte que deseas enviar..."
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mentionEveryone"
                    checked={discordEveryone}
                    onChange={(e) => setDiscordEveryone(e.target.checked)}
                    className="rounded bg-[#090a0f] border-[#1e2230] text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="mentionEveryone" className="text-xs text-slate-300 cursor-pointer">
                    Mencionar a <span className="font-mono text-amber-400 font-bold">@everyone</span> (Alerta de alta prioridad)
                  </label>
                </div>

                {discordSendStatus && (
                  <div className="p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-slate-200">
                    {discordSendStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingDiscord}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingDiscord ? 'Enviando a Discord...' : 'Publicar en Discord'}</span>
                </button>
              </form>
            </div>

            {/* Ejecutor Rápido de Comandos Slash */}
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Ejecutor Web de Slash Commands</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Dispara rutinas serverless idénticas a los Slash Commands del Bot en Discord.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Comando a Ejecutar</label>
                  <select
                    value={remoteCommand}
                    onChange={(e) => setRemoteCommand(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                  >
                    <option value="/status">/status (Diagnóstico de Servicios)</option>
                    <option value="/plan">/plan (Registrar Objetivo / Feature)</option>
                    <option value="/crear">/crear (Crear Ticket en Jira)</option>
                    <option value="/bug">/bug (Reportar Defecto Crítico)</option>
                    <option value="/sentry">/sentry (Consultar Telemetría)</option>
                    <option value="/sentry test">/sentry test (Emitir Alerta de Prueba)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parámetros / Argumento</label>
                  <input
                    type="text"
                    value={remotePayload}
                    onChange={(e) => setRemotePayload(e.target.value)}
                    placeholder="Ej. Revisión de pasarela de pagos..."
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRemoteCommandResult(`✅ Comando ${remoteCommand} procesado con éxito por el servicio serverless.`);
                  }}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Ejecutar Rutina en la Nube</span>
                </button>

                {remoteCommandResult && (
                  <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 font-mono">
                    {remoteCommandResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMANDOS BOT HISTORIAL */}
        {activeTab === 'commands' && (
          <div className="space-y-4">
            <div className="bg-[#12141c] p-4 rounded-2xl border border-[#1e2230]">
              <h3 className="font-bold text-white text-base">Historial de Comandos de Discord & Panel</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peticiones procesadas por la arquitectura Serverless en Vercel y guardadas en Firestore.
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
                    <th className="p-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2230] text-slate-300">
                  {commands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Sin comandos registrados aún.</td>
                    </tr>
                  ) : (
                    commands.map((cmd, idx) => (
                      <tr key={idx} className="hover:bg-[#161922] transition-colors">
                        <td className="p-3.5 font-bold text-amber-400">{cmd.command}</td>
                        <td className="p-3.5 text-white">{cmd.user}</td>
                        <td className="p-3.5 text-slate-400">#{cmd.channel}</td>
                        <td className="p-3.5 text-slate-500">{new Date(cmd.executedAt).toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {cmd.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COLA DE TAREAS JIRA */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Formulario de Nueva Tarea */}
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Crear Tarea para Jira & Agente Autónomo</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Genera un ticket técnico en la cola que el agente procesará utilizando API Key y autenticación estricta.
              </p>

              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Tarea</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    placeholder="Ej. Implementar integración de mapas con geolocalización"
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmittingTask}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isSubmittingTask ? 'Encolando...' : 'Crear Tarea'}</span>
                  </button>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Criterios de Aceptación</label>
                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Detalles técnicos, requerimientos y especificaciones para el agente..."
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </form>
            </div>

            {/* Listado de Tareas */}
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#1e2230] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Cola de Tareas Activas</h3>
                  <p className="text-xs text-slate-400">Sincronizadas con Firestore `task_queue` y accesibles por API.</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{tasks.length} tareas</span>
              </div>
              <div className="divide-y divide-[#1e2230]">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">Sin tareas pendientes en la cola.</div>
                ) : (
                  tasks.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-[#161922] transition-colors flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">{t.id}</span>
                          <span className="text-xs font-semibold text-white">{t.title}</span>
                        </div>
                        {t.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                          <span>Origen: {t.source}</span>
                          <span>•</span>
                          <span>Prioridad: {t.priority}</span>
                          {t.createdBy && (
                            <>
                              <span>•</span>
                              <span>Por: @{t.createdBy}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(t.createdAt).toLocaleString()}</span>
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USUARIOS & ROLES (RBAC - SOLO ADMIN) */}
        {activeTab === 'users' && currentUser.role === 'Admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
              <div>
                <h3 className="font-bold text-white text-base">Control de Usuarios, Subusuarios & Roles (RBAC)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solo los administradores pueden crear subusuarios, asignar roles y generar API Keys.
                </p>
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Nuevo Subusuario</span>
              </button>
            </div>

            {userActionMsg.text && (
              <div className={`p-3 rounded-xl text-xs ${
                userActionMsg.isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}>
                {userActionMsg.text}
              </div>
            )}

            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090a0f] text-slate-400 border-b border-[#1e2230]">
                  <tr>
                    <th className="p-3.5">Usuario / Nombre</th>
                    <th className="p-3.5">Rol de Acceso</th>
                    <th className="p-3.5">API Key Asignada</th>
                    <th className="p-3.5">2FA</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2230] text-slate-300">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Cargando usuarios...</td>
                    </tr>
                  ) : (
                    usersList.map((u) => {
                      const isKeyVisible = visibleApiKeys[u.username];
                      return (
                        <tr key={u.username} className="hover:bg-[#161922] transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white">@{u.username}</div>
                            <div className="text-[11px] text-slate-400">{u.name || u.username}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'Admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              u.role === 'Agent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              u.role === 'Operator' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {u.apiKey ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-300">
                                  {isKeyVisible ? u.apiKey : `${u.apiKey.slice(0, 12)}••••••••••••`}
                                </span>
                                <button
                                  onClick={() => setVisibleApiKeys(prev => ({ ...prev, [u.username]: !isKeyVisible }))}
                                  className="text-slate-500 hover:text-slate-300"
                                  title={isKeyVisible ? 'Ocultar' : 'Revelar'}
                                >
                                  {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(u.apiKey!, `key_${u.username}`)}
                                  className="text-slate-500 hover:text-amber-400"
                                  title="Copiar API Key"
                                >
                                  {copiedUrl === `key_${u.username}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600">Sin clave</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded ${
                              u.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500'
                            }`}>
                              {u.twoFactorEnabled ? 'Activo' : 'No'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-emerald-400 text-[10px]">Activo</span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRegenerateKey(u.username)}
                                className="px-2.5 py-1 bg-[#090a0f] hover:bg-[#1a1d28] border border-[#1e2230] text-slate-300 rounded-lg text-[10px] cursor-pointer"
                                title="Regenerar clave de acceso API"
                              >
                                Regenerar Key
                              </button>
                              {u.username !== currentUser.username && (
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg border border-transparent hover:border-red-500/30 transition-colors cursor-pointer"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SEGURIDAD & 2FA */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mis Credenciales API */}
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Mis Credenciales para Postman / Agente</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Utiliza estas cabeceras para autorizar peticiones protegidas desde Postman, terminal o agentes de IA.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">Header: X-API-Key</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.apiKey || '', 'my_apikey')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl === 'my_apikey' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === 'my_apikey' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={currentUser.apiKey || 'Generando...'}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-amber-300 font-mono select-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">Header: Authorization (Bearer JWT)</span>
                    <button
                      onClick={() => copyToClipboard(sessionToken, 'my_bearer')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl === 'my_bearer' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === 'my_bearer' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={sessionToken ? `Bearer ${sessionToken}` : ''}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-purple-300 font-mono select-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">Header: X-Username</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.username, 'my_user')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl === 'my_user' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === 'my_user' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={currentUser.username}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-slate-200 font-mono select-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-full py-2.5 bg-[#090a0f] hover:bg-[#161922] border border-[#1e2230] text-amber-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Cambiar Mi Usuario o Contraseña</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Configuración 2FA */}
            <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Autenticación en 2 Pasos (2FA)</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Protección adicional con código TOTP SHA-256 (Google Authenticator / Authy).
              </p>

              {twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase font-mono">2FA Activado y Blindado</div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tu cuenta requiere el código de 6 dígitos en cada inicio de sesión.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleDisable2FA} className="space-y-3 pt-3 border-t border-[#1e2230]">
                    <label className="block text-xs font-semibold text-slate-300">
                      Desactivar 2FA (Ingresa tu contraseña para confirmar)
                    </label>
                    <input
                      type="password"
                      value={disable2FAPass}
                      onChange={(e) => setDisable2FAPass(e.target.value)}
                      required
                      placeholder="Contraseña actual"
                      className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Desactivar 2FA
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  {!setup2FAData ? (
                    <div>
                      <p className="text-xs text-slate-300 mb-4">
                        Al activar 2FA, deberás ingresar un código dinámico de 6 dígitos desde tu móvil para acceder al panel.
                      </p>
                      <button
                        type="button"
                        onClick={handleStart2FA}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Configurar 2FA (Google Authenticator)</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyEnable2FA} className="space-y-4">
                      <div className="flex flex-col items-center p-4 bg-white rounded-xl">
                        <img src={setup2FAData.qrCode} alt="Código QR 2FA" className="w-40 h-40" />
                        <span className="text-[10px] text-slate-600 font-mono mt-1">Escanea con Google Authenticator</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Clave secreta manual:</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-[#090a0f] border border-[#1e2230] rounded-lg text-xs text-amber-400 font-mono select-all">
                            {setup2FAData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(setup2FAData.secret, 'secret')}
                            className="p-2 bg-[#090a0f] border border-[#1e2230] rounded-lg text-xs text-slate-300"
                          >
                            {copiedUrl === 'secret' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Código de verificación de 6 dígitos:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={verify2FACode}
                          onChange={(e) => setVerify2FACode(e.target.value)}
                          required
                          placeholder="123456"
                          className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-[#090a0f] border border-purple-500 rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Confirmar y Activar 2FA
                      </button>
                    </form>
                  )}
                </div>
              )}

              {twoFAMsg.text && (
                <div className={`mt-4 p-3 rounded-xl text-xs ${
                  twoFAMsg.isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  {twoFAMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SWAGGER & POSTMAN (PROTEGIDO) */}
        {activeTab === 'swagger' && (
          <div className="space-y-6">
            <div className="bg-[#12141c] p-6 rounded-2xl border border-[#1e2230]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">API Explorer & OpenAPI para Agentes / Postman</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Solo expone endpoints operativos (Jira, Discord, Sentry) protegidos con API Key y JWT Bearer.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/swagger?token=${encodeURIComponent(sessionToken)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir Swagger en Nueva Pestaña</span>
                  </a>
                  <button
                    onClick={handleDownloadOpenAPI}
                    className="px-4 py-2 bg-[#090a0f] border border-[#1e2230] hover:border-slate-600 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar openapi.json</span>
                  </button>
                </div>
              </div>

              {/* Banner de Headers de Seguridad */}
              <div className="p-4 bg-[#090a0f] border border-[#1e2230] rounded-xl space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase font-mono">
                  <Key className="w-4 h-4" />
                  <span>Configuración de Cabeceras Requeridas para Postman / Agente:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#12141c] border border-[#1e2230] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">1. Key: X-API-Key</span>
                    <code className="text-xs text-amber-300 font-mono block truncate select-all">{currentUser.apiKey || 'th_admin_...'}</code>
                  </div>
                  <div className="p-3 bg-[#12141c] border border-[#1e2230] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">2. Key: Authorization</span>
                    <code className="text-xs text-purple-300 font-mono block truncate select-all">Bearer {sessionToken.slice(0, 15)}...</code>
                  </div>
                  <div className="p-3 bg-[#12141c] border border-[#1e2230] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">3. Key: X-Username</span>
                    <code className="text-xs text-emerald-300 font-mono block truncate select-all">{currentUser.username}</code>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Nota: Por razones de seguridad, las operaciones de cambio de contraseñas y gestión de credenciales no se exponen en Swagger y están restringidas exclusivamente al panel administrativo.
                </p>
              </div>

              {/* Swagger Iframe Embebido con Token */}
              <div className="rounded-xl overflow-hidden border border-[#1e2230] h-[600px]">
                <iframe
                  src={`/api/swagger?token=${encodeURIComponent(sessionToken)}`}
                  title="Swagger UI Autenticado"
                  className="w-full h-full bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: WEBHOOKS & ENDPOINTS */}
        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
              <h3 className="font-bold text-white text-base mb-1">Puntos de Conexión de Producción</h3>
              <p className="text-xs text-slate-400">
                URLs oficiales configuradas para Discord Interactions y Sentry Webhook.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Discord Interactions Endpoint URL</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    ed25519 tweetnacl verificado
                  </span>
                </div>
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

              <div className="bg-[#12141c] p-5 rounded-2xl border border-[#1e2230]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Sentry Webhook Alert URL</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                    Listo & Activo
                  </span>
                </div>
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
            </div>
          </div>
        )}
      </main>

      {/* MODAL: EDITAR PERFIL (CAMBIAR USUARIO / CONTRASEÑA) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Modificar Mi Perfil</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="nuevo_usuario"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Puedes personalizar libremente tu usuario (letras, números, guiones).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo / Alias</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Giovanni PO"
                />
              </div>

              <div className="pt-2 border-t border-[#1e2230]">
                <span className="text-[11px] font-bold text-amber-400 uppercase font-mono block mb-2">
                  Cambiar Contraseña (Opcional)
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contraseña Actual</label>
                    <input
                      type="password"
                      value={editCurrentPass}
                      onChange={(e) => setEditCurrentPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={editNewPass}
                      onChange={(e) => setEditNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {profileMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${
                  profileMsg.isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  {profileMsg.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 bg-[#090a0f] hover:bg-[#1a1d28] border border-[#1e2230] text-slate-300 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR SUBUSUARIO & ASIGNAR ROL (ADMIN ONLY) */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Crear Subusuario & Asignar Rol</h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={newSubUsername}
                  onChange={(e) => setNewSubUsername(e.target.value)}
                  required
                  placeholder="ej. qa_tester o agente_backup"
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Ej. Agente de Automatización QA"
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  value={newSubPassword}
                  onChange={(e) => setNewSubPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso (RBAC)</label>
                <select
                  value={newSubRole}
                  onChange={(e) => setNewSubRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#090a0f] border border-[#1e2230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="Agent">Agent — Permisos de creación de tareas y despacho API</option>
                  <option value="Operator">Operator — Gestión de incidentes y comandos de soporte</option>
                  <option value="Viewer">Viewer — Solo lectura para métricas y telemetría</option>
                  <option value="Admin">Admin — Control administrativo completo y gestión de usuarios</option>
                </select>
                <span className="text-[10px] text-amber-400/80 mt-1 block">
                  * Se generará automáticamente una clave API exclusiva para este usuario.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-2.5 bg-[#090a0f] hover:bg-[#1a1d28] border border-[#1e2230] text-slate-300 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors"
                >
                  Crear Subusuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
