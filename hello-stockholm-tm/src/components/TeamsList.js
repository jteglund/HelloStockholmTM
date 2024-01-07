import styles from '../app/page.module.css'

export default function TeamsList({team, onClick}) {
    return (
        <div className={styles.teamListContainer}>
            <h3>
                {team.Name}
            </h3>
            <h3>
                {team.WinsTotal}
            </h3>
            <h3>
                -
            </h3>
            <h3>
                {team.LossesTotal}
            </h3>
        </div>
    )
  }