import { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import sdk from '@farcaster/frame-sdk';
import MPCSampler from './components/MPCSampler';
import './App.css';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  const [isSDKReady, setIsSDKReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          delete (window as any).ethereum;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
        
        try {
          const ctx = await sdk.context;
          console.log('✅ SDK context loaded:', ctx);
        } catch (ctxError) {
          console.warn('⚠️ Context unavailable:', ctxError);
        }
        
        sdk.actions.ready();
        console.log('✅ Ready called');
        
        setIsSDKReady(true);
      } catch (error) {
        console.error('❌ SDK init error:', error);
        try {
          sdk.actions.ready();
        } catch (readyError) {
          console.error('❌ Ready call failed:', readyError);
        }
        setIsSDKReady(true);
      }
    };

    init();
  }, []);

  if (!isSDKReady) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fbbf24',
        fontSize: '20px',
        fontFamily: 'monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔥</div>
          <div>Loading BeatPad...</div>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <MPCSampler />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
