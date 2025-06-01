import { createFileRoute } from '@tanstack/react-router'
import DemoTrpcPage from '@/features/DemoTrpc'

export const Route = createFileRoute('/_authenticated/demo-trpc')({
	component: DemoTrpcPage,
})
