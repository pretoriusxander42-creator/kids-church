import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uplevjwjgloyyotwwiuv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbGV2andqZ2xveXlvdHd3aXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjYzMjQsImV4cCI6MjA3ODQwMjMyNH0.LBOpDn0rba_EiiVVmdpx4Xt1cF1ySV_jB2klKWfnTyE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  try {
    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'Email already registered' };
      }
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    return { error: 'Registration failed' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash')
      .eq('email', email)
      .single();

    if (error || !data) {
      return { error: 'Invalid credentials' };
    }

    if (data.password_hash !== passwordHash) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign(
      {
        sub: data.id,
        email: data.email,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
      },
    };
  } catch (error) {
    return { error: 'Login failed' };
  }
}
