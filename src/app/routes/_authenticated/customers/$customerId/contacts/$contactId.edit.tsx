import { ContactForm } from '@/app/features/customers/contacts/ContactForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/contacts/$contactId/edit',
)({
	component: EditContactPage,
})

function EditContactPage() {
	const { customerId, contactId } = Route.useParams()
	return <ContactForm customerId={customerId} contactId={contactId} />
}
