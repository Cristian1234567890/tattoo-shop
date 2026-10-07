export type SupportedLanguage = 'es' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    // Navigation
    'nav.benefits': 'Beneficios',
    'nav.pricing': 'Precios',
    'nav.artists': 'Artistas',
    'nav.shop': 'Tienda',
    'nav.explore_map': 'Explorar Mapa',
    'nav.about': 'Sobre Nosotros',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.my_panel': 'Mi Panel',
    'nav.artist_panel': 'Panel Artista',
    'nav.logout': 'Salir',
    'nav.recovering_password': 'Restableciendo Contraseña',

    // Reset Password
    'forgot.title': 'Recuperar Contraseña',
    'forgot.subtitle': 'Ingresa el correo electrónico asociado a tu cuenta de Tattoo Hub para recibir un enlace seguro de restablecimiento.',
    'forgot.email_label': 'Correo Electrónico',
    'forgot.send_btn': 'Enviar Instrucciones',
    'forgot.sending_btn': 'Enviando enlace seguro...',
    'forgot.success_title': '¡Enlace enviado!',
    'forgot.success_desc': 'Hemos enviado un correo a con instrucciones para restablecer tu contraseña.',
    'forgot.check_spam': '¿No recibiste el correo? Revisa tu carpeta de spam o intenta nuevamente en unos minutos.',
    'forgot.retry': 'Reintentar con otro correo',
    'forgot.back_login': 'Volver al Inicio de Sesión',
    'forgot.create_account': 'Crear cuenta nueva',

    // Change Password
    'change.title': 'Nueva Contraseña',
    'change.subtitle': 'Ingresa y confirma tu nueva credencial de acceso para asegurar tu cuenta en Tattoo Hub.',
    'change.new_pw_label': 'Nueva Contraseña (mín. 8 caracteres)',
    'change.confirm_pw_label': 'Confirmar Contraseña',
    'change.pw_match': 'Las contraseñas coinciden',
    'change.pw_not_match': 'Las contraseñas aún no coinciden',
    'change.save_btn': 'Guardar Nueva Contraseña',
    'change.saving_btn': 'Actualizando credencial...',
    'change.success_title': '¡Contraseña actualizada con éxito!',
    'change.success_desc': 'Tu clave ha sido actualizada de forma segura. Redirigiendo a tu panel...',
    'change.go_panel_btn': 'Entrar a mi Panel',
    'change.no_session_title': 'Sin sesión de recuperación activa',
    'change.no_session_desc': 'Para restablecer tu contraseña debes abrir el enlace seguro enviado a tu correo o solicitar uno en olvidé mi contraseña.',

    // Client Profile & Language
    'client.lang_preference': 'Idioma de Comunicación Preferido',
    'client.lang_hint': 'Este idioma se mostrará a los tatuadores y estudios para que sepan cómo comunicarse contigo de forma óptima.',
    'client.lang_saved': 'Idioma actualizado con éxito',
  },
  en: {
    // Navigation
    'nav.benefits': 'Benefits',
    'nav.pricing': 'Pricing',
    'nav.artists': 'Artists',
    'nav.shop': 'Shop',
    'nav.explore_map': 'Explore Map',
    'nav.about': 'About Us',
    'nav.login': 'Sign In',
    'nav.register': 'Register',
    'nav.my_panel': 'My Panel',
    'nav.artist_panel': 'Artist Panel',
    'nav.logout': 'Sign Out',
    'nav.recovering_password': 'Resetting Password',

    // Reset Password
    'forgot.title': 'Reset Password',
    'forgot.subtitle': 'Enter the email address associated with your Tattoo Hub account to receive a secure password reset link.',
    'forgot.email_label': 'Email Address',
    'forgot.send_btn': 'Send Instructions',
    'forgot.sending_btn': 'Sending secure link...',
    'forgot.success_title': 'Link Sent!',
    'forgot.success_desc': 'We sent an email with instructions to reset your password.',
    'forgot.check_spam': "Didn't receive the email? Check your spam folder or try again in a few minutes.",
    'forgot.retry': 'Try with another email',
    'forgot.back_login': 'Back to Sign In',
    'forgot.create_account': 'Create new account',

    // Change Password
    'change.title': 'New Password',
    'change.subtitle': 'Enter and confirm your new access credential to secure your Tattoo Hub account.',
    'change.new_pw_label': 'New Password (min. 8 characters)',
    'change.confirm_pw_label': 'Confirm Password',
    'change.pw_match': 'Passwords match',
    'change.pw_not_match': 'Passwords do not match yet',
    'change.save_btn': 'Save New Password',
    'change.saving_btn': 'Updating credential...',
    'change.success_title': 'Password updated successfully!',
    'change.success_desc': 'Your password has been securely updated. Redirecting to your dashboard...',
    'change.go_panel_btn': 'Go to My Dashboard',
    'change.no_session_title': 'No active recovery session',
    'change.no_session_desc': 'To reset your password you must open the secure link sent to your email or request one on forgot password.',

    // Client Profile & Language
    'client.lang_preference': 'Preferred Communication Language',
    'client.lang_hint': 'This language will be shown to tattoo artists and studios so they know how to communicate with you effectively.',
    'client.lang_saved': 'Language preference saved successfully',
  }
};
