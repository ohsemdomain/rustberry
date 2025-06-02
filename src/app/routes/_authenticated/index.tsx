import { AdminDashboard } from '@/app/features/dashboard/AdminDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminDashboard />
}
