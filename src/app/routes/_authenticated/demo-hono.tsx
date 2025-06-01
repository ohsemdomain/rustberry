import { createFileRoute } from '@tanstack/react-router'
import DemoPage from '@/features/DemoHono'

export const Route = createFileRoute('/_authenticated/demo-hono')({
	component: DemoPage,
})
