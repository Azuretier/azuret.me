import { createHeadingIdFactory } from '@/src/lib/pcTroubleBlog'
import styles from '@/src/app/pc-trouble/pc-trouble.module.css'

type Block =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string; code: string }
  | { type: 'callout'; variant: CalloutVariant; body: string[] }

type CalloutVariant = 'notice' | 'warning' | 'conclusion'

const calloutLabels: Record<CalloutVariant, string> = {
  notice: '注意',
  warning: '警告',
  conclusion: '結論',
}

const calloutClassNames: Record<CalloutVariant, string> = {
  notice: styles.calloutNotice,
  warning: styles.calloutWarning,
  conclusion: styles.calloutConclusion,
}

function isSpecialLine(line: string) {
  return (
    /^```/.test(line) ||
    /^:::(notice|warning|conclusion)/.test(line) ||
    /^#{2,4}\s+/.test(line) ||
    /^-\s+/.test(line)
  )
}

function parseMarkdown(content: string): Block[] {
  const lines = content.split(/\r?\n/)
  const blocks: Block[] = []
  const createHeadingId = createHeadingIdFactory()
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.replace(/^```/, '').trim()
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      blocks.push({ type: 'code', language, code: codeLines.join('\n') })
      index += 1
      continue
    }

    const calloutMatch = trimmed.match(/^:::(notice|warning|conclusion)/)
    if (calloutMatch) {
      const body: string[] = []
      index += 1

      while (index < lines.length && lines[index].trim() !== ':::') {
        body.push(lines[index])
        index += 1
      }

      blocks.push({ type: 'callout', variant: calloutMatch[1] as CalloutVariant, body })
      index += 1
      continue
    }

    const headingMatch = trimmed.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      const text = headingMatch[2].trim()
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text,
        id: createHeadingId(text),
      })
      index += 1
      continue
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = []

      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().replace(/^-\s+/, ''))
        index += 1
      }

      blocks.push({ type: 'list', items })
      continue
    }

    const paragraphLines = [trimmed]
    index += 1

    while (index < lines.length && lines[index].trim() && !isSpecialLine(lines[index].trim())) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return blocks
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      )
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const href = linkMatch[2]
      const isExternal = href.startsWith('http')

      return (
        <a
          key={index}
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
        >
          {linkMatch[1]}
        </a>
      )
    }

    return part
  })
}

function renderCalloutBody(lines: string[]) {
  const body = lines.join('\n').trim()
  if (!body) return null

  return parseMarkdown(body).map((block, index) => {
    if (block.type === 'list') {
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      )
    }

    if (block.type === 'code') {
      return (
        <pre key={index}>
          <code>{block.code}</code>
        </pre>
      )
    }

    if (block.type === 'heading') {
      return <p key={index}>{renderInline(block.text)}</p>
    }

    if (block.type === 'callout') {
      return (
        <p key={index}>
          {calloutLabels[block.variant]}: {renderCalloutBody(block.body)}
        </p>
      )
    }

    return <p key={index}>{renderInline(block.text)}</p>
  })
}

export default function MarkdownContent({ content }: { content: string }) {
  const blocks = parseMarkdown(content)

  return (
    <div className={styles.articleBody}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = `h${block.level}` as 'h2' | 'h3' | 'h4'
          return (
            <HeadingTag key={block.id} id={block.id}>
              {block.text}
            </HeadingTag>
          )
        }

        if (block.type === 'paragraph') {
          return <p key={index}>{renderInline(block.text)}</p>
        }

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }

        if (block.type === 'code') {
          return (
            <div key={index} className={styles.codeBlock}>
              {block.language && <span className={styles.codeLanguage}>{block.language}</span>}
              <pre>
                <code>{block.code}</code>
              </pre>
            </div>
          )
        }

        return (
          <aside key={index} className={`${styles.callout} ${calloutClassNames[block.variant]}`}>
            <div className={styles.calloutLabel}>{calloutLabels[block.variant]}</div>
            <div className={styles.calloutBody}>{renderCalloutBody(block.body)}</div>
          </aside>
        )
      })}
    </div>
  )
}
