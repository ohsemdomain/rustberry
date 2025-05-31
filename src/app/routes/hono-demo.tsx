import { createFileRoute } from '@tanstack/react-router'
import DemoPage from '../DemoHonoPage'

export const Route = createFileRoute('/hono-demo')({
	component: DemoPage,
})
