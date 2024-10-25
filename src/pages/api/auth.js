import { supabase } from '../../lib/supabaseClient';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  const { email, password, action } = req.body;

  if (action === 'register') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword }]);
    if (error) return res.status(400).json({ error });
    res.status(201).json({ message: 'User registered' });
  } else if (action === 'login') {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) return res.status(400).json({ error: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    res.status(200).json({ user });
  }
}
