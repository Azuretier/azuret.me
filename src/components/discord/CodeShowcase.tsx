'use client'

import { useState } from 'react'

const codeExamples = [
  {
    id: 'basic',
    title: '基本的なBot',
    description: '数行のコードでDiscord Botを起動',
    code: `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(\`\${client.user.tag} でログインしました！\`);
});

client.on('messageCreate', message => {
  if (message.content === 'ping') {
    message.reply('Pong! 🏓');
  }
});

client.login('your-token-here');`,
  },
  {
    id: 'slash',
    title: 'スラッシュコマンド',
    description: 'モダンなスラッシュコマンドの実装',
    code: `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('サーバー情報を表示します'),

  async execute(interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'メンバー数', value: \`\${guild.memberCount}\`, inline: true },
        { name: '作成日', value: guild.createdAt.toLocaleDateString('ja-JP'), inline: true },
        { name: 'ブースト', value: \`レベル \${guild.premiumTier}\`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};`,
  },
  {
    id: 'button',
    title: 'ボタンとコンポーネント',
    description: 'インタラクティブなUIコンポーネント',
    code: `const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// ボタンを作成
const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('approve')
      .setLabel('承認')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId('deny')
      .setLabel('拒否')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌'),
  );

await interaction.reply({
  content: 'リクエストを確認してください：',
  components: [row],
});

// ボタンのインタラクションを処理
const collector = interaction.channel
  .createMessageComponentCollector({ time: 60_000 });

collector.on('collect', async i => {
  if (i.customId === 'approve') {
    await i.update({ content: '承認されました！ ✅', components: [] });
  } else {
    await i.update({ content: '拒否されました。 ❌', components: [] });
  }
});`,
  },
]

function highlightCode(code: string): string {
  return code
    // Strings (single and double quotes, template literals)
    .replace(/(&#39;[^&#39;]*&#39;|&quot;[^&quot;]*&quot;|`[^`]*`|'[^']*'|"[^"]*")/g, '<span class="text-[#a5d6a7]">$1</span>')
    // Keywords
    .replace(/\b(const|let|var|function|return|if|else|new|require|module|exports|async|await)\b/g, '<span class="text-[#c792ea]">$1</span>')
    // Comments
    .replace(/(\/\/.*$)/gm, '<span class="text-[#55556a]">$1</span>')
    // Numbers
    .replace(/\b(\d+(?:_\d+)*)\b/g, '<span class="text-[#f78c6c]">$1</span>')
    // Method calls
    .replace(/\.(\w+)\(/g, '.<span class="text-[#82aaff]">$1</span>(')
    // Properties after dot
    .replace(/\.(\w+)(?=[,;\s\)])/g, '.<span class="text-[#89ddff]">$1</span>')
  }

export default function CodeShowcase() {
  const [activeTab, setActiveTab] = useState('basic')

  const activeExample = codeExamples.find(e => e.id === activeTab)!

  return (
    <section id="guide" className="relative py-24 md:py-32 overflow-x-clip">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 mb-4">
              <span className="text-xs font-medium text-[#5865F2]">コード例</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              シンプルで直感的な API
            </h2>
            <p className="text-[#8888a0] text-base mb-8 leading-relaxed">
              discord.jsは、洗練されたAPIデザインにより、
              複雑なBotの機能を簡潔なコードで実現できます。
              初心者から上級者まで、すべての開発者に最適です。
            </p>

            {/* Tabs */}
            <div className="flex flex-col gap-2">
              {codeExamples.map(example => (
                <button
                  key={example.id}
                  onClick={() => setActiveTab(example.id)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    activeTab === example.id
                      ? 'bg-[#5865F2]/10 border border-[#5865F2]/30'
                      : 'bg-transparent border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      activeTab === example.id ? 'bg-[#5865F2]' : 'bg-[#2a2a3a]'
                    }`}
                  />
                  <div>
                    <div className={`text-sm font-medium transition-colors ${
                      activeTab === example.id ? 'text-white' : 'text-[#8888a0]'
                    }`}>
                      {example.title}
                    </div>
                    <div className="text-xs text-[#55556a]">
                      {example.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Code block */}
          <div className="relative min-w-0">
            {/* Glow */}
            <div className="absolute -inset-4 bg-[#5865F2]/5 rounded-2xl blur-xl pointer-events-none" />

            <div className="relative rounded-xl border border-[#2a2a3a] overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a3a] bg-[#0d0d15]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-xs text-[#55556a] font-mono ml-2">
                    {activeExample.id === 'basic' ? 'index.js' : activeExample.id === 'slash' ? 'commands/server.js' : 'commands/button.js'}
                  </span>
                </div>
                <button
                  className="p-1 text-[#55556a] hover:text-[#5865F2] transition-colors cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(activeExample.code)}
                  title="コードをコピー"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>

              {/* Code content */}
              <div className="p-5 bg-[#0a0a12] overflow-x-auto">
                <pre className="font-mono text-[13px] leading-[1.7]">
                  <code
                    dangerouslySetInnerHTML={{ __html: highlightCode(activeExample.code) }}
                  />
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
