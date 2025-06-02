import { ShowCustomer } from '@/app/features/customers/ShowCustomer'
import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
	component: ShowCustomerPage,
})

function ShowCustomerPage() {
	const { customerId } = Route.useParams()
	const childMatches = useChildMatches()
	const hasChildRoute = childMatches.length > 0

	// If there's a child route (like edit), render only the Outlet
	// Otherwise, render the ShowCustomer component
	if (hasChildRoute) {
		return <Outlet />
	}

	return <ShowCustomer customerId={customerId} />
}