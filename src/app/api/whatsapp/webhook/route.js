import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processIncomingChatMessage } from '@/lib/whatsappBot';
import { sendWhatsAppMessage } from '@/lib/whatsappSend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    const { botReply, status, model } = await processIncomingChatMessage(supabaseAdmin, {
      chatId: phone,
      clientName,
      messageText,
      channel: 'whatsapp'
    });

    if (!botReply) {
      return NextResponse.json({
        success: true,
        bot_status: status,
        message: 'Mensaje guardado para respuesta manual del administrador'
      });
    }

    try {
      await sendWhatsAppMessage(phone, botReply);
    } catch (sendErr) {
      console.error('Error enviando respuesta del bot por WhatsApp Cloud API:', sendErr);
    }

    return NextResponse.json({
      success: true,
      bot_reply: botReply,
      model_used: model
    });

  } catch (err) {
    console.error('API Webhook WhatsApp Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
