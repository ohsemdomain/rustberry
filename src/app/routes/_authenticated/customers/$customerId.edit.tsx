import { CustomerForm } from '@/app/features/customers/CustomerForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/edit',
)({
	component: EditCustomerPage,
})

function EditCustomerPage() {
	const { customerId } = Route.useParams()
	return <CustomerForm customerId={customerId} />
}
