import styles from '../app/page.module.css'
import Link from 'next/link';

export default function TeamsList({team}) {
    const url = '/team/' + team.id;

    return (
        <Link href={url}>
            <div className={styles.teamListItem}>
                <h4 className={styles.teamText}>
                    {team.Name}
                </h4>
            </div>
        </Link>
    )
  }