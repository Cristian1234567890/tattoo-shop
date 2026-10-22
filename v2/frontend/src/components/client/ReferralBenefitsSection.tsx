import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Users,
  Sparkles,
  Award,
  Crown,
  MessageCircle,
} from 'lucide-react';
import { User } from '../../types';

interface ReferralBenefitsSectionProps {
  user: User | null;
  onShowToast: (message: string, isError?: boolean) => void;
}

export const ReferralBenefitsSection: React.FC<ReferralBenefitsSectionProps> = ({
  user,
  onShowToast,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Generate unique referral code from user ID or email
  const referralCode =
    (user as any)?.referral_code ||
    (user?.id ? `TH-${user.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : 'TH-WELCOME');

  const referralUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `https://tattoohub.com/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    onShowToast('¡Enlace de invitación copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Te invito a unirte a Tattoo Hub para descubrir los mejores tatuadores y flashes exclusivos. Regístrate con mi enlace para desbloquear beneficios: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const milestones = [
    {
      friends: 1,
      title: '5% Descuento',
      desc: 'En tu próxima cita o seña de flash',
      icon: Award,
      unlocked: true,
    },
    {
      friends: 3,
      title: '15% Descuento + Flash VIP',
      desc: 'Acceso prioritario a lanzamientos',
      icon: Sparkles,
      unlocked: false,
    },
    {
      friends: 5,
      title: 'Sesión VIP & Cero Comisiones',
      desc: 'Beneficios permanentes de embajador',
      icon: Crown,
      unlocked: false,
    },
  ];

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Invita a tus Amigos &amp; Desbloquea Beneficios
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Comparte tu enlace de recomendación. Por cada amigo que se una, ambos reciben recompensas.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Programa Embajador
        </span>
      </div>

      {/* Referral Link Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Tu Código de Referido
          </span>
          <span className="text-xs font-mono font-black text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            {referralCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-xs font-mono outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 !text-white keep-white-text font-bold text-xs hover:opacity-95 transition shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="!text-white keep-white-text font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span className="!text-white keep-white-text font-bold">Copiar Enlace</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 !text-white keep-white-text font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span className="!text-white keep-white-text font-bold">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Rewards Milestones */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          Hitos de Recompensas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  m.unlocked
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      m.unlocked
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                        : 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                    {m.friends} amigo{m.friends > 1 ? 's' : ''}
                  </span>
                </div>
                <h5 className="text-sm font-extrabold text-slate-900 dark:text-white mb-0.5">
                  {m.title}
                </h5>
                <p className="text-xs text-slate-500 dark:text-gray-400">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
