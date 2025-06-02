import { CustomersList } from '@/app/features/customers/CustomersList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/')({
	component: CustomersList,
})
