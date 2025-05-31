import { createFileRoute } from '@tanstack/react-router'
import DemoPage from '../../DemoHonoPage'

export const Route = createFileRoute('/_authenticated/hono-demo')({
	component: DemoPage,
})
