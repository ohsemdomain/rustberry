import { useAuth } from '@/app/AuthProvider'
import { trpc } from '@/app/trpc'
import { Link, useNavigate } from '@tanstack/react-router'

interface ShowCustomerProps {
	customerId: string
}

export function ShowCustomer({ customerId }: ShowCustomerProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const { data: customer, isLoading, error } = trpc.customers.getById.useQuery(customerId)

	if (isLoading) return <div style={{ padding: '1rem' }}>Loading...</div>
	if (error)
		return <div style={{ padding: '1rem' }}>Error: {error.message}</div>
	if (!customer) return <div style={{ padding: '1rem' }}>Customer not found</div>

	const getStatusColor = (status: number) => {
		return status === 1 ? 'green' : 'red'
	}

	const getStatusName = (status: number) => {
		return status === 1 ? 'Active' : 'Inactive'
	}

	return (
		<div style={{ padding: '1rem', maxWidth: '800px' }}>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem',
					borderBottom: '1px solid #ddd',
					paddingBottom: '1rem',
				}}
			>
				<h1>Customer Details</h1>
				<div style={{ display: 'flex', gap: '1rem' }}>
					{hasPermission('customers', 'update-any') && (
						<Link
							to="/customers/$customerId/edit"
							params={{ customerId: customer.id }}
							style={{
								backgroundColor: '#007bff',
								color: 'white',
								padding: '0.5rem 1rem',
								textDecoration: 'none',
								borderRadius: '4px',
							}}
						>
							Edit Customer
						</Link>
					)}
					<button
						type="button"
						onClick={() => navigate({ to: '/customers' })}
						style={{
							backgroundColor: '#6c757d',
							color: 'white',
							padding: '0.5rem 1rem',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Back to Customers
					</button>
				</div>
			</div>

			{/* Customer Info */}
			<div style={{ display: 'grid', gap: '1.5rem' }}>
				{/* ID */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Customer ID
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
							fontFamily: 'monospace',
						}}
					>
						{customer.id}
					</div>
				</div>

				{/* Name */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Customer Name
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						{customer.customer_name}
					</div>
				</div>

				{/* Email */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Email
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						{customer.customer_email || 'No email provided'}
					</div>
				</div>

				{/* Status */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Status
					</div>
					<div
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							border: '1px solid #e9ecef',
							borderRadius: '4px',
						}}
					>
						<span
							style={{
								color: getStatusColor(customer.status),
								fontWeight: 'bold',
							}}
						>
							{getStatusName(customer.status)}
						</span>
					</div>
				</div>

				{/* Phone Contacts */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Phone Contacts
					</div>
					{customer.contacts && customer.contacts.length > 0 ? (
						<div
							style={{
								border: '1px solid #e9ecef',
								borderRadius: '4px',
								overflow: 'hidden',
							}}
						>
							{customer.contacts.map((contact) => (
								<div
									key={contact.id}
									style={{
										padding: '0.75rem',
										backgroundColor: '#f8f9fa',
										borderBottom: '1px solid #e9ecef',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<div>
										<strong>{contact.phone_number}</strong>
										{contact.phone_label && (
											<span style={{ marginLeft: '1rem', color: '#666' }}>
												({contact.phone_label})
											</span>
										)}
									</div>
									{contact.is_primary === 1 && (
										<span
											style={{
												backgroundColor: '#28a745',
												color: 'white',
												padding: '0.25rem 0.5rem',
												borderRadius: '4px',
												fontSize: '0.85rem',
											}}
										>
											Primary
										</span>
									)}
								</div>
							))}
						</div>
					) : (
						<div
							style={{
								padding: '0.75rem',
								backgroundColor: '#f8f9fa',
								border: '1px solid #e9ecef',
								borderRadius: '4px',
								color: '#666',
							}}
						>
							No phone contacts
						</div>
					)}
				</div>

				{/* Addresses */}
				<div>
					<div
						style={{
							display: 'block',
							fontWeight: 'bold',
							marginBottom: '0.5rem',
							color: '#555',
						}}
					>
						Addresses
					</div>
					{customer.addresses && customer.addresses.length > 0 ? (
						<div style={{ display: 'grid', gap: '1rem' }}>
							{/* Billing addresses */}
							<div>
								<h4 style={{ marginBottom: '0.5rem' }}>Billing Addresses</h4>
								{customer.addresses
									.filter((addr) => addr.address_type === 'billing')
									.map((address) => (
										<div
											key={address.id}
											style={{
												padding: '0.75rem',
												backgroundColor: '#f8f9fa',
												border: '1px solid #e9ecef',
												borderRadius: '4px',
												marginBottom: '0.5rem',
											}}
										>
											{address.address_label && (
												<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
													{address.address_label}
													{address.is_default === 1 && (
														<span
															style={{
																marginLeft: '0.5rem',
																backgroundColor: '#007bff',
																color: 'white',
																padding: '0.15rem 0.5rem',
																borderRadius: '4px',
																fontSize: '0.8rem',
															}}
														>
															Default
														</span>
													)}
												</div>
											)}
											{address.address_line1 && <div>{address.address_line1}</div>}
											{address.address_line2 && <div>{address.address_line2}</div>}
											{address.address_line3 && <div>{address.address_line3}</div>}
											{address.address_line4 && <div>{address.address_line4}</div>}
											<div>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</div>
											{address.country && <div>{address.country}</div>}
										</div>
									))}
							</div>

							{/* Shipping addresses */}
							<div>
								<h4 style={{ marginBottom: '0.5rem' }}>Shipping Addresses</h4>
								{customer.addresses
									.filter((addr) => addr.address_type === 'shipping')
									.map((address) => (
										<div
											key={address.id}
											style={{
												padding: '0.75rem',
												backgroundColor: '#f8f9fa',
												border: '1px solid #e9ecef',
												borderRadius: '4px',
												marginBottom: '0.5rem',
											}}
										>
											{address.address_label && (
												<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
													{address.address_label}
													{address.is_default === 1 && (
														<span
															style={{
																marginLeft: '0.5rem',
																backgroundColor: '#007bff',
																color: 'white',
																padding: '0.15rem 0.5rem',
																borderRadius: '4px',
																fontSize: '0.8rem',
															}}
														>
															Default
														</span>
													)}
												</div>
											)}
											{address.address_line1 && <div>{address.address_line1}</div>}
											{address.address_line2 && <div>{address.address_line2}</div>}
											{address.address_line3 && <div>{address.address_line3}</div>}
											{address.address_line4 && <div>{address.address_line4}</div>}
											<div>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</div>
											{address.country && <div>{address.country}</div>}
										</div>
									))}
							</div>
						</div>
					) : (
						<div
							style={{
								padding: '0.75rem',
								backgroundColor: '#f8f9fa',
								border: '1px solid #e9ecef',
								borderRadius: '4px',
								color: '#666',
							}}
						>
							No addresses
						</div>
					)}
				</div>

				{/* Metadata */}
				<div
					style={{
						borderTop: '1px solid #ddd',
						paddingTop: '1rem',
						marginTop: '1rem',
					}}
				>
					<h3 style={{ marginBottom: '1rem', color: '#666' }}>
						Customer Information
					</h3>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
					>
						<div>
							<div
								style={{
									display: 'block',
									fontWeight: 'bold',
									marginBottom: '0.25rem',
									color: '#666',
									fontSize: '0.9rem',
								}}
							>
								Created At
							</div>
							<div style={{ fontSize: '0.9rem', color: '#666' }}>
								{new Date(customer.created_at).toLocaleString()}
							</div>
						</div>
						<div>
							<div
								style={{
									display: 'block',
									fontWeight: 'bold',
									marginBottom: '0.25rem',
									color: '#666',
									fontSize: '0.9rem',
								}}
							>
								Last Updated
							</div>
							<div style={{ fontSize: '0.9rem', color: '#666' }}>
								{new Date(customer.updated_at).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}