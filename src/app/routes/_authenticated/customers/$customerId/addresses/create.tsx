import { AddressForm } from '@/app/features/customers/addresses/AddressForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/addresses/create',
)({
	component: CreateAddressPage,
})

function CreateAddressPage() {
	const { customerId } = Route.useParams()
	return <AddressForm customerId={customerId} />
}
