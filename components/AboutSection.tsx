'use client'

import styles from './AboutSection.module.css'

export default function AboutSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.sectionContent}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <h2 className={styles.sectionTitle}>私について</h2>
            <p className={styles.sectionText}>
              音楽とコードの間で踊り、言葉と色彩の中で遊ぶ。
              日常の中に小さな魔法を見つけ、それを形にすることが好きです。
            </p>
            <p className={styles.sectionText}>
              RHYTHMIAのようなインタラクティブな作品から、
              人生の物語を紡ぐLife Journeyまで、
              技術と感性を融合させた表現を追求しています。
            </p>
          </div>
          <div className={styles.aboutVisual}></div>
        </div>
      </div>
    </section>
  )
}
