import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/invoices/create')({
	component: CreateInvoicePage,
})

function CreateInvoicePage() {
	return <div>Create Invoice - Component coming soon</div>
}