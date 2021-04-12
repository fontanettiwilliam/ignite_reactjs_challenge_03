import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.headerContainer}`}>
      <div className={`${commonStyles.content} ${styles.headerContent}`}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
