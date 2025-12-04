import { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import sdk from '@farcaster/frame-sdk';
import MPCSampler from './components/MPCSampler';
import Feed from './components/Feed';
import './App.css';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

type Tab = 'create' | 'feed';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [isSDKReady, setIsSDKReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Get context FIRST (this initializes the SDK)
        const ctx = await sdk.context;
        console.log('✅ SDK context loaded:', ctx);
        
        // THEN call ready
        sdk.actions.ready();
        console.log('✅ Ready called');
        
        setIsSDKReady(true);
      } catch (error) {
        console.error('❌ SDK init error:', error);
        // Still call ready even on error
        sdk.actions.ready();
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
          <div className="app">
            <header className="app-header">
              <div className="logo">
                <span className="fire">🔥</span>
                <span className="title">BeatPad</span>
              </div>
              <div className="subtitle">by 3UILD</div>
            </header>

            <nav className="bottom-nav">
              <button
                className={`nav-button ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <span className="nav-icon">🎛️</span>
                <span className="nav-label">Create</span>
              </button>
              <button
                className={`nav-button ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                <span className="nav-icon">📱</span>
                <span className="nav-label">Feed</span>
              </button>
            </nav>

            <main className="app-content">
              {activeTab === 'create' ? <MPCSampler /> : <Feed />}
            </main>
          </div>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
