'use client'

import { useState, useEffect, useRef } from 'react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const searchItems = [
  { category: 'ガイド', title: 'はじめに - Getting Started', description: 'Discord.jsの基本的なセットアップ' },
  { category: 'ガイド', title: 'コマンドの作成', description: 'スラッシュコマンドの実装方法' },
  { category: 'ガイド', title: 'イベントハンドリング', description: 'イベントリスナーの設定' },
  { category: 'クラス', title: 'Client', description: 'メインのDiscordクライアントクラス' },
  { category: 'クラス', title: 'Message', description: 'メッセージオブジェクトの操作' },
  { category: 'クラス', title: 'Guild', description: 'サーバー（ギルド）の管理' },
  { category: 'クラス', title: 'Channel', description: 'チャンネルの操作と管理' },
  { category: 'クラス', title: 'User', description: 'ユーザー情報の取得' },
  { category: 'API', title: 'REST API', description: 'Discord REST APIとの連携' },
  { category: 'API', title: 'WebSocket', description: 'Gatewayイベントの処理' },
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = searchItems.filter(
    item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof searchItems>)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl border border-[#2a2a3a] overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#12121a' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a3a]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ドキュメントを検索..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#55556a]"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a25] border border-[#2a2a3a] text-[#55556a] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#55556a]">
              検索結果がありません
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#55556a]">
                  {category}
                </div>
                {items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#5865F2]/10 transition-colors duration-150 cursor-pointer group"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center text-[#5865F2] group-hover:bg-[#5865F2]/20 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{item.title}</div>
                      <div className="text-xs text-[#55556a] truncate">{item.description}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-[#2a2a3a] flex items-center gap-4 text-[10px] text-[#55556a]">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[#1a1a25] border border-[#2a2a3a] font-mono">↑↓</kbd>
            移動
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[#1a1a25] border border-[#2a2a3a] font-mono">↵</kbd>
            開く
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[#1a1a25] border border-[#2a2a3a] font-mono">ESC</kbd>
            閉じる
          </span>
        </div>
      </div>
    </div>
  )
}
