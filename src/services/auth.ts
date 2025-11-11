import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { logLogin } from './audit.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);


function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain a special character.';
  return null;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  try {
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      return { error: strengthError };
    }
    const passwordHash = await hashPassword(password);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          email_verified: false,
          email_verification_token: emailVerificationToken,
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

    // Send verification email
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    await sendVerificationEmail(email, emailVerificationToken, baseUrl);

    return { data };
  } catch (error) {
    return { error: 'Registration failed' };
  }
}

export async function verifyEmail(token: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email_verification_token', token)
      .single();

    if (error || !user) {
      return { error: 'Invalid or expired verification token' };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return { error: 'Failed to verify email' };
    }

    return { success: true, email: user.email };
  } catch (error) {
    return { error: 'Email verification failed' };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email_verified, email_verification_token')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { error: 'User not found' };
    }

    if (user.email_verified) {
      return { error: 'Email already verified' };
    }

    // Generate new token if none exists
    let token = user.email_verification_token;
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      const { error: updateError } = await supabase
        .from('users')
        .update({ email_verification_token: token })
        .eq('id', user.id);

      if (updateError) {
        return { error: 'Failed to generate verification token' };
      }
    }

    await sendVerificationEmail(email, token, process.env.BASE_URL || 'http://localhost:4000');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to resend verification email' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash')
      .eq('email', email)
      .single();

    if (error || !data) {
      return { error: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
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

    // Log successful login
    await logLogin(data.id);

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

export async function requestPasswordReset(email: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if email exists for security
      return { success: true };
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return { error: 'Failed to generate reset token' };
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    await sendPasswordResetEmail(email, resetToken, baseUrl);

    return { success: true };
  } catch (error) {
    return { error: 'Password reset request failed' };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return { error: strengthError };
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_reset_expires')
      .eq('password_reset_token', token)
      .single();

    if (error || !user) {
      return { error: 'Invalid or expired reset token' };
    }

    // Check if token has expired
    if (new Date(user.password_reset_expires) < new Date()) {
      return { error: 'Reset token has expired' };
    }

    const passwordHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return { error: 'Failed to reset password' };
    }

    return { success: true };
  } catch (error) {
    return { error: 'Password reset failed' };
  }
}
