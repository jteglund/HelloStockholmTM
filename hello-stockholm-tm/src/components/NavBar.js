'use client'

import style from '../app/page.module.css'
import Link from 'next/link'
import { usePathname } from "next/navigation";

export default function NavBar() {
    const pathname = usePathname();

    return (
      <div className={style.navbar}>
        <Link className={pathname == "/" ? style.navbarTextActive : style.navbarText} href="/">LAG</Link>
        <Link className={pathname == "/schedule" ? style.navbarTextActive : style.navbarText} href="/schedule">SCHEMA</Link>
        <Link className={pathname == "/groups" ? style.navbarTextActive : style.navbarText} href="/groups">GRUPPER</Link>
      </div>
    )
  }