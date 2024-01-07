import styles from '../app/page.module.css'

export default function TeamsList({team, onClick}) {
    return (
        <div className={styles.teamListItem}>
            <h4>
                {team.Name}
            </h4>
        </div>
    )
  }