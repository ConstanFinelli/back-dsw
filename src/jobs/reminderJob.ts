import cron from 'node-cron';
import orm from '../shared/db/orm.js';
import { Reservation } from '../reservation/reservation.entities.js';
import { mailService } from '../services/mailService.js';

/**
 * Función principal que busca reservas próximas a 24 horas y envía los recordatorios.
 * Puede ser ejecutada por el cron o invocada manualmente para pruebas.
 */
export async function checkAndSendReminders(): Promise<{ processed: number; sent: number; errors: number }> {
  console.log('[ReminderJob] Iniciando verificación de recordatorios de reservas...');
  const em = orm.em.fork();
  const now = new Date();

  let processed = 0;
  let sent = 0;
  let errors = 0;

  try {
    // Definimos rango de búsqueda en base a la fecha de hoy y pasado mañana
    // para abarcar cualquier reserva que caiga en la ventana de las próximas 24 horas
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(23, 59, 59, 999);

    // Buscar reservas activas que aún no hayan sido notificadas
    const pendingReservations = await em.find(
      Reservation,
      {
        ReservationDate: { $gte: today, $lte: dayAfterTomorrow },
        status: { $nin: ['cancelada', 'ausente'] },
        reminderSentAt: null,
      },
      {
        populate: ['user', 'pitch.business'],
        orderBy: { ReservationDate: 'asc', ReservationTime: 'asc' },
      }
    );

    console.log(`[ReminderJob] Se encontraron ${pendingReservations.length} reservas activas sin recordatorio en la ventana.`);

    for (const reservation of pendingReservations) {
      processed++;
      try {
        if (!reservation.user?.email) {
          console.warn(`[ReminderJob] La reserva #${reservation.id} no tiene un usuario con email válido.`);
          continue;
        }

        // Construir la fecha y hora completa del turno
        const [hours, minutes] = reservation.ReservationTime.split(':').map(Number);
        const matchDateTime = new Date(reservation.ReservationDate);
        matchDateTime.setHours(hours, minutes, 0, 0);

        const msUntilMatch = matchDateTime.getTime() - now.getTime();
        const hoursUntilMatch = msUntilMatch / (1000 * 60 * 60);

        // Si la reserva ya pasó, no tiene sentido mandar recordatorio
        if (hoursUntilMatch <= 0) {
          continue;
        }

        // Si la reserva fue creada con menos de 24 hs de anticipación (ej: reserva para hoy mismo),
        // el usuario ya sabe de su turno reciente y no aplica el recordatorio de 24 hs previas
        const msSinceCreation = matchDateTime.getTime() - new Date(reservation.createdAt).getTime();
        const hoursSinceCreationToMatch = msSinceCreation / (1000 * 60 * 60);

        // Ventana de envío: faltan entre 0 y 24.5 horas para el partido
        // y la reserva original fue realizada con al menos 24 horas de antelación
        const isWithin24HoursWindow = hoursUntilMatch <= 24.5;
        const wasBookedWithAdvance = hoursSinceCreationToMatch >= 24;

        if (isWithin24HoursWindow && wasBookedWithAdvance) {
          console.log(`[ReminderJob] Enviando recordatorio a ${reservation.user.email} para reserva #${reservation.id} (faltan ~${hoursUntilMatch.toFixed(1)} hs)...`);

          await mailService.sendReservationReminder(reservation);

          // Registrar fecha de envío para evitar duplicados
          reservation.reminderSentAt = new Date();
          await em.flush();

          sent++;
          console.log(`[ReminderJob] Recordatorio enviado exitosamente para reserva #${reservation.id}.`);
        }
      } catch (itemError) {
        errors++;
        console.error(`[ReminderJob] Error al enviar recordatorio para reserva #${reservation.id}:`, itemError);
      }
    }

    console.log(`[ReminderJob] Finalizado. Procesadas: ${processed}, Enviadas: ${sent}, Errores: ${errors}`);
  } catch (globalError) {
    console.error('[ReminderJob] Error crítico al consultar la base de datos:', globalError);
  }

  return { processed, sent, errors };
}

/**
 * Inicializa la tarea recurrente con node-cron.
 * Se ejecuta cada 30 minutos (a las :00 y :30 de cada hora).
 */
export function initReminderJob(): void {
  // Expresión cron: '*/30 * * * *' (cada 30 minutos)
  cron.schedule('*/30 * * * *', async () => {
    await checkAndSendReminders();
  });

  console.log('⏰ [ReminderJob] Programado para ejecutarse cada 30 minutos.');
}
