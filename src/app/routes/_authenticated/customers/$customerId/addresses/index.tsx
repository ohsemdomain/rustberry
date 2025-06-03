import { AddressList } from '@/app/features/customers/addresses/AddressList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/addresses/',
)({
	component: AddressListPage,
})

function AddressListPage() {
	const { customerId } = Route.useParams()
	return <AddressList customerId={customerId} />
}
