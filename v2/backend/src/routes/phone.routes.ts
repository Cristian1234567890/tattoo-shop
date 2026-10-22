import { Router, Response } from 'express';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/api.types';
import { vonageService } from '../services/vonage.service';

const router = Router();

/**
 * POST /api/phone/send-otp
 * Dispatches 6-digit SMS verification code via Vonage
 */
router.post('/send-otp', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { phone_prefix = '+507', phone_number } = req.body || {};

    if (!phone_number || typeof phone_number !== 'string' || !phone_number.trim()) {
      res.status(400).json({
        success: false,
        error: 'El número de teléfono es obligatorio.',
      });
      return;
    }

    const result = await vonageService.sendOtp(phone_prefix, phone_number);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
        cooldownRemaining: result.cooldownRemaining,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      messageId: result.messageId,
      mocked: result.mocked,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error interno al procesar el envío de SMS.',
    });
  }
});

/**
 * POST /api/phone/verify-otp
 * Verifies 6-digit OTP code. If user is authenticated, persists verified state to DB.
 */
router.post('/verify-otp', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { phone_prefix = '+507', phone_number, code } = req.body || {};

    if (!phone_number || !code) {
      res.status(400).json({
        success: false,
        error: 'El número de teléfono y el código de 6 dígitos son obligatorios.',
      });
      return;
    }

    const verification = vonageService.verifyOtp(phone_prefix, phone_number, code);

    if (!verification.success) {
      res.status(400).json({
        success: false,
        error: verification.message,
        attemptsRemaining: verification.attemptsRemaining,
      });
      return;
    }

    // If request comes from an authenticated user, persist immediately
    if (req.user?.id) {
      await vonageService.persistVerifiedPhone(req.user.id, phone_prefix, phone_number);
    }

    res.status(200).json({
      success: true,
      message: verification.message,
      phone_verified: true,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error al validar el código de verificación.',
    });
  }
});

/**
 * POST /api/phone/change-request
 * Initiates phone number change for authenticated user. Sends SMS to new number.
 */
router.post('/change-request', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { new_phone_prefix = '+507', new_phone_number } = req.body || {};

    if (!new_phone_number || typeof new_phone_number !== 'string' || !new_phone_number.trim()) {
      res.status(400).json({
        success: false,
        error: 'El nuevo número de teléfono es obligatorio.',
      });
      return;
    }

    const result = await vonageService.sendOtp(
      new_phone_prefix,
      new_phone_number,
      undefined
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
        cooldownRemaining: result.cooldownRemaining,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Código de confirmación de 6 dígitos enviado al nuevo número.',
      mocked: result.mocked,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error al solicitar cambio de número de teléfono.',
    });
  }
});

/**
 * POST /api/phone/change-confirm
 * Confirms phone number change with 6-digit OTP and updates database.
 */
router.post('/change-confirm', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { new_phone_prefix = '+507', new_phone_number, code } = req.body || {};

    if (!new_phone_number || !code) {
      res.status(400).json({
        success: false,
        error: 'El nuevo número y el código de 6 dígitos son obligatorios.',
      });
      return;
    }

    const verification = vonageService.verifyOtp(new_phone_prefix, new_phone_number, code);

    if (!verification.success) {
      res.status(400).json({
        success: false,
        error: verification.message,
        attemptsRemaining: verification.attemptsRemaining,
      });
      return;
    }

    const persistResult = await vonageService.persistVerifiedPhone(
      req.user!.id,
      new_phone_prefix,
      new_phone_number
    );

    if (!persistResult.success) {
      res.status(500).json({
        success: false,
        error: 'Código correcto pero ocurrió un error al actualizar el perfil en la base de datos.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Número de teléfono actualizado y verificado exitosamente.',
      phone_verified: true,
      phone_number: new_phone_number.replace(/\D/g, ''),
      phone_prefix: new_phone_prefix,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error al confirmar cambio de número de teléfono.',
    });
  }
});

export const phoneRoutes = router;
export default router;
