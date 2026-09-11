import UserGuard from "@/components/user/UserGuard"

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <div className="min-h-screen bg-[#0b0b0c] text-white">
        <main className="mx-auto mt-16 w-full max-w-6xl px-6 py-10">{children}</main>
      </div>
    </UserGuard>
  )
}
