import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/invoices/$invoiceId')({
	component: ShowInvoicePage,
})

function ShowInvoicePage() {
	const { invoiceId } = Route.useParams()
	const childMatches = useChildMatches()
	const hasChildRoute = childMatches.length > 0

	// If there's a child route (like edit), render only the Outlet
	// Otherwise, render the ShowInvoice component
	if (hasChildRoute) {
		return <Outlet />
	}

	return <div>Show Invoice {invoiceId} - Component coming soon</div>
}