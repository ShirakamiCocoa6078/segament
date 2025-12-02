import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: string;
      nickname?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    userId: string;
    nickname?: string | null;
    hashedPassword?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userId: string;
    nickname?: string | null;
  }
} 