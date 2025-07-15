import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nickname?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    nickname?: string | null;
    hashedPassword?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    nickname?: string | null;
  }
} 