import { useState, useEffect, useRef } from 'react';
import { drumKits } from '../config/drumKits';
import { audioEngine } from '../utils/audioEngine';
import './MPCSampler.css';

export default function MPCSampler() {
  const [selectedKit, setSelectedKit] = useState('hiphop');
  const [activePads, setActivePads] = useState<Record<number, boolean>>({});
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [showKitSelector, setShowKitSelector] = useState(false);
  const lastTriggerTime = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  const enableAudio = async () => {
    try {
      await audioEngine.initialize();
      setShowAudioPrompt(false);
    } catch (error) {
      console.error('Audio enable error:', error);
    }
  };

  const handlePadTrigger = (padIndex: number) => {
    const now = Date.now();
    const lastTime = lastTriggerTime.current.get(padIndex) || 0;
    
    if (now - lastTime < 100) {
      return;
    }
    
    lastTriggerTime.current.set(padIndex, now);
    
    if (!audioEngine.isReady()) {
      return;
    }

    const pad = drumKits[selectedKit].pads[padIndex];
    setActivePads(prev => ({ ...prev, [padIndex]: true }));

    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    audioEngine.playSound(pad.sample);

    setTimeout(() => {
      setActivePads(prev => {
        const newState = { ...prev };
        delete newState[padIndex];
        return newState;
      });
    }, 150);
  };

  const handleKitSelect = (kitKey: string) => {
    setSelectedKit(kitKey);
    setShowKitSelector(false);
  };

  const currentKit = drumKits[selectedKit];

  return (
    <div className="mpc-fullscreen">
      {/* Audio Prompt Banner */}
      {showAudioPrompt && (
        <div className="audio-prompt-overlay">
          <div className="audio-prompt-card">
            <div className="prompt-icon">🔊</div>
            <h2>Enable Sound</h2>
            <p>Tap to start making beats</p>
            <button className="audio-enable-btn" onClick={enableAudio}>
              Enable Audio
            </button>
          </div>
        </div>
      )}

      {/* Kit Selector Modal */}
      {showKitSelector && (
        <div className="kit-selector-modal" onClick={() => setShowKitSelector(false)}>
          <div className="kit-selector-content" onClick={(e) => e.stopPropagation()}>
            <h2>Choose Drum Kit</h2>
            <div className="kit-options">
              {Object.entries(drumKits).map(([key, kit]) => (
                <button
                  key={key}
                  className={`kit-option ${selectedKit === key ? 'selected' : ''}`}
                  onClick={() => handleKitSelect(key)}
                >
                  <span className="kit-name">{kit.name}</span>
                  {selectedKit === key && <span className="check-mark">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LCD Screen - Larger & Interactive */}
      <div className="lcd-screen-large" onClick={() => setShowKitSelector(true)}>
        <div className="lcd-content-large">
          <div className="lcd-kit-name">{currentKit.name.toUpperCase()}</div>
          <div className="lcd-instruction">TAP TO CHANGE KIT</div>
        </div>
      </div>

      {/* Pad Grid - Larger */}
      <div className="pad-grid-large">
        {currentKit.pads.map((pad, index) => (
          <button
            key={index}
            className={`pad-large ${activePads[index] ? 'active' : ''}`}
            onTouchStart={(e) => {
              e.preventDefault();
              handlePadTrigger(index);
            }}
          >
            <span className="pad-number-large">{(index + 1).toString().padStart(2, '0')}</span>
            <span className="pad-name-large">{pad.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
