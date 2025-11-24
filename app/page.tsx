import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Daftar Pengguna (SQLite + Prisma)</h1>
      <p>Data ini diambil dari database SQLite (Read-Only di Vercel).</p>
      
      <div style={{ marginTop: '20px' }}>
        {users.length === 0 ? (
          <p>Belum ada data.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
                <strong>{user.name}</strong> <br />
                <small>{user.email}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}