// /app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import prisma from '../../lib/prisma';

export default function Dashboard() {
  const [eleves, setEleves] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await prisma.eleve.findMany({
        include: {
          notes: true,
        },
      });
      setEleves(response);
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Tableau de bord des élèves</h1>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Note Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {eleves.map((eleve) => {
            const averageNote =
              eleve.notes.length > 0
                ? eleve.notes.reduce((acc, note) => acc + note.note, 0) /
                  eleve.notes.length
                : 0;

            return (
              <tr key={eleve.id}>
                <td>{eleve.name}</td>
                <td>{eleve.email}</td>
                <td>{averageNote.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
