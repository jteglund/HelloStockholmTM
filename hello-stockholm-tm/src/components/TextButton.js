import styles from '../app/page.module.css'

export default function TextButton({prompt, handlePress, active}) {
    return (
      <button className={active ? styles.textButtonActive : styles.textButton} onClick={handlePress}>
            {prompt}
      </button>
    )
  }