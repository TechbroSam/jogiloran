// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    await resend.emails.send({
      // IMPORTANT: Replace with your verified domain email
      from: 'Axion Leather <support@samuelobior.com>', 
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Please click the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return NextResponse.json({ message: 'A reset link has been sent.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}