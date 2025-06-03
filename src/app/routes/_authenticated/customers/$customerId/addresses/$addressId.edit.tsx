import { AddressForm } from '@/app/features/customers/addresses/AddressForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/addresses/$addressId/edit',
)({
	component: EditAddressPage,
})

function EditAddressPage() {
	const { customerId, addressId } = Route.useParams()
	return <AddressForm customerId={customerId} addressId={addressId} />
}
