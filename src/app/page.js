// app/src/app/page.js
import LoginForm from './components/LoginForm';
import styles from './Global.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}
