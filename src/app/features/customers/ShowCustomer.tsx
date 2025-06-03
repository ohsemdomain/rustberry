import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowCustomerProps {
	customerId: string
}

export function ShowCustomer({ customerId }: ShowCustomerProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	if (isLoading) return <div style={{ padding: '1rem' }}>Loading...</div>
	if (error)
		return <div style={{ padding: '1rem' }}>Error: {error.message}</div>
	if (!customer)
		return <div style={{ padding: '1rem' }}>Customer not found</div>

	return (
		<div>
			<div className="content-header">
				<h1>Customer Details</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/customers">← Back</Link>
					</div>
					<div>
						{hasPermission('customers', 'update-any') && (
							<button
								className="button-gray"
								type="button"
								onClick={() =>
									navigate({
										to: '/customers/$customerId/edit',
										params: { customerId: customer.id },
									})
								}
							>
								Edit Customer
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<div className="detail-content">
						<div>
							<p>
								<strong>ID:</strong> {customer.id}
							</p>
							<p>
								<strong>Customer Name:</strong> {customer.customer_name}
							</p>
							<p>
								<strong>Email:</strong>
								{customer.customer_email || 'No email provided'}
							</p>
							<p>
								<strong>Status:</strong>
								<span>{customer.status === 1 ? 'Active' : 'Inactive'}</span>
							</p>

							<p>
								<strong>Phone Contacts:</strong>
								{customer.contacts && customer.contacts.length > 0 ? (
									<p>
										{customer.contacts.map((contact) => (
											<p key={contact.id}>
												{contact.phone_number}
												{contact.phone_label && ` (${contact.phone_label})`}
												{contact.is_primary === 1 && <strong> Primary</strong>}
											</p>
										))}
									</p>
								) : (
									<span> No phone contacts</span>
								)}
							</p>

							{customer.addresses && customer.addresses.length > 0 && (
								<div style={{ marginTop: '1rem' }}>
									{/* Billing addresses */}
									{customer.addresses.filter(
										(addr) => addr.address_type === 'billing',
									).length > 0 && (
										<div style={{ marginBottom: '1rem' }}>
											<strong>Billing Addresses:</strong>
											{customer.addresses
												.filter((addr) => addr.address_type === 'billing')
												.map((address) => (
													<div
														key={address.id}
														style={{ marginLeft: '1rem', marginTop: '0.5rem' }}
													>
														{address.address_label && (
															<div>
																<strong>{address.address_label}</strong>{' '}
																{address.is_default === 1 && '(Default)'}
															</div>
														)}
														{address.address_line1 && (
															<div>{address.address_line1}</div>
														)}
														{address.address_line2 && (
															<div>{address.address_line2}</div>
														)}
														{address.address_line3 && (
															<div>{address.address_line3}</div>
														)}
														{address.address_line4 && (
															<div>{address.address_line4}</div>
														)}
														<div>
															{[address.city, address.state, address.postcode]
																.filter(Boolean)
																.join(', ')}
														</div>
														{address.country && <div>{address.country}</div>}
													</div>
												))}
										</div>
									)}

									{/* Shipping addresses */}
									{customer.addresses.filter(
										(addr) => addr.address_type === 'shipping',
									).length > 0 && (
										<div>
											<strong>Shipping Addresses:</strong>
											{customer.addresses
												.filter((addr) => addr.address_type === 'shipping')
												.map((address) => (
													<div
														key={address.id}
														style={{ marginLeft: '1rem', marginTop: '0.5rem' }}
													>
														{address.address_label && (
															<div>
																<strong>{address.address_label}</strong>{' '}
																{address.is_default === 1 && '(Default)'}
															</div>
														)}
														{address.address_line1 && (
															<div>{address.address_line1}</div>
														)}
														{address.address_line2 && (
															<div>{address.address_line2}</div>
														)}
														{address.address_line3 && (
															<div>{address.address_line3}</div>
														)}
														{address.address_line4 && (
															<div>{address.address_line4}</div>
														)}
														<div>
															{[address.city, address.state, address.postcode]
																.filter(Boolean)
																.join(', ')}
														</div>
														{address.country && <div>{address.country}</div>}
													</div>
												))}
										</div>
									)}
								</div>
							)}
						</div>

						<div className="light-text">
							<p>
								<strong>Created:</strong> {formatDateTime(customer.created_at)}
							</p>
							<p>
								<strong>Created by:</strong> user-id
							</p>
							<p>
								<strong>Updated:</strong> {formatDateTime(customer.updated_at)}
							</p>
							<p>
								<strong>Updated by:</strong> user-id
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
