import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WalletConnectICP from './components/WalletConnectICP';
import PetRegistrationICP from './components/PetRegistrationICP';
import Features from './components/Features';
import Footer from './components/Footer';
import { useState } from 'react';

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full flex flex-col items-center justify-start">
        <div className="w-full max-w-7xl pt-24 px-4 sm:px-8">
          <Hero />
          <WalletConnectICP onConnectionChange={setIsConnected} />
          <PetRegistrationICP />
          <Features />
        </div>
        <Footer />
      </main>
    </>
  );
}
