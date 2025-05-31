import { createFileRoute } from '@tanstack/react-router'
import DemoTrpcPage from '../DemoTrpcPage'

export const Route = createFileRoute('/trpc-demo')({
	component: DemoTrpcPage,
})
