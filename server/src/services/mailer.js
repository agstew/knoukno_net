import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import { config } from '../config/env.js';
import { query } from '../db/pool.js';
import { generateEmailCopy } from './openai.js';

let transporter = null;
function getTransporter() {
  if (!config.mail.host || !config.mail.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      requireTLS: config.mail.requireTLS,
      auth: { user: config.mail.user, pass: config.mail.password },
    });
  }
  return transporter;
}

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function layout({ intro, body, cta, ctaUrl }) {
  const paragraphs = String(body || '')
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#111">${escapeHtml(p)}</p>`)
    .join('');

  const button = cta && ctaUrl
    ? `<p style="margin:28px 0"><a href="${escapeHtml(ctaUrl)}"
         style="background:#1E90FF;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;
         font-weight:700;display:inline-block">${escapeHtml(cta)}</a></p>`
    : '';

  return `<!doctype html><html><body style="margin:0;background:#f6f8fb;font-family:Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0"
      style="background:#fff;border-top:6px solid #FFD700;border-radius:10px;overflow:hidden">
      <tr><td style="background:#000;padding:20px 32px">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:.5px">Kno U <span style="color:#FFD700">Kno</span></span>
      </td></tr>
      <tr><td style="padding:32px">
        <p style="margin:0 0 16px;font-size:17px;color:#1E90FF;font-weight:600">${escapeHtml(intro || '')}</p>
        ${paragraphs}${button}
      </td></tr>
      <tr><td style="background:#f6f8fb;padding:20px 32px;color:#666;font-size:12px">
        Kno U Kno · <a href="https://${config.domain}" style="color:#1E90FF">${config.domain}</a> · ${escapeHtml(config.supportEmail)}
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

const FALLBACKS = {
  welcome: {
    subject: 'Welcome to Kno U Kno',
    intro: 'Your account is ready.',
    body: 'Kno U Kno walks you from the very first legal step to an open, staffed business. Start by naming your business, then work the questions in order: law, location, hiring, and the people who come to you.\n\nThe questions are yours to answer. We keep every answer so you can grade it, rank it, print it, and come back to it later.',
    cta: 'Open your dashboard',
  },
  broadcast: {
    subject: 'News from Kno U Kno',
    intro: 'A quick update.',
    body: 'Here is what is new at Kno U Kno.',
    cta: 'Visit Kno U Kno',
  },
  password_reset: {
    subject: 'Reset your Kno U Kno password',
    intro: 'Password reset requested.',
    body: 'Use the button below to set a new password. The link expires in one hour.\n\nIf you did not ask for this, you can ignore this email — nothing has changed on your account.',
    cta: 'Reset password',
  },
  receipt: {
    subject: 'Your Kno U Kno receipt',
    intro: 'Thanks for your purchase.',
    body: 'Your plan is active and your questions are unlocked.',
    cta: 'Start answering',
  },
};

/**
 * Sends one of the three transactional emails (welcome, broadcast, password_reset)
 * plus receipts. AI drafts the copy when a key is configured; otherwise a static
 * fallback is used so the flow never breaks.
 */
export async function sendMail({ to, template, userId = null, ctaUrl = null, context = {}, aiCopy = true }) {
  let copy = FALLBACKS[template] || FALLBACKS.broadcast;

  if (aiCopy) {
    try {
      const generated = await generateEmailCopy({ template, context });
      if (generated?.subject && generated?.body) copy = { ...copy, ...generated };
    } catch (err) {
      console.warn(`AI email copy failed for ${template}: ${err.message}`);
    }
  }
  if (context.subject) copy.subject = context.subject;
  if (context.body) copy.body = context.body;

  const html = layout({ ...copy, ctaUrl: ctaUrl || config.appUrl });
  const id = uuid();
  const purgeAfter = new Date();
  purgeAfter.setFullYear(purgeAfter.getFullYear() + config.mail.retentionYears);

  await query(
    `INSERT INTO email_log (id, user_id, to_email, template, subject, body_html, status, purge_after)
     VALUES (:id, :userId, :to, :template, :subject, :html, 'queued', :purgeAfter)`,
    { id, userId, to, template, subject: copy.subject, html, purgeAfter },
  );

  const tx = getTransporter();
  if (!tx) {
    await query(
      `UPDATE email_log SET status = 'failed', error = 'SMTP not configured' WHERE id = :id`,
      { id },
    );
    console.warn(`[mail:${template}] SMTP not configured — logged only for ${to}`);
    return { id, sent: false, subject: copy.subject };
  }

  try {
    const info = await tx.sendMail({ from: config.mail.from, to, subject: copy.subject, html });
    await query(
      `UPDATE email_log SET status = 'sent', provider_ref = :ref WHERE id = :id`,
      { id, ref: info.messageId || null },
    );
    return { id, sent: true, subject: copy.subject };
  } catch (err) {
    await query(`UPDATE email_log SET status = 'failed', error = :error WHERE id = :id`, {
      id,
      error: err.message.slice(0, 500),
    });
    return { id, sent: false, error: err.message, subject: copy.subject };
  }
}

/** Enforces the 2-year email retention rule. */
export async function purgeExpiredEmails() {
  const result = await query(
    `DELETE FROM email_log WHERE purge_after IS NOT NULL AND purge_after < NOW()`,
  );
  return result.affectedRows || 0;
}
