import DemoPage from '@/features/DemoHono'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/demo-hono')({
	component: DemoPage,
})
