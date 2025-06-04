import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { formatDateTime } from '@/app/utils/date'
import { Link, useNavigate } from '@tanstack/react-router'

interface CustomerDetailProps {
	customerId: string
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	if (error) return <div>Error: {error.message}</div>
	if (!isLoading && !customer) return <div>Customer not found</div>

	return (
		<div>
			<div className="content-header">
				<h1>Customer Details</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/customers">← Back</Link>
					</div>
					<div className="button-group">
						{hasPermission('customers', 'update-any') && customer && (
							<>
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
								<button
									className="button-secondary"
									type="button"
									onClick={() =>
										navigate({
											to: '/customers/$customerId/addresses',
											params: { customerId: customer.id },
										})
									}
								>
									Manage Addresses
								</button>
								<button
									className="button-secondary"
									type="button"
									onClick={() =>
										navigate({
											to: '/customers/$customerId/contacts',
											params: { customerId: customer.id },
										})
									}
								>
									Manage Contacts
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isLoading} />
					{customer && (
						<div className="detail-content">
							{/* Basic Information */}
							<div className="info-section">
								<h2>Basic Information</h2>
								<div className="info-grid">
									<div>
										<p>
											<strong>Customer ID:</strong> {customer.id}
										</p>
										<p>
											<strong>Name:</strong> {customer.customer_name}
										</p>
										<p>
											<strong>Primary Contact:</strong> {(() => {
												const primaryContact = customer.contacts?.find(
													(c) => c.is_primary === 1,
												)
												return primaryContact ? (
													<span className="contact-info">
														{primaryContact.phone_number}
														{primaryContact.phone_label && (
															<span className="phone-label">
																{' '}
																({primaryContact.phone_label})
															</span>
														)}
													</span>
												) : (
													<span className="no-data">
														No primary contact set
													</span>
												)
											})()}
										</p>
									</div>
									<div>
										<p>
											<strong>Email:</strong>{' '}
											{customer.customer_email || (
												<span className="no-data">No email provided</span>
											)}
										</p>
										<p>
											<strong>Status:</strong>{' '}
											<span
												className={
													customer.status === 1
														? 'badge-success'
														: 'badge-inactive'
												}
											>
												{customer.status === 1 ? 'Active' : 'Inactive'}
											</span>
										</p>
									</div>
								</div>
							</div>

							{/* Default Billing Address Card */}
							<div className="info-section">
								<h2>Default Billing Address</h2>
								{(() => {
									const defaultBilling = customer.addresses?.find(
										(a) => a.address_type === 'billing' && a.is_default === 1,
									)
									return defaultBilling ? (
										<div className="card">
											{defaultBilling.address_label && (
												<p className="address-label">
													{defaultBilling.address_label}
												</p>
											)}
											<p>{defaultBilling.address_line1}</p>
											{defaultBilling.address_line2 && (
												<p>{defaultBilling.address_line2}</p>
											)}
											{defaultBilling.address_line3 && (
												<p>{defaultBilling.address_line3}</p>
											)}
											{defaultBilling.address_line4 && (
												<p>{defaultBilling.address_line4}</p>
											)}
											<p>
												{[
													defaultBilling.city,
													defaultBilling.state,
													defaultBilling.postcode,
												]
													.filter(Boolean)
													.join(', ')}
											</p>
											{defaultBilling.country && (
												<p>{defaultBilling.country}</p>
											)}
										</div>
									) : (
										<p className="no-data">No default billing address set</p>
									)
								})()}
							</div>

							{/* Default Shipping Address Card */}
							<div className="info-section">
								<h2>Default Shipping Address</h2>
								{(() => {
									const defaultShipping = customer.addresses?.find(
										(a) => a.address_type === 'shipping' && a.is_default === 1,
									)
									return defaultShipping ? (
										<div className="card">
											{defaultShipping.address_label && (
												<p className="address-label">
													{defaultShipping.address_label}
												</p>
											)}
											<p>{defaultShipping.address_line1}</p>
											{defaultShipping.address_line2 && (
												<p>{defaultShipping.address_line2}</p>
											)}
											{defaultShipping.address_line3 && (
												<p>{defaultShipping.address_line3}</p>
											)}
											{defaultShipping.address_line4 && (
												<p>{defaultShipping.address_line4}</p>
											)}
											<p>
												{[
													defaultShipping.city,
													defaultShipping.state,
													defaultShipping.postcode,
												]
													.filter(Boolean)
													.join(', ')}
											</p>
											{defaultShipping.country && (
												<p>{defaultShipping.country}</p>
											)}
										</div>
									) : (
										<p className="no-data">No default shipping address set</p>
									)
								})()}
							</div>

							{/* Metadata */}
							<div className="info-section light-text">
								<p>
									<strong>Created:</strong>{' '}
									{formatDateTime(customer.created_at)}
								</p>
								<p>
									<strong>Created by:</strong> {customer.created_by}
								</p>
								<p>
									<strong>Updated:</strong>{' '}
									{formatDateTime(customer.updated_at)}
								</p>
								<p>
									<strong>Updated by:</strong> {customer.updated_by}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
