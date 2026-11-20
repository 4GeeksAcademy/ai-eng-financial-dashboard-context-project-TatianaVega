import { LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface DashboardHeaderProps {
  period?: string
}

export function DashboardHeader({ period = '2024 — Full Year' }: DashboardHeaderProps) {
  const location = useLocation()
  const isComparison = location.pathname === '/comparison'

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard size={18} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Financial Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Executive metrics dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {period}
        </span>
        <div className="flex gap-2">
          <Link
            to="/"
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !isComparison
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/comparison"
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isComparison
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            Comparación B2B vs B2C
          </Link>
        </div>
      </div>
    </header>
  )
}

