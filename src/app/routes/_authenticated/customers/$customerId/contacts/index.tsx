import { ContactList } from '@/app/features/customers/contacts/ContactList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/_authenticated/customers/$customerId/contacts/',
)({
	component: ContactListPage,
})

function ContactListPage() {
	const { customerId } = Route.useParams()
	return <ContactList customerId={customerId} />
}
