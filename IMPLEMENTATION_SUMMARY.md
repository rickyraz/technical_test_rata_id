# Healthcare Scheduling System - Implementation Summary

## ✅ Semua Fitur Telah Diimplementasikan

### 1️⃣ Daftar Pasien (/patients)
**File**: `src/routes/patients/index.tsx`

Implementasi:
- ✅ **Table** menggunakan `@tanstack/react-table` (desain terinspirasi coss.com/ui)
- ✅ **Search** dengan debounced input (500ms delay)
- ✅ **Pagination** dengan limit 10 items per page
- ✅ **GraphQL Query**: `AllPatientsQuery` dengan variables (search, limit, offset)
- ✅ **Navigation**: Click row untuk ke detail page
- ✅ **Role-based**: Tombol "Tambah Pasien" hanya muncul jika `canEdit` (ADMIN/DOCTOR)
- ✅ **Animation**: Motion One untuk page entry

### 2️⃣ Detail Pasien (/patients/:id)
**File**: `src/routes/patients/$patientId.tsx`

Implementasi:
- ✅ Informasi lengkap pasien (nama, kontak, alamat, riwayat medis)
- ✅ **Riwayat kunjungan** (appointments 3 bulan ke depan)
- ✅ **Recurring appointment rules** ditampilkan
- ✅ Next appointment card (di sidebar)
- ✅ Informasi billing & asuransi
- ✅ **Role-based**: Edit button (ADMIN/DOCTOR), Delete button (ADMIN only)
- ✅ **GraphQL Queries**: `PatientDetailQuery` + `PatientAppointmentsQuery`
- ✅ **Animation**: Slide in from right dengan Motion One

### 3️⃣ Form Pasien (Create & Edit)
**Files**:
- `src/routes/patients/new.tsx` (Create)
- `src/routes/patients/$patientId.edit.tsx` (Edit)

Implementasi:
- ✅ **Validasi dasar**: Nama required, format email, format telepon
- ✅ **GraphQL Mutations**: `CreatePatientMutation`, `UpdatePatientMutation`
- ✅ Error handling dengan display error message
- ✅ Loading state dengan spinner
- ✅ Auto-redirect setelah sukses
- ✅ **Animation**: Fade in dengan Motion One

### 4️⃣ Calendar View (/calendar)
**File**: `src/routes/calendar/index.tsx`

Implementasi:
- ✅ **3 View Modes**: Daily, Weekly, Monthly (switchable)
- ✅ **Navigation**: Previous/Next buttons + Today button
- ✅ **Date range calculation** berdasarkan view mode
- ✅ **GraphQL Queries**: Fetch appointments untuk semua pasien
- ✅ **Grouping**: Appointments digroup berdasarkan tanggal
- ✅ **Display**: Nama pasien, waktu, dan note
- ✅ **Animation**: Fade in saat switch view mode

### 5️⃣ Workflow Builder (/workflows)
**File**: `src/routes/workflows/index.tsx`

Implementasi:
- ✅ **Drag & Drop** menggunakan `@dnd-kit/core` + `@dnd-kit/sortable`
- ✅ Drag handle (GripVertical icon)
- ✅ **Add/Edit/Delete** workflow steps
- ✅ **Reorder** steps dengan drag & drop (auto-update order numbers)
- ✅ **Save workflow** via `CreateWorkflowMutation`
- ✅ **List workflows** yang sudah tersimpan
- ✅ **Role-based**: Editing hanya untuk ADMIN/DOCTOR
- ✅ **Sensors**: PointerSensor + KeyboardSensor (accessibility)

## 🎨 Komponen UI Reusable

### Components (`src/components/ui/`)

1. **Table.tsx** (Based on coss.com/ui)
   - Menggunakan `@tanstack/react-table`
   - Support sorting
   - Support onRowClick
   - Responsive design

2. **Button.tsx**
   - 4 variants: primary, secondary, danger, ghost
   - 3 sizes: sm, md, lg
   - Loading state dengan spinner
   - Motion One animation on mount

3. **Input.tsx**
   - Label + error handling
   - Helper text support
   - Focus states dengan Tailwind

4. **Card.tsx**
   - Container dengan shadow
   - Optional animation (Motion One)
   - Customizable className

5. **Pagination.tsx**
   - Previous/Next buttons
   - Page numbers dengan highlight
   - Items count display

## 🔧 Utilities & Hooks

### Hooks (`src/hooks/`)

1. **useDebounce.ts**
   - Generic debounce hook
   - Default delay 500ms
   - Digunakan untuk search input

### Contexts (`src/contexts/`)

1. **AuthContext.tsx**
   - User state management
   - Role-based permissions (`canEdit`, `canDelete`)
   - Mock user (bisa diubah role untuk testing)
   - Provider wraps entire app

## 📊 GraphQL Integration

### Queries (`src/queries/`)

1. **patients.ts**
   - `AllPatientsQuery`: List dengan search, limit, offset
   - `PatientDetailQuery`: Detail single patient
   - `PatientAppointmentsQuery`: Appointments by date range
   - `CreatePatientMutation`, `UpdatePatientMutation`, `DeletePatientMutation`

2. **appointments.ts**
   - `CreateOneTimeAppointmentMutation`
   - `CreateRecurrenceRuleMutation`
   - `UpdateRecurrenceRuleMutation`
   - `CreateExceptionAppointmentMutation`
   - `DeleteAppointmentMutation`, `DeleteRecurrenceRuleMutation`

3. **workflows.ts**
   - `AllWorkflowsQuery`
   - `WorkflowDetailQuery`
   - `CreateWorkflowMutation`
   - `UpdateWorkflowMutation`
   - `DeleteWorkflowMutation`

