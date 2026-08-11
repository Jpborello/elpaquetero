const DEFAULT_SYSTEM_PROMPT = `Sos el asistente virtual de ventas oficial de 'El Paquetero', tienda mayorista de indumentaria en Rosario.
Tu función es responder a los clientes de forma clara, directa, amable y SIN DIVAGAR, basándote exclusivamente en la información oficial de la tienda.

DATOS OFICIALES Y PREGUNTAS FRECUENTES:

1. MÉTODOS DE PAGO:
   - Aceptamos Transferencia bancaria / Mercado Pago y Efectivo en el local.
   - Datos de Transferencia: Alias 'el.paquetero.godoy' (Titular: María Leandra Bernardi, CUIT: 27-30938323-6).

2. DIRECCIÓN Y HORARIOS DE ATENCIÓN:
   - Dirección del local: Camilo Aldao 2715 esquina ex Godoy (Rosario, Santa Fe).
   - Horario de Atención: De Lunes a Sábados de 8:00 AM a 4:30 PM (16:30 hs).

3. MODALIDAD DE VENTA & ENVÍOS:
   - ¿Venden por unidad? Sí, vendemos por unidad, por curva completa de talles y también podés armar surtido o variedad de prendas.
   - ¿El envío está incluido? Por el momento el envío NO está incluido en el precio del pedido (corre por cuenta del comprador).

4. REALIZACIÓN DE PEDIDOS Y COMPROBANTES:
   - Podés armar tu pedido directamente en la web o por este chat.
   - El comprobante de pago lo podés enviar por acá mismo subiéndolo o adjuntándolo al hacer tu pedido en la web.

5. ATENCIÓN CON REPRESENTANTE HUMANO:
   - Si el cliente solicita hablar con una persona, asesor o representante, respondé amablemente: "¡Por supuesto! Te derivo en este momento con un asesor humano de El Paquetero para que te atienda de forma directa."

6. TONO Y FORMATO:
   - Sé claro, puntual, educado y sin rodeos (evitá divagar). Dá respuestas de 2 a 4 oraciones bien formateadas.`;

// Procesa un mensaje entrante de CUALQUIER canal (WhatsApp o Chat Web) contra
// las mismas tablas whatsapp_chats/whatsapp_messages, para que el admin vea
// y responda todo desde un unico inbox sin importar de donde vino.
export async function processIncomingChatMessage(supabaseAdmin, { chatId, clientName, messageText, channel }) {
  const timestamp = new Date().toISOString();

  const { data: existingChat } = await supabaseAdmin
    .from('whatsapp_chats')
    .select('*')
    .eq('phone', chatId)
    .maybeSingle();

  const isBotEnabledForChat = existingChat ? existingChat.bot_enabled !== false : true;
  const currentUnread = (existingChat?.unread_count || 0) + 1;

  await supabaseAdmin.from('whatsapp_messages').insert([{
    id: crypto.randomUUID(),
    chat_phone: chatId,
    sender: 'client',
    content: messageText,
    created_at: timestamp
  }]);

  await supabaseAdmin.from('whatsapp_chats').upsert([{
    phone: chatId,
    client_name: clientName,
    channel: existingChat?.channel || channel,
    last_message: messageText,
    unread_count: currentUnread,
    bot_enabled: isBotEnabledForChat,
    updated_at: timestamp
  }], { onConflict: 'phone' });

  const { data: settings } = await supabaseAdmin
    .from('whatsapp_bot_settings')
    .select('*')
    .eq('id', 'main')
    .maybeSingle();

  const globalEnabled = settings ? settings.is_global_enabled !== false : true;
  const openrouterKey = process.env.OPENROUTER_API_KEY || settings?.openrouter_key;

  if (!globalEnabled || !isBotEnabledForChat || !openrouterKey) {
    return { botReply: null, status: 'disabled_or_no_key' };
  }

  const { data: products } = await supabaseAdmin.from('products').select('*').gt('stock', 0);
  const catalogSummary = (products || []).map(p =>
    `- ${p.name} | Cat: ${p.category} (${p.subcategory || ''}) | Precio Mayorista: $${p.wholesale_price} | Stock: ${p.stock} | Desc: ${p.description || ''}`
  ).join('\n');

  const systemPrompt = (settings?.system_prompt || DEFAULT_SYSTEM_PROMPT) + `

CATÁLOGO DE PRODUCTOS ACTUALIZADO EN STOCK:
${catalogSummary}
`;

  const { data: history } = await supabaseAdmin
    .from('whatsapp_messages')
    .select('*')
    .eq('chat_phone', chatId)
    .order('created_at', { ascending: false })
    .limit(6);

  const formattedHistory = (history || []).reverse().map(m => ({
    role: m.sender === 'client' ? 'user' : 'assistant',
    content: m.content
  }));

  const openrouterModel = settings?.model || 'deepseek/deepseek-chat';

  const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'HTTP-Referer': 'https://elpaquetero.com',
      'X-Title': 'El Paquetero Assistant',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: openrouterModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory
      ],
      temperature: 0.4,
      max_tokens: 450
    })
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error('Error OpenRouter API:', errText);
    return { botReply: null, status: 'ai_error', error: errText };
  }

  const aiData = await aiRes.json();
  const botReply = aiData.choices?.[0]?.message?.content || '¡Hola! Muchas gracias por comunicarte con El Paquetero. ¿En qué prenda o talle te podemos asesorar?';

  const botTimestamp = new Date().toISOString();

  await supabaseAdmin.from('whatsapp_messages').insert([{
    id: crypto.randomUUID(),
    chat_phone: chatId,
    sender: 'bot',
    content: botReply,
    created_at: botTimestamp
  }]);

  await supabaseAdmin.from('whatsapp_chats').upsert([{
    phone: chatId,
    last_message: botReply,
    updated_at: botTimestamp
  }], { onConflict: 'phone' });

  return { botReply, status: 'ok', model: openrouterModel };
}
