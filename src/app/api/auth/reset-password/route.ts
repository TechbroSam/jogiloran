// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Password complexity regex
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*]).{8,}$/;

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Missing token or password.' }, { status: 400 });
    }

    // --- PASSWORD VALIDATION ---
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password does not meet the requirements. It must be at least 8 characters long and include an uppercase letter, a number, and a special character.' },
        { status: 400 }
      );
    }
    // --- END VALIDATION ---

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Password reset token is invalid or has expired.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (err: unknown) {
    console.error('Error in reset-password route:', err);
    const errorMessage = err instanceof Error ? err.message : 'An internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}