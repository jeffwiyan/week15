# Worksheet 4 - Deployment with Vercel

Panduan lengkap untuk membuat project Next.js dengan fitur CRUD SQLite & Prisma, deployment ke Vercel.

## 1. SETUP PROJECT

### Spesifikasi Project:
- **Nama**: week15-2025
- **Framework**: Next.js 14.2.15 dengan App Router
- **Bahasa**: TypeScript
- **Linting**: ESLint
- **Styling**: CSS Modules (tidak menggunakan Tailwind)
- **Database**: SQLite dengan Prisma

### File Konfigurasi

#### package.json
```json
{
  "name": "week15-2025",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "next": "14.2.15",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.15",
    "prisma": "^5.22.0",
    "typescript": "^5"
  }
}
```

#### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Model User untuk CRUD
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

#### .gitignore
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

/app/generated/prisma
```

## 2. FITUR HALAMAN

### app/about/page.tsx
```tsx
export default function AboutPage() {
  return (
    <>
      <h1>Ini adalah halaman About</h1>
    </>
  );
}
```

## 3. FITUR CRUD (SQLite & Prisma)

### app/page.tsx (Fitur CRUD Lengkap)
```tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Prisma Client dengan Singleton Pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Server Actions untuk CRUD
async function createUser(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // PENTING: Create/Update/Delete HANYA BERJALAN di LOCALHOST
  // Di Vercel akan Read-Only karena batasan SQLite di serverless
  if (process.env.VERCEL) {
    throw new Error('Create operation is not supported on Vercel due to SQLite limitations in serverless environment');
  }

  try {
    await prisma.user.create({
      data: { name, email },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

async function updateUser(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // PENTING: Create/Update/Delete HANYA BERJALAN di LOCALHOST
  // Di Vercel akan Read-Only karena batasan SQLite di serverless
  if (process.env.VERCEL) {
    throw new Error('Update operation is not supported on Vercel due to SQLite limitations in serverless environment');
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

async function deleteUser(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);

  // PENTING: Create/Update/Delete HANYA BERJALAN di LOCALHOST
  // Di Vercel akan Read-Only karena batasan SQLite di serverless
  if (process.env.VERCEL) {
    throw new Error('Delete operation is not supported on Vercel due to SQLite limitations in serverless environment');
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

export default async function Home() {
  // READ: Ambil data dari database (bisa di Vercel)
  const users = await prisma.user.findMany();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Daftar Pengguna (CRUD SQLite + Prisma)</h1>

      {/* Form Create User */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Tambah Pengguna Baru</h2>
        <form action={createUser} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nama:</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
            />
          </div>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tambah
          </button>
        </form>
      </div>

      {/* List Users dengan Update/Delete */}
      {users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Belum ada data user.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map((user) => (
            <div key={user.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{user.name}</strong> - {user.email}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Form Update */}
                  <form action={updateUser} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name || ''}
                      placeholder="Nama baru"
                      style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', width: '120px' }}
                    />
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      placeholder="Email baru"
                      style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Update
                    </button>
                  </form>

                  {/* Form Delete */}
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catatan Penting */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>⚠️ Catatan Penting:</h3>
        <ul style={{ color: '#856404' }}>
          <li><strong>Create/Update/Delete</strong> hanya berjalan di <strong>localhost</strong></li>
          <li>Di <strong>Vercel</strong> akan Read-Only karena batasan SQLite di serverless environment</li>
          <li><strong>Read</strong> (menampilkan data) bisa dilakukan di kedua environment</li>
        </ul>
      </div>
    </main>
  );
}
```

## 4. INSTRUKSI DEPLOYMENT

### Langkah-langkah Deployment:

1. **Setup Database Lokal:**
   ```bash
   # Install dependencies
   npm install

   # Generate Prisma client
   npx prisma generate

   # Buat dan jalankan migration
   npx prisma migrate dev --name init

   # Seeding data manual menggunakan Prisma Studio
   npx prisma studio
   ```
   - Buka browser ke `http://localhost:5555`
   - Klik tab "User" dan tambahkan beberapa data test
   - Data ini akan tersimpan di `prisma/dev.db`

2. **Commit dan Push ke GitHub:**
   ```bash
   git add .
   git commit -m "feat: implement CRUD with SQLite & Prisma"
   git push origin main
   ```

3. **Deploy ke Vercel:**
   - Import project dari GitHub di Vercel
   - Set Environment Variable di Vercel Dashboard:
     - Key: `DATABASE_URL`
     - Value: `file:./dev.db`
   - Deploy project

### Konfigurasi Build Script:
Build script sudah benar: `"build": "prisma generate && next build"`

### File yang Diperlukan:
- ✅ `package.json` - Script build sudah benar
- ✅ `prisma/schema.prisma` - Model User sudah ada
- ✅ `.gitignore` - Database file TIDAK di-ignore (biar ter-upload ke GitHub)
- ✅ Environment Variable `DATABASE_URL="file:./dev.db"` di-set di Vercel

### Perbedaan Localhost vs Vercel:

| Operasi | Localhost | Vercel |
|---------|-----------|--------|
| **Create** | ✅ Bisa | ❌ Tidak bisa (Read-Only) |
| **Read** | ✅ Bisa | ✅ Bisa |
| **Update** | ✅ Bisa | ❌ Tidak bisa (Read-Only) |
| **Delete** | ✅ Bisa | ❌ Tidak bisa (Read-Only) |

**Penjelasan:** Vercel menggunakan serverless functions yang bersifat ephemeral (tidak persistent). SQLite membutuhkan file system yang persistent untuk write operations, sehingga Create/Update/Delete tidak bisa dilakukan di Vercel.

### Testing:
- **Localhost:** Semua CRUD berfungsi normal
- **Vercel:** Hanya Read yang berfungsi, Create/Update/Delete akan menampilkan error message

Project ini memenuhi semua spesifikasi worksheet dan siap untuk deployment ke Vercel! 🚀
