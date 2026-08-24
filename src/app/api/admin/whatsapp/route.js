import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/whatsappSend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const type = searchParams.get('type');

    if (type === 'settings') {
      const { data, error } = await supabaseAdmin
        .from('whatsapp_bot_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      return NextResponse.json({ 
        success: true, 
        settings: data || {
          id: 'main',
          openrouter_key: '',
          model: 'deepseek/deepseek-chat',
          system_prompt: 'Sos el asistente virtual mayorista de El Paquetero.',
          is_global_enabled: true
        } 
      });
    }

    if (phone) {
      // Get messages for specific chat
      const { data: messages, error } = await supabaseAdmin
        .from('whatsapp_messages')
        .select('*')
        .eq('chat_phone', phone)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ success: true, messages });
    }

    // Default: Return list of all chats
    const { data: chats, error } = await supabaseAdmin
      .from('whatsapp_chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, chats: chats || [] });
  } catch (err) {
    console.error('API GET WhatsApp Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'saveSettings') {
      const { openrouter_key, model, system_prompt, is_global_enabled } = body;
      const { data, error } = await supabaseAdmin
        .from('whatsapp_bot_settings')
        .upsert([{
          id: 'main',
          openrouter_key,
          model: model || 'deepseek/deepseek-chat',
          system_prompt,
          is_global_enabled: is_global_enabled !== false,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' })
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, settings: data[0] });
    }

    if (action === 'sendMessage') {
      const { phone, content } = body;
      if (!phone || !content) {
        return NextResponse.json({ error: 'Faltan parámetros phone o content' }, { status: 400 });
      }

      // Save message in whatsapp_messages table
      const msgObj = {
        id: crypto.randomUUID(),
        chat_phone: phone,
        sender: 'admin',
        content,
        created_at: new Date().toISOString()
      };

      const { error: msgErr } = await supabaseAdmin.from('whatsapp_messages').insert([msgObj]);
      if (msgErr) throw msgErr;

      // Update whatsapp_chats last_message and timestamp
      await supabaseAdmin.from('whatsapp_chats').upsert([{
        phone,
        last_message: content,
        unread_count: 0,
        updated_at: new Date().toISOString()
      }], { onConflict: 'phone' });

      // El chat web (sessionId "web-...") no es un número real de WhatsApp,
      // solo el canal de WhatsApp de verdad manda el mensaje por la Cloud API.
      let whatsappError = null;
      if (!phone.startsWith('web-')) {
        try {
          await sendWhatsAppMessage(phone, content);
        } catch (sendErr) {
          console.error('Error enviando mensaje por WhatsApp Cloud API:', sendErr);
          whatsappError = sendErr.message;
        }
      }

      return NextResponse.json({ success: true, message: msgObj, whatsapp_error: whatsappError });
    }

    if (action === 'toggleBot') {
      const { phone, bot_enabled } = body;
      const { error } = await supabaseAdmin
        .from('whatsapp_chats')
        .update({ bot_enabled })
        .eq('phone', phone);

      if (error) throw error;
      return NextResponse.json({ success: true, phone, bot_enabled });
    }

    if (action === 'markRead') {
      const { phone } = body;
      const { error } = await supabaseAdmin
        .from('whatsapp_chats')
        .update({ unread_count: 0 })
        .eq('phone', phone);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteChat') {
      const { phone } = body;
      if (!phone) {
        return NextResponse.json({ error: 'Falta el parámetro phone' }, { status: 400 });
      }

      // Borramos primero los mensajes (no hay FK con cascade) y despues el chat.
      const { error: msgErr } = await supabaseAdmin
        .from('whatsapp_messages')
        .delete()
        .eq('chat_phone', phone);
      if (msgErr) throw msgErr;

      const { error: chatErr } = await supabaseAdmin
        .from('whatsapp_chats')
        .delete()
        .eq('phone', phone);
      if (chatErr) throw chatErr;

      return NextResponse.json({ success: true, phone });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err) {
    console.error('API POST WhatsApp Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
