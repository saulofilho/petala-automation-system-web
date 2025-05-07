'use client';

import styles from './CompaniesTable.module.css';

export default function CompaniesTable({ companies }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CNPJ</th>
          <th>CEP</th>
          <th>Endereço</th>
          <th>Cidade</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {companies.length === 0 ? (
          <tr>
            <td colSpan="6" className={styles.noData}>
              Nenhuma empresa cadastrada.
            </td>
          </tr>
        ) : (
          companies.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.cnpj}</td>
              <td>{c.cep}</td>
              <td>{`${c.street}, ${c.number}`}</td>
              <td>{c.city}</td>
              <td>{c.state}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
