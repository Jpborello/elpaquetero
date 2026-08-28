// Normaliza un numero argentino al formato que pide la API de WhatsApp:
// 54 + 9 + codigo de area + numero local, sin 0 ni 15 ni signos. Asi el
// admin puede tipear nomas "341 7981212" (o pegarlo con +54, con 9, con
// espacios, como sea) y siempre termina mandandose bien. Si el numero no
// es argentino (no hay forma de saberlo con certeza), lo dejamos tal cual
// vino una vez limpiado de simbolos, para no romper numeros de otros paises.
function normalizeArgWhatsAppPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  // Sacamos cualquier prefijo que ya haya (54, 549, o el 0 nacional) para
  // no duplicarlo, y siempre le ponemos nosotros el 549 correcto adelante.
  if (digits.startsWith('549')) digits = digits.slice(3);
  else if (digits.startsWith('54')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return `549${digits}`;
}

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
      to: normalizeArgWhatsAppPhone(to),
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

// Manda una imagen ya alojada en una URL publica (ej: Supabase Storage)
// como mensaje de WhatsApp, con un texto opcional de acompañamiento.
export async function sendWhatsAppImage(to, imageUrl, caption) {
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
      to: normalizeArgWhatsAppPhone(to),
      type: 'image',
      image: caption ? { link: imageUrl, caption } : { link: imageUrl }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Error enviando la imagen por WhatsApp');
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
      to: normalizeArgWhatsAppPhone(to),
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
