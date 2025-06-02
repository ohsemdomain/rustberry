import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/invoices/$invoiceId/edit',
)({
	component: EditInvoicePage,
})

function EditInvoicePage() {
	const { invoiceId } = Route.useParams()
	return <div>Edit Invoice {invoiceId} - Component coming soon</div>
}
