import { CustomerDetail } from '@/app/features/customers/CustomerDetail'
import {
	Outlet,
	createFileRoute,
	useChildMatches,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
	component: ShowCustomerPage,
})

function ShowCustomerPage() {
	const { customerId } = Route.useParams()
	const childMatches = useChildMatches()
	const hasChildRoute = childMatches.length > 0

	// If there's a child route (like edit), render only the Outlet
	// Otherwise, render the CustomerDetail component
	if (hasChildRoute) {
		return <Outlet />
	}

	return <CustomerDetail customerId={customerId} />
}
