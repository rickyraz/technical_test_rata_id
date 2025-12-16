# Healthcare Scheduling System

Sistem manajemen klinik modern yang dibangun dengan teknologi web terkini untuk mengelola pasien, jadwal appointment, dan workflow klinik.

## 🚀 Fitur Utama

### 1. **Daftar Pasien**
- ✅ List pasien dengan tabel interaktif (menggunakan @tanstack/react-table berdasarkan coss.com/ui)
- ✅ Pencarian real-time dengan debounce (500ms)
- ✅ Pagination untuk performa optimal
- ✅ Click row untuk navigasi ke detail pasien
- ✅ Tombol tambah pasien (role-based: hanya ADMIN dan DOCTOR)

### 2. **Detail Pasien**
- ✅ Informasi lengkap pasien (nama, kontak, alamat, riwayat medis)
- ✅ Riwayat kunjungan/appointment (3 bulan ke depan)
- ✅ Recurring appointment rules (jadwal berulang)
- ✅ Next appointment indicator
- ✅ Informasi billing dan asuransi
- ✅ Edit & Delete buttons (role-based access control)

### 3. **Form Pasien (Create & Edit)**
- ✅ Validasi input dasar (nama wajib, format email, format telepon)
- ✅ Submit via GraphQL mutation (gql.tada + URQL)
- ✅ Auto-redirect ke detail page setelah berhasil
- ✅ Error handling yang informatif

### 4. **Calendar View (Appointment)**
- ✅ Tampilan kalender sederhana untuk appointment
- ✅ 3 mode view: Daily, Weekly, Monthly (bisa diswitch)
- ✅ Navigasi tanggal dengan tombol Previous/Next dan Today
- ✅ Grouping appointment berdasarkan tanggal
- ✅ Data diambil via GraphQL query untuk semua pasien

### 5. **Workflow Builder**
- ✅ Buat workflow klinik (contoh: "Registrasi → Pemeriksaan → Obat → Pembayaran")
- ✅ **Drag-and-drop steps** menggunakan `@dnd-kit/core` dan `@dnd-kit/sortable`
- ✅ Add, edit, delete, dan reorder workflow steps
- ✅ Simpan workflow via GraphQL mutation
- ✅ List workflow yang sudah tersimpan
- ✅ Role-based editing (hanya ADMIN/DOCTOR bisa edit)

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19 |
| **Router** | TanStack Start (v1.132.0) |
| **State Management** | URQL + gql.tada (type-safe GraphQL) |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Motion One (v12.23.26) |
| **Drag & Drop** | @dnd-kit/core (v6.3.1) |
| **Table** | @tanstack/react-table (v8.21.3) |
| **API Mocking** | MSW v2 (Mock Service Worker) |
| **Runtime** | Bun |
| **Icons** | Lucide React |
| **Testing** | Vitest |
| **Linting** | Biome |

## 📂 Struktur Kode

```
src/
├── components/
│   └── ui/                    # Reusable UI components
│       ├── Table.tsx          # Table component (coss.com/ui inspired)
│       ├── Button.tsx         # Button dengan Motion One animation
│       ├── Input.tsx          # Input field dengan error handling
│       ├── Card.tsx           # Card container dengan animations
│       └── Pagination.tsx     # Pagination component
├── contexts/
│   └── AuthContext.tsx        # Role-based auth context (ADMIN/DOCTOR/STAFF)
├── hooks/
│   └── useDebounce.ts         # Debounce hook untuk search
├── queries/
│   ├── patients.ts            # GraphQL queries/mutations untuk patients
│   ├── appointments.ts        # GraphQL queries/mutations untuk appointments
│   └── workflows.ts           # GraphQL queries/mutations untuk workflows
├── routes/
│   ├── __root.tsx             # Root layout dengan Navigation & AuthProvider
│   ├── index.tsx              # Home page
│   ├── patients/
│   │   ├── index.tsx          # Patient list page
│   │   ├── new.tsx            # Create patient form
│   │   ├── $patientId.tsx     # Patient detail page
│   │   └── $patientId.edit.tsx # Edit patient form
│   ├── calendar/
│   │   └── index.tsx          # Calendar view
│   └── workflows/
│       └── index.tsx          # Workflow builder
├── mocks/
│   ├── browser.ts             # MSW browser setup
│   └── handlers.ts            # GraphQL mock handlers
├── graphql.ts                 # gql.tada configuration
├── router.tsx                 # Router & URQL client setup
├── client.tsx                 # Client entry point
└── main.tsx                   # Server entry point
```

## 📋 Implementasi Komentar

Setiap file implementasi telah diberi komentar JSDoc yang jelas menjelaskan:
- **Purpose**: Apa fungsi dari komponen/halaman tersebut
- **Features**: Fitur-fitur yang diimplementasikan
- **Tech**: Teknologi yang digunakan (GraphQL, Motion One, @dnd-kit, dll)

Contoh:
```tsx
/**
 * Patient List Page
 * Features:
 * - List all patients in a table (using coss.com/ui design)
 * - Search functionality with debounced input
 * - Pagination support
 * - Click row to navigate to patient detail
 * - Add new patient button (role-based visibility)
 */
```

## 🚦 Getting Started

