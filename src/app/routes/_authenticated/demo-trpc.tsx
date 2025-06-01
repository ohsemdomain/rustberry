import DemoTrpcPage from '@/app/features/DemoTrpc'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/demo-trpc')({
	component: DemoTrpcPage,
})
