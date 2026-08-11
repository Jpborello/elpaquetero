import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// GET Handler: Meta WhatsApp Webhook Verification
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'elpaquetero2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✓ Meta WhatsApp Webhook verificado correctamente!');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Token de verificación inválido' }, { status: 403 });
}

// POST Handler: Incoming WhatsApp Message Processor
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('📩 Webhook WhatsApp recibido:', JSON.stringify(body, null, 2));

    // Support both Meta Cloud API payload structure and direct JSON test body
    let phone = body.phone || body.from;
    let clientName = body.client_name || body.name || 'Cliente WhatsApp';
    let messageText = body.content || body.message || body.text;

    // Parse Meta WhatsApp Webhook payload format
    if (!phone && body.entry && body.entry[0]?.changes[0]?.value?.messages[0]) {
      const value = body.entry[0].changes[0].value;
      const msg = value.messages[0];
      const contact = value.contacts[0];
      phone = msg.from;
      clientName = contact?.profile?.name || 'Cliente WhatsApp';
      messageText = msg.text?.body || '';
    }

    if (!phone || !messageText) {
      return NextResponse.json({ status: 'ignored', reason: 'Payload sin teléfono o texto' });
    }

    const timestamp = new Date().toISOString();

    // 1. Check if chat exists and get bot status
    const { data: existingChat } = await supabaseAdmin
      .from('whatsapp_chats')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    const isBotEnabledForChat = existingChat ? existingChat.bot_enabled !== false : true;
    const currentUnread = (existingChat?.unread_count || 0) + 1;

    // 2. Save incoming client message
    const clientMsgObj = {
      id: crypto.randomUUID(),
      chat_phone: phone,
      sender: 'client',
      content: messageText,
      created_at: timestamp
    };
    await supabaseAdmin.from('whatsapp_messages').insert([clientMsgObj]);

    // 3. Upsert whatsapp_chats
    await supabaseAdmin.from('whatsapp_chats').upsert([{
      phone,
      client_name: clientName,
      last_message: messageText,
      unread_count: currentUnread,
      bot_enabled: isBotEnabledForChat,
      updated_at: timestamp
    }], { onConflict: 'phone' });

    // 4. Fetch Bot Settings & OpenRouter Key
    const { data: settings } = await supabaseAdmin
      .from('whatsapp_bot_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    const globalEnabled = settings ? settings.is_global_enabled !== false : true;
    const openrouterKey = process.env.OPENROUTER_API_KEY || settings?.openrouter_key;

    // If bot is disabled globally or for this chat, stop here (human agent will reply from Admin tab)
    if (!globalEnabled || !isBotEnabledForChat || !openrouterKey) {
      return NextResponse.json({ 
        success: true, 
        bot_status: 'disabled_or_no_key',
        message: 'Mensaje guardado para respuesta manual del administrador' 
      });
    }

    // 5. Build Store Context from Supabase Products DB
    const { data: products } = await supabaseAdmin.from('products').select('*');
    const catalogSummary = (products || []).map(p => 
      `- ${p.name} | Cat: ${p.category} (${p.subcategory || ''}) | Precio Mayorista: $${p.wholesale_price} | Stock: ${p.stock} | Desc: ${p.description || ''}`
    ).join('\n');

    const systemPrompt = (settings?.system_prompt || `Sos el asistente virtual mayorista oficial de El Paquetero.`) + `

DATOS OFICIALES DE LA TIENDA Y CATÁLOGO ACTUALIZADO:
- Alias de Transferencia: 'el.paquetero.godoy' (Titular: María Leandra Bernardi, CUIT: 27-30938323-6)
- Envíos a todo el país por transporte o correo.
- Mínimo de compra mayorista flexible.

CATÁLOGO DE PRODUCTOS EN STOCK:
${catalogSummary}
`;

    // Fetch last 6 messages for conversation context
    const { data: history } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*')
      .eq('chat_phone', phone)
      .order('created_at', { ascending: false })
      .limit(6);

    const formattedHistory = (history || []).reverse().map(m => ({
      role: m.sender === 'client' ? 'user' : 'assistant',
      content: m.content
    }));

    // 6. Call OpenRouter API
    const openrouterModel = settings?.model || 'google/gemini-2.0-flash-001';

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://elpaquetero.com',
        'X-Title': 'El Paquetero WhatsApp Assistant',
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
      return NextResponse.json({ error: 'Error OpenRouter API', details: errText }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const botReply = aiData.choices?.[0]?.message?.content || '¡Hola! Muchas gracias por comunicarte con El Paquetero. ¿En qué prenda o talle te podemos asesorar?';

    const botTimestamp = new Date().toISOString();

    // 7. Save Bot Reply to Supabase DB
    const botMsgObj = {
      id: crypto.randomUUID(),
      chat_phone: phone,
      sender: 'bot',
      content: botReply,
      created_at: botTimestamp
    };
    await supabaseAdmin.from('whatsapp_messages').insert([botMsgObj]);

    // Update whatsapp_chats last_message
    await supabaseAdmin.from('whatsapp_chats').upsert([{
      phone,
      last_message: botReply,
      updated_at: botTimestamp
    }], { onConflict: 'phone' });

    return NextResponse.json({
      success: true,
      bot_reply: botReply,
      model_used: openrouterModel
    });

  } catch (err) {
    console.error('API Webhook WhatsApp Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
