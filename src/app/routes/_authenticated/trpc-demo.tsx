import { createFileRoute } from '@tanstack/react-router'
import DemoTrpcPage from '@/DemoTrpcPage'

export const Route = createFileRoute('/_authenticated/trpc-demo')({
	component: DemoTrpcPage,
})
