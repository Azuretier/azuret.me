import { useState, useEffect } from 'react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const AFFIRMATIONS = [
  "あなたの存在は、この瞬間を意味あるものにしている",
  "限界は、超えるためにある",
  "特別であることに、理由は要らない",
  "流れに身を任せよ、しかし流されるな",
  "今日のあなたは、昨日を超えている",
  "存在すること、それ自体が革命である",
  "インスピレーションを待つな、創り出せ",
  "沈黙もまた、言葉である",
  "あなたの声は、世界を変える力を持っている",
  "消えゆくからこそ、今が輝く"
];

export default function FlowSNS() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('timeline');
  const [now, setNow] = useState(Date.now());
  const [affirmation, setAffirmation] = useState('');
  const [showAffirmation, setShowAffirmation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const triggerAffirmation = () => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    setShowAffirmation(true);
    setTimeout(() => setShowAffirmation(false), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      try {
        const userData = await window.storage.get('flow-user');
        if (userData?.value) {
          const parsed = JSON.parse(userData.value);
          if (Date.now() - parsed.createdAt < SEVEN_DAYS_MS) {
            setUser(parsed);
          } else {
            await window.storage.delete('flow-user');
          }
        }
      } catch (e) {}

      try {
        const postsData = await window.storage.get('flow-posts', true);
        if (postsData?.value) {
          const allPosts = JSON.parse(postsData.value);
          const validPosts = allPosts.filter(p => Date.now() - p.createdAt < SEVEN_DAYS_MS);
          setPosts(validPosts.sort((a, b) => b.createdAt - a.createdAt));
          if (validPosts.length !== allPosts.length) {
            await window.storage.set('flow-posts', JSON.stringify(validPosts), true);
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const createAccount = async () => {
    if (!username.trim() || username.length < 2) return;
    const newUser = {
      id: Math.random().toString(36).slice(2),
      name: username.trim(),
      createdAt: Date.now()
    };
    try {
      await window.storage.set('flow-user', JSON.stringify(newUser));
      setUser(newUser);
      setUsername('');
      triggerAffirmation();
    } catch (err) {
      console.error('Create account error:', err);
    }
  };

  const submitPost = async () => {
    if (!newPost.trim() || !user) return;
    const post = {
      id: Math.random().toString(36).slice(2),
      userId: user.id,
      userName: user.name,
      content: newPost.trim(),
      createdAt: Date.now(),
      resonance: []
    };
    const updatedPosts = [post, ...posts];
    try {
      await window.storage.set('flow-posts', JSON.stringify(updatedPosts), true);
      setPosts(updatedPosts);
      setNewPost('');
      triggerAffirmation();
    } catch (err) {
      console.error('Post error:', err);
    }
  };

  const toggleResonance = async (postId) => {
    if (!user) return;
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const resonance = p.resonance || [];
        const hasResonated = resonance.includes(user.id);
        return {
          ...p,
          resonance: hasResonated ? resonance.filter(id => id !== user.id) : [...resonance, user.id]
        };
      }
      return p;
    });
    try {
      await window.storage.set('flow-posts', JSON.stringify(updatedPosts), true);
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Resonance error:', err);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('存在の証を消去しますか？')) return;
    try {
      await window.storage.delete('flow-user');
      const filteredPosts = posts.filter(p => p.userId !== user.id);
      await window.storage.set('flow-posts', JSON.stringify(filteredPosts), true);
      setPosts(filteredPosts);
      setUser(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatTimeLeft = (createdAt) => {
    const remaining = SEVEN_DAYS_MS - (now - createdAt);
    if (remaining <= 0) return '消滅';
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getLifePercent = (createdAt) => {
    return Math.max(0, 100 - ((now - createdAt) / SEVEN_DAYS_MS) * 100);
  };

  const formatTimeAgo = (timestamp) => {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return 'now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border border-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-neutral-500 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Entry Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-neutral-500 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-neutral-500 rounded-full"></div>
        </div>

        <div className="max-w-lg w-full relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-extralight text-white tracking-tight mb-4">Flow</h1>
            <div className="w-16 h-px bg-neutral-700 mx-auto mb-6"></div>
            <p className="text-neutral-400 text-lg font-light tracking-wide">あなたの存在を肯定する</p>
          </div>

          <div className="space-y-8">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createAccount()}
                placeholder="あなたの名前"
                maxLength={20}
                className="w-full bg-transparent border-b border-neutral-800 px-0 py-4 text-white text-xl font-light text-center placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            <button
              onClick={createAccount}
              disabled={!username.trim() || username.length < 2}
              className="w-full border border-neutral-700 text-white py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              存在を刻む
            </button>

            <div className="text-center space-y-3 pt-8">
              <p className="text-neutral-600 text-xs tracking-wider">7日間の存在証明</p>
              <p className="text-neutral-700 text-xs">限界を超えろ。インスピレーションを倒せ。</p>
            </div>
          </div>

          {/* Preview */}
          {posts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-neutral-900">
              <p className="text-neutral-600 text-xs tracking-widest uppercase text-center mb-6">Recent Flows</p>
              <div className="space-y-4">
                {posts.slice(0, 2).map(post => (
                  <div key={post.id} className="text-center">
                    <p className="text-neutral-400 text-sm font-light italic">"{post.content.slice(0, 60)}{post.content.length > 60 ? '...' : ''}"</p>
                    <p className="text-neutral-700 text-xs mt-2">— {post.userName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Interface
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Affirmation Overlay */}
      {showAffirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-pulse">
          <p className="text-2xl md:text-4xl font-extralight text-center px-8 max-w-2xl leading-relaxed">
            {affirmation}
          </p>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-900">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView('timeline')} className="text-2xl font-extralight tracking-tight hover:opacity-60 transition">
            Flow
          </button>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-neutral-600 text-xs tracking-wider uppercase">存在期限</p>
              <p className="text-neutral-400 text-sm font-light">{formatTimeLeft(user.createdAt)}</p>
            </div>

            <button
              onClick={() => setView(view === 'timeline' ? 'self' : 'timeline')}
              className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-sm font-light hover:border-neutral-600 transition"
            >
              {user.name[0]}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        {view === 'self' ? (
          // Self View
          <div className="space-y-12">
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full border border-neutral-800 flex items-center justify-center text-3xl font-extralight mx-auto mb-6">
                {user.name[0]}
              </div>
              <h2 className="text-3xl font-extralight mb-2">{user.name}</h2>
              <p className="text-neutral-600 text-sm">存在証明 #{user.id.slice(0, 8)}</p>
            </div>

            {/* Life Bar */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-neutral-600 tracking-wider uppercase">
                <span>残存エネルギー</span>
                <span>{formatTimeLeft(user.createdAt)}</span>
              </div>
              <div className="h-px bg-neutral-900 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-white to-neutral-500 transition-all duration-1000"
                  style={{ width: `${getLifePercent(user.createdAt)}%` }}
                />
              </div>
              <p className="text-neutral-700 text-xs text-center italic">
                "消えゆくからこそ、今が輝く"
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-px bg-neutral-900">
              <div className="bg-neutral-950 p-8 text-center">
                <p className="text-4xl font-extralight mb-2">{posts.filter(p => p.userId === user.id).length}</p>
                <p className="text-neutral-600 text-xs tracking-widest uppercase">Flows</p>
              </div>
              <div className="bg-neutral-950 p-8 text-center">
                <p className="text-4xl font-extralight mb-2">
                  {posts.filter(p => p.userId === user.id).reduce((sum, p) => sum + (p.resonance?.length || 0), 0)}
                </p>
                <p className="text-neutral-600 text-xs tracking-widest uppercase">Resonance</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <button
                onClick={() => setView('timeline')}
                className="w-full border border-neutral-800 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500"
              >
                Timeline
              </button>
              <button
                onClick={deleteAccount}
                className="w-full text-neutral-700 py-4 text-xs tracking-widest uppercase hover:text-red-500 transition"
              >
                存在を消去
              </button>
            </div>
          </div>
        ) : (
          // Timeline
          <div className="space-y-12">
            {/* Composer */}
            <div className="space-y-6 pb-12 border-b border-neutral-900">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="限界を超えろ..."
                rows={4}
                maxLength={500}
                className="w-full bg-transparent text-xl font-extralight placeholder-neutral-700 resize-none focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 text-xs">{newPost.length}/500</span>
                <button
                  onClick={submitPost}
                  disabled={!newPost.trim()}
                  className="border border-neutral-700 px-8 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
                >
                  Flow
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-neutral-600 text-lg font-extralight mb-4">静寂</p>
                <p className="text-neutral-700 text-sm">最初の Flow を刻め</p>
              </div>
            ) : (
              <div className="space-y-0">
                {posts.map((post, index) => (
                  <div key={post.id} className="group py-10 border-b border-neutral-900/50 last:border-0">
                    <div className="space-y-6">
                      {/* Content */}
                      <p className="text-xl md:text-2xl font-extralight leading-relaxed">
                        {post.content}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-neutral-600 text-xs tracking-wider">
                          <span>{post.userName}</span>
                          <span>·</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Life indicator */}
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-px bg-neutral-900 relative">
                              <div
                                className="absolute top-0 left-0 h-full bg-neutral-600 transition-all"
                                style={{ width: `${getLifePercent(post.createdAt)}%` }}
                              />
                            </div>
                            <span className="text-neutral-700 text-xs">{formatTimeLeft(post.createdAt)}</span>
                          </div>

                          {/* Resonance */}
                          <button
                            onClick={() => toggleResonance(post.id)}
                            className={`flex items-center gap-2 transition-colors ${
                              post.resonance?.includes(user.id)
                                ? 'text-white'
                                : 'text-neutral-700 hover:text-neutral-400'
                            }`}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="6" className={post.resonance?.includes(user.id) ? 'fill-current' : ''} />
                              <circle cx="12" cy="12" r="2" className="fill-current" />
                            </svg>
                            <span className="text-xs">{post.resonance?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Affirmation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-sm border-t border-neutral-900">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <p className="text-neutral-700 text-xs text-center tracking-wider">
            社会に意義を。存在を肯定せよ。
          </p>
        </div>
      </footer>
    </div>
  );
}
