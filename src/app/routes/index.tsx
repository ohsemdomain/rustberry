import { createFileRoute } from '@tanstack/react-router'
import DemoPage from '../DemoPage'

export const Route = createFileRoute('/')({
	component: DemoPage,
})