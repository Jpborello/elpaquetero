// Envío saliente real por la WhatsApp Cloud API (Graph API de Meta).
// Requiere WHATSAPP_ACCESS_TOKEN (token de Usuario del Sistema, permiso
// whatsapp_business_management) y WHATSAPP_PHONE_NUMBER_ID en las env vars.
export async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('Faltan las variables de entorno WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID');
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Error enviando el mensaje de WhatsApp');
  }
  return data;
}
