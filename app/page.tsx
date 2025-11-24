import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tambahkan revalidate agar data tidak di-cache selamanya (opsional tapi bagus untuk dev)
export const revalidate = 0;

export default async function Home() {
  // Ambil data dari database
  const users = await prisma.user.findMany();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Daftar Pengguna (Prisma + SQLite)</h1>
      
      {users.length === 0 ? (
        <p>Belum ada data user.</p>
      ) : (
        <ul style={{ marginTop: '1rem' }}>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}