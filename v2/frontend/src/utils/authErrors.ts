/**
 * Utilidad de traducción y localización para mensajes de error de Supabase Auth
 */
export function translateAuthError(message?: string | null, lang: 'es' | 'en' = 'es'): string {
  if (!message || typeof message !== 'string') {
    return lang === 'es' ? 'Ocurrió un error inesperado. Intenta nuevamente.' : 'An unexpected error occurred. Please try again.';
  }

  const normalized = message.toLowerCase().trim();

  if (lang === 'es') {
    if (normalized.includes('should be different from the old password') || normalized.includes('different from old password')) {
      return 'La nueva contraseña debe ser diferente a la contraseña anterior.';
    }
    if (normalized.includes('at least 6 characters') || normalized.includes('at least 8 characters')) {
      return 'La contraseña debe contener al menos 8 caracteres.';
    }
    if (normalized.includes('token has expired') || normalized.includes('otp has expired')) {
      return 'El enlace de recuperación ha expirado. Por favor solicita uno nuevo.';
    }
    if (normalized.includes('token is invalid') || normalized.includes('invalid token') || normalized.includes('invalid or expired')) {
      return 'El enlace de recuperación no es válido o ya fue utilizado.';
    }
    if (normalized.includes('auth session missing') || normalized.includes('session missing')) {
      return 'No hay una sesión de recuperación activa. Solicita un nuevo enlace desde el formulario de recuperación.';
    }
    if (normalized.includes('rate limit') || normalized.includes('over email rate limit') || normalized.includes('too many requests')) {
      return 'Has superado el límite de intentos permitidos. Por motivos de seguridad, espera unos minutos antes de reintentar.';
    }
    if (normalized.includes('invalid login credentials')) {
      return 'Credenciales de acceso incorrectas. Revisa tu correo y contraseña.';
    }
    if (normalized.includes('email not confirmed')) {
      return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada.';
    }
    if (normalized.includes('user not found')) {
      return 'No se encontró ninguna cuenta asociada a este correo electrónico.';
    }
    if (normalized.includes('for security purposes, you can only request this after')) {
      return 'Por motivos de seguridad, debes esperar un momento antes de solicitar un nuevo enlace.';
    }
    if (normalized.includes('network error') || normalized.includes('failed to fetch')) {
      return 'Error de conexión con el servidor. Verifica tu conexión a internet.';
    }

    return message;
  }

  return message;
}
