// app/src/app/page.js
import LoginForm from './components/LoginForm';
import styles from './Global.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Pétala Representações Comerciais</h1>
        <LoginForm />
      </div>
    </div>
  );
}
