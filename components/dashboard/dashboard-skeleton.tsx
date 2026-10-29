import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} />
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-dvh">
      <div className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Bone className="h-9 w-36" />
          <Bone className="hidden h-9 w-72 md:block" />
          <Bone className="h-9 w-28" />
        </div>
      </div>
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Bone className="h-40 rounded-3xl" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Bone className="h-72" />
          <Bone className="h-72" />
          <Bone className="h-72" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Bone className="h-80" />
          <Bone className="h-80 lg:col-span-2" />
        </div>
        <Bone className="h-72" />
      </main>
    </div>
  )
}
