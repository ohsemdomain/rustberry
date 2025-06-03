import { ContactForm } from '@/app/features/customers/contacts/ContactForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/contacts/create',
)({
	component: CreateContactPage,
})

function CreateContactPage() {
	const { customerId } = Route.useParams()
	return <ContactForm customerId={customerId} />
}
