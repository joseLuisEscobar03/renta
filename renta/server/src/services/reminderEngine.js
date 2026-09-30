import { db } from '../db.js';
import { getTenantFinancialStatus, getCurrentPeriod } from './financeService.js';

const formatMoney = (n) => '$' + Number(n).toLocaleString('es-SV', { minimumFractionDigits: 0 });

export function buildReminderMessage(tenant, propertyName, type, debt, daysLate, tone, businessName) {
  const firstName = tenant.name.split(' ')[0];
  const fullProp = propertyName || 'su propiedad';
  const owner = businessName || 'Administración de Alquileres';
  const rentFormatted = formatMoney(tenant.rent);
  const debtFormatted = formatMoney(debt);

  if (tone === 'amigable') {
    if (type === 'soon') {
      return `Hola ${firstName} 😊\n\nLe recordamos que su renta de ${rentFormatted} por *${fullProp}* vence en los próximos días.\n\nPor favor realice su pago a tiempo. ¡Muchas gracias!\n\n— ${owner}`;
    }
    if (type === 'due') {
      return `Hola ${firstName} 👋\n\nHoy es el día de pago de su renta de ${rentFormatted} por *${fullProp}*.\n\nEstamos disponibles para cualquier consulta o para recibir su comprobante.\n\n— ${owner}`;
    }
    if (type === 'late') {
      return `Hola ${firstName},\n\nLe informamos que su renta de ${rentFormatted} por *${fullProp}* lleva *${daysLate} día${daysLate > 1 ? 's' : ''}* de retraso.\n\nPor favor regularice su pago a la brevedad posible. 🙏\n\n— ${owner}`;
    }
    if (type === 'multi') {
      return `Estimado/a ${firstName},\n\nRegistra una deuda pendiente acumulada de *${debtFormatted}* por *${fullProp}*.\n\nLe pedimos ponerse en contacto con nosotros hoy mismo para coordinar su plan de pago.\n\n— ${owner}`;
    }
  }

  if (tone === 'formal') {
    if (type === 'soon') {
      return `Estimado/a ${tenant.name},\n\nLe comunicamos que su canon mensual de arrendamiento por valor de ${rentFormatted} correspondiente a ${fullProp} está próximo a vencer. Le agradecemos su puntualidad.\n\nAtentamente,\n${owner}`;
    }
    if (type === 'due') {
      return `Estimado/a ${tenant.name},\n\nEl día de hoy corresponde la fecha límite para el pago de su renta mensual por ${rentFormatted} de ${fullProp}. Le solicitamos efectuar su pago y remitir el comprobante.\n\nAtentamente,\n${owner}`;
    }
    if (type === 'late') {
      return `Estimado/a ${tenant.name},\n\nSu pago de ${rentFormatted} por ${fullProp} presenta ${daysLate} día${daysLate > 1 ? 's' : ''} de retraso. Le solicitamos regularizar su situación a la brevedad.\n\nAtentamente,\n${owner}`;
    }
    if (type === 'multi') {
      return `Estimado/a ${tenant.name},\n\nLe notificamos formalmente que presenta una deuda pendiente de ${debtFormatted} por concepto de alquiler de ${fullProp}. Le instamos a normalizar su situación de forma urgente.\n\nAtentamente,\n${owner}`;
    }
  }

  // Tono firme
  if (type === 'soon') {
    return `${firstName}: Le recordamos que su cuota de renta por ${rentFormatted} de *${fullProp}* vence en pocos días. Evite recargos pagando puntualmente.\n\n${owner}`;
  }
  if (type === 'due') {
    return `${firstName}: HOY es la fecha de vencimiento de su renta de ${rentFormatted} por *${fullProp}*. Realice su pago durante el transcurso del día.\n\n${owner}`;
  }
  if (type === 'late') {
    return `${firstName}: Su cuota de renta presenta ${daysLate} día${daysLate > 1 ? 's' : ''} de mora. Se requiere el pago INMEDIATO para evitar acciones según contrato.\n\n${owner}`;
  }
  if (type === 'multi') {
    return `${firstName}: Su cuenta registra un saldo deudor crítico de ${debtFormatted}. Comuníquese y pague de manera URGENTE.\n\n${owner}`;
  }

  return '';
}

export async function generateReminders() {
  const settings = await db.queryOne('SELECT * FROM settings LIMIT 1') || {
    business_name: 'Mi negocio',
    tone: 'amigable',
    on_3days: 1,
    on_due: 1,
    on_late: 1,
    on_multi: 1
  };

  const tenants = await db.query(`
    SELECT t.*, p.name as property_name 
    FROM tenants t 
    LEFT JOIN properties p ON t.property_id = p.id 
    WHERE t.status = 'active'
  `);

  const currentPeriod = getCurrentPeriod();
  const now = new Date();
  const currentDay = now.getDate();

  const loggedReminders = await db.query('SELECT * FROM reminders_log WHERE period = ?', [currentPeriod]);
  const loggedMap = new Map();
  loggedReminders.forEach(r => loggedMap.set(r.key_id, r));

  const reminders = [];

  for (const tenant of tenants) {
    const fin = await getTenantFinancialStatus(tenant.id);
    const rent = Number(tenant.rent);
    const payDay = tenant.payment_day || 1;
    
    // Pagos registrados este mes
    const monthRes = await db.queryOne(
      'SELECT SUM(amount) as total FROM payments WHERE tenant_id = ? AND period = ?',
      [tenant.id, currentPeriod]
    );
    const paidThisMonth = Number(monthRes?.total || 0);

    const owesThisMonth = paidThisMonth < rent;
    const diffDays = payDay - currentDay; // >0 si aún no llega, =0 si es hoy, <0 si ya pasó

    let type = '';

    if (fin.totalDebt >= rent * 2 && settings.on_multi) {
      type = 'multi';
    } else if (diffDays < 0 && owesThisMonth && settings.on_late) {
      type = 'late';
    } else if (diffDays === 0 && owesThisMonth && settings.on_due) {
      type = 'due';
    } else if (diffDays > 0 && diffDays <= 3 && owesThisMonth && settings.on_3days) {
      type = 'soon';
    }

    if (!type) continue;

    const keyId = `${tenant.id}_${currentPeriod}_${type}`;
    const logged = loggedMap.get(keyId);

    const message = logged?.custom_message || buildReminderMessage(
      tenant,
      tenant.property_name,
      type,
      fin.totalDebt,
      Math.abs(diffDays),
      settings.tone,
      settings.business_name
    );

    const cleanPhone = (tenant.phone || '').replace(/\D/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : '';
    const emailSubject = `Recordatorio de pago de alquiler — ${settings.business_name}`;
    const mailtoUrl = tenant.email ? `mailto:${tenant.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}` : '';

    reminders.push({
      keyId,
      tenantId: tenant.id,
      tenantName: tenant.name,
      propertyName: tenant.property_name || 'Sin asignar',
      phone: tenant.phone,
      cleanPhone,
      email: tenant.email,
      rent,
      totalDebt: fin.totalDebt,
      daysLate: Math.max(0, -diffDays),
      type,
      period: currentPeriod,
      message,
      waUrl,
      mailtoUrl,
      isSent: Boolean(logged?.sent_at),
      sentAt: logged?.sent_at || null,
      channel: logged?.channel || null
    });
  }

  return reminders;
}