### Type Safety dengan gql.tada
Semua queries/mutations menggunakan `gql.tada` untuk:
- Auto-completion di IDE
- Type inference dari schema
- Runtime validation
- No code generation step required

## 🎭 Animasi dengan Motion One

Diimplementasikan di:
- ✅ Page transitions (opacity + transform)
- ✅ Button animations (scale on mount)
- ✅ Card animations (fade + slide)
- ✅ Table popup animations (bila diperlukan)

Contoh implementasi:
```tsx
import { animate } from "motion";

useEffect(() => {
  if (containerRef.current) {
    animate(
      containerRef.current,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.4, easing: "ease-out" }
    );
  }
}, []);
```

## 🗂️ Drag & Drop dengan @dnd-kit

### Workflow Builder Implementation

```tsx
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
```

**Features**:
- Drag handle dengan `{...attributes} {...listeners}`
- Transform dengan `CSS.Transform.toString(transform)`
- Reorder dengan `arrayMove()`
- Sensors untuk mouse, keyboard, dan touch
- Collision detection dengan `closestCenter`

## 🔐 Role-Based Access Control

### Implementation di AuthContext

```tsx
const canEdit = mockUser?.role === "ADMIN" || mockUser?.role === "DOCTOR";
const canDelete = mockUser?.role === "ADMIN";
```

### Contoh Penggunaan

```tsx
const { canEdit, canDelete } = useAuth();

{canEdit && (
  <Button onClick={handleEdit}>Edit</Button>
)}

{canDelete && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

## 📝 Komentar di Setiap File

Setiap file implementasi memiliki:

1. **Header Comment** dengan:
   - Nama halaman/komponen
   - Fitur-fitur yang diimplementasikan
   - Teknologi yang digunakan

2. **Inline Comments** untuk:
   - Logika kompleks
   - GraphQL queries/mutations
   - State management
   - Animation implementations

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

## 🎯 Kompleksitas yang Diimplementasikan

Dari requirements, diimplementasikan **semua** kompleksitas:

### 1. ✅ Pagination pada list pasien
- Offset-based pagination
- Configurable items per page
- UI dengan Previous/Next + page numbers

### 2. ✅ Debounced search
- Custom hook `useDebounce`
- 500ms delay
- Auto-reset page saat search

### 3. ✅ Role-based UI sederhana
- Context-based implementation
- 3 roles: ADMIN, DOCTOR, STAFF
- Conditional rendering untuk buttons
- STAFF tidak bisa edit/delete

## 🚀 Cara Menjalankan

```bash
# Install dependencies
bun install

# Generate GraphQL types
bun run gen-gql

# Run development server
bun run dev

# Build for production
bun run build

# Run tests (jika diperlukan)
bun run test
```

## 📦 Dependencies yang Digunakan

Sesuai requirements:

| Requirement | Package | ✅ |
|-------------|---------|---|
| React | `react@19.2.0` | ✅ |
| TanStack Start | `@tanstack/react-start@1.132.0` | ✅ |
| Tailwind CSS | `tailwindcss@4.0.6` | ✅ |
| GraphQL | `gql.tada@1.9.0` + `urql@5.0.1` | ✅ |
| Motion One | `motion@12.23.26` | ✅ |
| DnD Kit | `@dnd-kit/core@6.3.1` | ✅ |
| Table | `@tanstack/react-table@8.21.3` | ✅ |
| MSW | `msw@2.12.4` | ✅ |
| Bun | Runtime | ✅ |

## 🎨 Styling dengan Tailwind CSS v4

Semua styling menggunakan Tailwind utility classes:
- Responsive design (mobile-first)
- Custom colors dari Tailwind palette
- Hover states & transitions
- Focus states untuk accessibility
- Grid & Flexbox layouts

## 📸 Screenshots (Reference)

### Home Page
- Hero section dengan welcome message
- 3 feature cards (Pasien, Kalender, Workflow)
- Tech stack info
- Responsive grid layout

### Patient List
- Search bar di atas table
- Table dengan columns: Nama, Telepon, Email, Kunjungan Terakhir, Sisa Tagihan
- Pagination di bawah table
- "Tambah Pasien" button (role-based)

### Patient Detail
- Left column: Basic info, Medical history, Appointments
- Right sidebar: Next appointment, Billing info, Metadata
- Edit & Delete buttons (role-based)

### Calendar View
- View mode selector (Daily/Weekly/Monthly)
- Date navigation
- Appointments grouped by date
- Patient name + time display

### Workflow Builder
- Left: Form untuk create workflow baru
- Right: List workflows yang sudah tersimpan
- Drag handles pada steps
- Add/Remove step buttons

## ✨ Kesimpulan

✅ **Semua requirements telah diimplementasikan**:
1. Daftar Pasien ✅
2. Detail Pasien ✅
3. Form Pasien (Create & Edit) ✅
4. Calendar View (Appointment) ✅
5. Workflow Builder Sederhana ✅

✅ **Teknologi sesuai spec**:
- React + TanStack Start ✅
- Tailwind CSS v4 ✅
- GraphQL (gql.tada + URQL) ✅
- Motion One ✅
- @dnd-kit/core ✅
- Table inspired by coss.com/ui ✅
- Bun runtime ✅

✅ **Kompleksitas tambahan**:
- Pagination ✅
- Debounced search ✅
- Role-based UI ✅

✅ **Best practices**:
- Type safety dengan TypeScript + gql.tada ✅
- Reusable components ✅
- Clean code structure ✅
- Comprehensive comments ✅
- Error handling ✅
- Loading states ✅

**Output**: GitHub repo dengan README lengkap cara menjalankan ✅
