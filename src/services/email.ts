// Email service for verification, password reset, and notifications
// Note: Requires nodemailer to be installed: npm install nodemailer @types/nodemailer

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email service configuration (placeholder - requires env vars)
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // TODO: Configure with actual email service (SendGrid, AWS SES, etc.)
  // For now, just log the email
  console.log('Email would be sent:', options);
  return true;
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const verificationUrl = `${baseUrl}/verify-email/${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Kids Church Check-in',
    html: `
      <h1>Welcome to Kids Church Check-in System!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
    text: `Welcome to Kids Church Check-in System! Please verify your email: ${verificationUrl}`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/reset-password/${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Password Reset - Kids Church Check-in',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Password Reset Request. Click here: ${resetUrl}`,
  });
}

export async function sendCheckInNotification(
  email: string,
  childName: string,
  securityCode: string,
  checkInTime: string
) {
  return sendEmail({
    to: email,
    subject: `${childName} Checked In - Security Code: ${securityCode}`,
    html: `
      <h1>Check-in Confirmation</h1>
      <p><strong>${childName}</strong> has been checked in successfully.</p>
      <p><strong>Security Code:</strong> ${securityCode}</p>
      <p><strong>Time:</strong> ${new Date(checkInTime).toLocaleString()}</p>
      <p>Please keep this security code to check out your child.</p>
    `,
    text: `${childName} checked in. Security Code: ${securityCode}`,
  });
}

export async function sendCheckOutNotification(
  email: string,
  childName: string,
  checkOutTime: string
) {
  return sendEmail({
    to: email,
    subject: `${childName} Checked Out`,
    html: `
      <h1>Check-out Confirmation</h1>
      <p><strong>${childName}</strong> has been checked out successfully.</p>
      <p><strong>Time:</strong> ${new Date(checkOutTime).toLocaleString()}</p>
      <p>Thank you for using Kids Church Check-in System!</p>
    `,
    text: `${childName} checked out at ${new Date(checkOutTime).toLocaleString()}`,
  });
}
