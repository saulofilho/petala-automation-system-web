'use client';

import { useRouter } from 'next/navigation';
import styles from '../Global.module.css';

export default function UsersTable({ users }) {
  const router = useRouter();

  const handleRowClick = id => {
    router.push(`/dashboard/users/${id}`);
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Nome</th>
          <th>CPF</th>
          <th>Telefone</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map(u => (
            <tr
              key={u.id}
              className={styles.row}
              onClick={() => handleRowClick(u.id)}
            >
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.cpf}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className={styles.noData}>
              Nenhum usuário encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
