const isConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

const escapeHtml = (str) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Converts plain text into paragraph-separated HTML so line breaks aren't lost in HTML-rendering email clients.
const textToHtml = (text) => text
  .split(/\n\s*\n/)
  .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
  .join('');

const sendMail = async ({ to, subject, text, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text, html: html || (text ? textToHtml(text) : undefined) })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
};

module.exports = { isConfigured, sendMail };
