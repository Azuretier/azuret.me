'use client'

import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.mainTitle}>安定した幸せ</h1>
        <p className={styles.subtitle}>A Journey of Stable Happiness</p>
        <p className={styles.sectionText}>
          <span className="interactive-element" data-hover="創造">創造</span>と
          <span className="interactive-element" data-hover="調和">調和</span>の間で、
          <span className="interactive-element" data-hover="自分">自分</span>らしさを表現する
        </p>
      </div>
    </section>
  )
}
