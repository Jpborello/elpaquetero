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

// Baja un archivo multimedia que un cliente mando por WhatsApp (imagen,
// audio, video, documento) y lo re-hospeda en Supabase Storage, porque
// las URLs que da Meta expiran a los pocos minutos.
export async function downloadWhatsAppMedia(supabaseAdmin, mediaId) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Falta la variable de entorno WHATSAPP_ACCESS_TOKEN');
  }

  const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meta = await metaRes.json();
  if (!metaRes.ok || !meta.url) {
    throw new Error(meta?.error?.message || 'No se pudo obtener la URL del archivo de WhatsApp');
  }

  const fileRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!fileRes.ok) {
    throw new Error('No se pudo descargar el archivo de WhatsApp');
  }
  const arrayBuffer = await fileRes.arrayBuffer();
  const mimeType = meta.mime_type || fileRes.headers.get('content-type') || 'application/octet-stream';
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'bin';
  const filePath = `whatsapp_media/${mediaId}_${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabaseAdmin.storage
    .from('Productos')
    .upload(filePath, Buffer.from(arrayBuffer), { contentType: mimeType, upsert: true });
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabaseAdmin.storage.from('Productos').getPublicUrl(filePath);
  return { url: urlData.publicUrl, mimeType };
}

// Inicia una conversación con alguien que todavía no le escribió a la
// empresa por WhatsApp (por ej. dejó el número en el chat web). Requiere
// una plantilla aprobada por Meta, ya que WhatsApp no permite mensajes de
// texto libre iniciados por la empresa fuera de una conversación abierta.
export async function sendWhatsAppTemplate(to, templateName, languageCode, bodyParams = []) {
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
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: bodyParams.length
          ? [{ type: 'body', parameters: bodyParams.map((text) => ({ type: 'text', text })) }]
          : []
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Error enviando la plantilla de WhatsApp');
  }
  return data;
}
