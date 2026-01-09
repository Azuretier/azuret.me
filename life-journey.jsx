import { useState } from 'react';

const chapters = [
  {
    id: 'birth',
    title: '誕生',
    subtitle: 'Genesis',
    color: '#FFE4E1',
    accent: '#FF6B6B',
    emoji: '🌅',
    poem: '光の中へ',
    description: '無限の可能性を抱いて、この世界に生まれ落ちる瞬間。すべてが新しく、すべてが眩しい。',
    visual: 'radial-gradient(ellipse at 50% 100%, #FFB6C1 0%, #FFE4E1 40%, #FFF8DC 100%)'
  },
  {
    id: 'growth',
    title: '成長',
    subtitle: 'Bloom',
    color: '#E8F5E9',
    accent: '#4CAF50',
    emoji: '🌱',
    poem: '根を張り、空へ',
    description: '小さな芽が土を破り、太陽に向かって伸びていく。好奇心と発見の日々。',
    visual: 'linear-gradient(180deg, #87CEEB 0%, #E8F5E9 50%, #8B4513 100%)'
  },
  {
    id: 'adventure',
    title: '冒険',
    subtitle: 'Journey',
    color: '#E3F2FD',
    accent: '#2196F3',
    emoji: '⛵',
    poem: '未知なる海へ',
    description: '広い世界に飛び出し、自分だけの道を切り開く。挑戦と勇気の季節。',
    visual: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  },
  {
    id: 'love',
    title: '愛',
    subtitle: 'Love',
    color: '#FCE4EC',
    accent: '#E91E63',
    emoji: '💕',
    poem: '二つの魂が出会う',
    description: '誰かと深く繋がり、心を開く喜びと痛み。人生を彩る最も美しい感情。',
    visual: 'radial-gradient(circle at 30% 30%, #FF69B4 0%, #FFB6C1 30%, #FFF0F5 100%)'
  },
  {
    id: 'struggle',
    title: '試練',
    subtitle: 'Storm',
    color: '#ECEFF1',
    accent: '#607D8B',
    emoji: '🌊',
    poem: '嵐を越えて',
    description: '暗闘の中で自分と向き合う。傷つきながらも、強さを見つける時。',
    visual: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  },
  {
    id: 'wisdom',
    title: '成熟',
    subtitle: 'Harvest',
    color: '#FFF8E1',
    accent: '#FF9800',
    emoji: '🍂',
    poem: '実りの秋',
    description: '経験が知恵となり、人生の深みを理解する。穏やかな強さと慈しみ。',
    visual: 'linear-gradient(135deg, #F4A460 0%, #DAA520 50%, #8B4513 100%)'
  },
  {
    id: 'legacy',
    title: '継承',
    subtitle: 'Legacy',
    color: '#F3E5F5',
    accent: '#9C27B0',
    emoji: '✨',
    poem: '星になる',
    description: '自分が残すものは何か。次の世代へと繋がる、永遠の物語。',
    visual: 'radial-gradient(ellipse at 50% 0%, #2c003e 0%, #0d0015 50%, #000 100%)'
  }
];

export default function LifeJourney() {
  const [activeTab, setActiveTab] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (index) => {
    if (index === activeTab || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(index);
      setIsTransitioning(false);
    }, 300);
  };

  const current = chapters[activeTab];
  const isDark = activeTab === 4 || activeTab === 6;

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '"Noto Serif JP", Georgia, serif',
      background: current.visual,
      transition: 'background 0.8s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;500;700&family=Zen+Kaku+Gothic+New:wght@300;400&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .tab-button {
          position: relative;
          padding: 12px 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.6;
        }
        
        .tab-button:hover {
          opacity: 1;
          transform: translateY(-4px);
        }
        
        .tab-button.active {
          opacity: 1;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: currentColor;
          border-radius: 2px;
        }
        
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
        }
        
        .floating-emoji {
          position: absolute;
          font-size: 80px;
          animation: float 6s ease-in-out infinite;
          opacity: 0.3;
          filter: blur(2px);
          z-index: 0;
        }
        
        .main-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 600px;
          animation: slideUp 0.6s ease-out;
        }
        
        .chapter-emoji {
          font-size: 100px;
          animation: pulse 3s ease-in-out infinite;
          margin-bottom: 20px;
        }
        
        .chapter-title {
          font-size: 4rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          margin: 0;
          text-shadow: 0 4px 30px rgba(0,0,0,0.1);
        }
        
        .chapter-subtitle {
          font-family: 'Zen Kaku Gothic New', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          opacity: 0.7;
          margin-top: 8px;
        }
        
        .chapter-poem {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 30px 0;
          font-style: italic;
          opacity: 0.9;
        }
        
        .chapter-description {
          font-family: 'Zen Kaku Gothic New', sans-serif;
          font-size: 1.1rem;
          line-height: 2;
          opacity: 0.85;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255,255,255,0.2);
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .star {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: starTwinkle 2s ease-in-out infinite;
        }
      `}</style>

      {/* Stars for dark themes */}
      {isDark && Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.5 + 0.3
          }}
        />
      ))}

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '30px 20px 20px',
        flexWrap: 'wrap',
        color: isDark ? '#fff' : '#333'
      }}>
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabChange(index)}
            style={{ color: 'inherit' }}
          >
            <span style={{ fontSize: '24px' }}>{chapter.emoji}</span>
            <span style={{
              fontSize: '12px',
              fontFamily: '"Zen Kaku Gothic New", sans-serif',
              letterSpacing: '0.1em'
            }}>
              {chapter.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="content-area" style={{
        color: isDark ? '#fff' : '#333',
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        {/* Floating background emojis */}
        <span className="floating-emoji" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>
          {current.emoji}
        </span>
        <span className="floating-emoji" style={{ top: '60%', right: '10%', animationDelay: '2s' }}>
          {current.emoji}
        </span>
        <span className="floating-emoji" style={{ bottom: '20%', left: '15%', animationDelay: '4s' }}>
          {current.emoji}
        </span>

        <div className="main-content" key={activeTab}>
          <div className="chapter-emoji">{current.emoji}</div>
          <h1 className="chapter-title">{current.title}</h1>
          <p className="chapter-subtitle">{current.subtitle}</p>
          <p className="chapter-poem">「{current.poem}」</p>
          <p className="chapter-description">{current.description}</p>
        </div>
      </main>

      {/* Progress indicator */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{
            width: `${((activeTab + 1) / chapters.length) * 100}%`,
            background: current.accent
          }}
        />
      </div>

      {/* Chapter counter */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        fontFamily: '"Zen Kaku Gothic New", sans-serif',
        fontSize: '14px',
        opacity: 0.6,
        color: isDark ? '#fff' : '#333'
      }}>
        {String(activeTab + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
      </div>
    </div>
  );
}