### Prerequisites
- Bun runtime (https://bun.sh)
- Node.js 18+ (optional, Bun is recommended)

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Run development server
bun run dev

# Server akan berjalan di http://localhost:3000
```

### Build for Production

```bash
# Build aplikasi
bun run build

# Preview production build
bun run preview
```

### Testing

```bash
# Run tests
bun run test
```

### Linting & Formatting

```bash
# Lint code
bun run lint

# Format code
bun run format

# Check code quality
bun run check
```

### Generate GraphQL Types

```bash
# Generate TypeScript types from GraphQL schema
bun run gen-gql
```

## 🎨 Fitur Tambahan yang Diimplementasikan

### 1. **Pagination**
Implemented di patient list page dengan:
- Limit items per page (10 items)
- Offset-based pagination
- UI pagination component dengan Previous/Next buttons
- Page numbers dengan highlight untuk current page

### 2. **Debounced Search**
Custom hook `useDebounce` dengan delay 500ms untuk:
- Mengurangi jumlah API calls saat user mengetik
- Smooth UX tanpa lag

### 3. **Role-Based UI**
Context `AuthContext` yang menyediakan:
- `canEdit`: ADMIN dan DOCTOR bisa edit
- `canDelete`: Hanya ADMIN bisa delete
- Button visibility conditional berdasarkan role
- Mock user dengan role ADMIN (bisa diubah ke STAFF untuk testing)

### 4. **Motion One Animations**
Digunakan di seluruh aplikasi untuk:
- Page transitions (opacity + transform)
- Button hover effects
- Card animations
- Smooth page entry animations

### 5. **GraphQL dengan gql.tada + URQL**
- Type-safe queries dan mutations
- Auto-generated types dari schema
- URQL untuk fetching dan caching
- MSW untuk mocking GraphQL endpoints di development

### 6. **Drag & Drop Workflow Builder**
Menggunakan `@dnd-kit/core` dan `@dnd-kit/sortable`:
- Drag handle dengan icon GripVertical
- Smooth reordering animations
- Update order numbers otomatis setelah drag
- Keyboard navigation support
- Touch device support

## 🎯 GraphQL Schema Highlights

Schema lengkap ada di `schema.graphql`. Highlights:

### Types
- `Patient`: Data pasien lengkap
- `Appointment`: One-time atau recurring appointments
- `RecurrenceRule`: Aturan untuk recurring appointments (support RRULE format)
- `Workflow`: Clinical workflow dengan steps
- `User`: User dengan role (ADMIN/DOCTOR/STAFF)

### Queries
- `allPatients`: List semua pasien (support search, limit, offset)
- `patient(id)`: Detail single patient
- `appointmentsByPatient`: Appointments dalam range tertentu
- `allWorkflows`: List workflows
- `currentUser`: User yang sedang login

### Mutations
- Patient: `createPatient`, `updatePatient`, `deletePatient`
- Appointments: `createOneTimeAppointment`, `createRecurrenceRule`, `createExceptionForRule`
- Workflows: `createWorkflow`, `updateWorkflow`, `deleteWorkflow`

## 🔐 Role-Based Access Control

| Feature | ADMIN | DOCTOR | STAFF |
|---------|-------|--------|-------|
| View Patients | ✅ | ✅ | ✅ |
| Add Patient | ✅ | ✅ | ❌ |
| Edit Patient | ✅ | ✅ | ❌ |
| Delete Patient | ✅ | ❌ | ❌ |
| View Calendar | ✅ | ✅ | ✅ |
| Create Workflow | ✅ | ✅ | ❌ |
| Edit Workflow | ✅ | ✅ | ❌ |

Untuk testing role STAFF (read-only), ubah di `src/contexts/AuthContext.tsx`:

```tsx
const [mockUser] = useState<User>({
  id: "1",
  name: "Staff User",
  role: "STAFF", // Change to STAFF
});
```

## 📱 Responsive Design

Seluruh UI dibangun dengan Tailwind CSS dan responsive:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid layouts yang adaptif
- Navigation yang mobile-friendly

## 🌟 Best Practices yang Diterapkan

1. **Type Safety**: Full TypeScript + gql.tada untuk GraphQL
2. **Component Composition**: Reusable UI components
3. **Separation of Concerns**: Hooks, contexts, queries terpisah
4. **Error Handling**: Proper error states di semua queries/mutations
5. **Loading States**: Spinner dan loading indicators
6. **Accessibility**: Semantic HTML, keyboard navigation
7. **Performance**: Debouncing, pagination, code splitting
8. **Code Quality**: Biome linting, consistent formatting

## 📝 Demo Data

MSW handlers menyediakan demo data untuk:
- 4 pasien (Jessica Novia, Melrose Burhan, Novira Veronica, Vania Liman)
- Recurring appointments dengan berbagai frekuensi (DAILY, WEEKLY, MONTHLY, YEARLY)
- Workflow examples

## 🎓 Learning Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)
- [URQL Docs](https://commerce.nearform.com/open-source/urql/)
- [gql.tada Docs](https://gql-tada.0no.co/)
- [Motion One Docs](https://motion.dev/)
- [@dnd-kit Docs](https://docs.dndkit.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## 🤝 Credits

Built with ❤️ for RATA Skill Test - Frontend Engineer (Healthcare Scheduling System)

Tech Stack Requirements Met:
- ✅ React + TanStack Start
- ✅ Tailwind CSS v4
- ✅ GraphQL (gql.tada + URQL)
- ✅ State Management (URQL + Context)
- ✅ Motion One animations
- ✅ @dnd-kit/core for drag & drop
- ✅ Table inspired by coss.com/ui
- ✅ Bun runtime
- ✅ All comments in Bahasa Indonesia (implementation explanation)
