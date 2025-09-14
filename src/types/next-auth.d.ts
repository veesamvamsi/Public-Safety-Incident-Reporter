import 'next-auth';

declare module 'next-auth' {
  interface User {
    userType?: 'user' | 'admin' | 'official';
  }

  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userType?: 'user' | 'admin' | 'official';
    };
  }
} 