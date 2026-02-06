'use client'

import styles from './PhilosophySection.module.css'

export default function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section}>
      <div className={styles.sectionContent}>
        <div className={styles.philosophyContent}>
          <h2 className={styles.sectionTitle}>哲学</h2>
          <p className={styles.sectionText}>
            技術は表現の道具であり、感性は創造の源泉。
            二つが出会うところに、新しい可能性が生まれます。
          </p>
          <div className={styles.philosophyQuote}>
            安定した幸せとは、<br />
            変化を恐れず、<br />
            今この瞬間を大切にすること
          </div>
          <p className={styles.sectionText}>
            毎日の小さな発見と、穏やかな成長の中に、
            本当の豊かさがあると信じています。
          </p>
        </div>
      </div>
    </section>
  )
}
