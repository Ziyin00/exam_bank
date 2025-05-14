// app/providers.tsx
"use client"; // This component uses client-side hooks

import React from 'react';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children?: React.ReactNode;
  // You might pass the session from a server component if pre-fetching
  // session?: any;
};

export const NextAuthProvider = ({ children }: Props) => {
  // If passing session from server component:
  // return <SessionProvider session={session}>{children}</SessionProvider>;
  return <SessionProvider>{children}</SessionProvider>;
};