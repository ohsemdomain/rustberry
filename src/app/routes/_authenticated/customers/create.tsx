import { CustomerForm } from '@/app/features/customers/CustomerForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/create')({
	component: CreateCustomerPage,
})

function CreateCustomerPage() {
	return <CustomerForm />
}