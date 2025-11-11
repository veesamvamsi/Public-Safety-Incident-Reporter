import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // your existing logic here
        const user = {
          id: "1",
          name: "John Doe",
          email: credentials?.email,
          userType: "user" as "user" | "admin" | "official"
        };
        return user;
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.userType = (token as any).userType as "user" | "admin" | "official";
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
