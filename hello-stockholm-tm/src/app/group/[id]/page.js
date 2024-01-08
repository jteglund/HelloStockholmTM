import styles from '../../page.module.css'

export default function Home({params}) {
    return (
        <main className={styles.main}>
            <div className={styles.center}>
                {params.id}
            </div>
        </main>
      )
}