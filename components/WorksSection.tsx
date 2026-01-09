'use client'

import styles from './WorksSection.module.css'

const works = [
  {
    id: 1,
    title: 'RHYTHMIA',
    description: '音楽とパズルが融合したリズムゲーム。ビートに合わせて世界を彩る。',
    gradient: 'linear-gradient(135deg, #FF6B9D, #C44569)'
  },
  {
    id: 2,
    title: 'Life Journey',
    description: '人生の7つの章を詩的に表現したインタラクティブな物語。',
    gradient: 'linear-gradient(135deg, #4ECDC4, #1A535C)'
  },
  {
    id: 3,
    title: '次の作品',
    description: '新しい物語が始まる場所。',
    gradient: 'linear-gradient(135deg, #A29BFE, #6C5CE7)'
  }
]

export default function WorksSection() {
  return (
    <section id="works" className={styles.section}>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionTitle}>作品</h2>
        <div className={styles.worksContainer}>
          {works.map((work) => (
            <div key={work.id} className={`${styles.workCard} work-card`}>
              <div 
                className={styles.workPreview} 
                style={{ background: work.gradient }}
              />
              <div className={styles.workInfo}>
                <h3 className={styles.workTitle}>{work.title}</h3>
                <p className={styles.workDescription}>{work.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
