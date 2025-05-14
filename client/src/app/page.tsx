'use client';

import { SessionProvider } from 'next-auth/react';

import SignUp from '../components/auth/Signup';

export default function Home() {

  return (
  
    <SessionProvider>
     
      <SignUp />
    
    </SessionProvider>
  );
}
