import { InvoicesList } from '@/app/features/invoices/InvoicesList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/invoices/')({
	component: InvoicesList,
})