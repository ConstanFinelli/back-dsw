import nodemailer, { Transporter } from 'nodemailer';
import { Reservation } from '../reservation/reservation.entities.js';

class MailService {
  private transporter: Transporter | null = null;
  private isTestAccount = false;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: { user, pass },
      });
      console.log(`[MailService] Configurado con host SMTP: ${host}`);
    } else {
      console.warn('[MailService] Variables SMTP no configuradas en .env. Creando cuenta de prueba Ethereal...');
      const testAccount = await nodemailer.createTestAccount();
      this.isTestAccount = true;
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[MailService] Cuenta de prueba Ethereal generada: ${testAccount.user}`);
    }

    return this.transporter;
  }

  public async sendReservationReminder(reservation: Reservation): Promise<{ messageId?: string; previewUrl?: string | false }> {
    const transporter = await this.getTransporter();

    const user = reservation.user;
    const pitch = reservation.pitch;
    const business = pitch.business;

    // Formatear fecha para el usuario
    const dateObj = new Date(reservation.ReservationDate);
    const dateFormatted = dateObj.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    const subject = `⚽ Recordatorio: Tu reserva en ${business.businessName} es mañana`;
    const fromAddress = process.env.MAIL_FROM || `"Canchas App" <${process.env.SMTP_USER || 'no-reply@canchas.com'}>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">¡Tu partido se acerca!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Te recordamos que tu reserva es dentro de 24 horas.</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">
            Hola <strong>${user.name} ${user.surname || ''}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Todo está listo para tu partido. Te dejamos los detalles de tu reserva:
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 6px 0; font-size: 15px; color: #1e293b;">
              🏟️ <strong>Complejo:</strong> ${business.businessName}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              📍 <strong>Dirección:</strong> ${business.address}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              ⚽ <strong>Cancha:</strong> N° ${pitch.id} (${pitch.size}, suelo de ${pitch.groundType}${pitch.roof ? ', techada' : ''})
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              📅 <strong>Fecha:</strong> ${dateFormatted}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              ⏰ <strong>Horario:</strong> ${reservation.ReservationTime} hs
            </p>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #166534;">
              💡 <strong>Recomendación:</strong> Por favor presentate 10 minutos antes del turno con calzado adecuado para no perder minutos de juego.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            Si necesitás cancelar o reprogramar, por favor hacelo desde tu panel de usuario con la debida anticipación.
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">Este es un mensaje automático de recordatorio.</p>
        </div>
      </div>
    `;

    const textContent = `
¡Hola ${user.name}!
Te recordamos que tu reserva en ${business.businessName} es dentro de 24 horas:

- Lugar: ${business.businessName}
- Dirección: ${business.address}
- Cancha: N° ${pitch.id} (${pitch.size}, ${pitch.groundType})
- Fecha: ${dateFormatted}
- Horario: ${reservation.ReservationTime} hs

Por favor presentate 10 minutos antes.
    `.trim();

    const info = await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    let previewUrl: string | false = false;
    if (this.isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[MailService] 🔗 Previsualización del correo (Ethereal): ${previewUrl}`);
    }

    return { messageId: info.messageId, previewUrl };
  }
}

export const mailService = new MailService();
