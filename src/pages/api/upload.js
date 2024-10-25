import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { file } = req.body;

  const { data, error } = await supabase.storage
    .from('chat-uploads')
    .upload(`uploads/${file.name}`, file);

  if (error) return res.status(500).json({ error });

  res.status(200).json({ fileUrl: data.publicUrl });
}
