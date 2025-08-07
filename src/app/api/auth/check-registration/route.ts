// 파일 경로: src/app/api/auth/check-registration/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkUserRegistration } from '@/app/auth/actions';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const registrationStatus = await checkUserRegistration({ 
      email: session.user.email 
    });
    
    return NextResponse.json(registrationStatus);
  } catch (error) {
    console.error('Check registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
