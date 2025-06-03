import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import type { CustomerAddress } from '@/shared/customer'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

interface AddressListProps {
	customerId: string
}

export function AddressList({ customerId }: AddressListProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	// Get customer data to display name
	const { data: customer } = trpc.customers.getById.useQuery(customerId)

	// Get addresses - we already have them from the customer query
	const addresses = customer?.addresses || []

	const [isUpdating, setIsUpdating] = useState<string | null>(null)

	// Mutations
	const updateAddressMutation = trpc.customers.updateAddress.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
		},
	})

	const deleteMutation = trpc.customers.removeAddress.useMutation({
		onSuccess: () => {
			utils.customers.getById.invalidate(customerId)
		},
	})

	const handleSetDefault = async (address: CustomerAddress) => {
		if (address.is_default === 1) return

		setIsUpdating(address.id)
		try {
			// First, unset current default for this type
			const currentDefault = addresses.find(
				(a) => a.address_type === address.address_type && a.is_default === 1,
			)
			if (currentDefault) {
				await updateAddressMutation.mutateAsync({
					id: currentDefault.id,
					is_default: 0,
				})
			}

			// Then set new default
			await updateAddressMutation.mutateAsync({
				id: address.id,
				is_default: 1,
			})
		} finally {
			setIsUpdating(null)
		}
	}

	const handleDelete = async (addressId: string) => {
		if (!confirm('Are you sure you want to delete this address?')) return

		setIsUpdating(addressId)
		try {
			await deleteMutation.mutateAsync(addressId)
		} finally {
			setIsUpdating(null)
		}
	}

	const isLoading = !customer
	const isProcessing = isUpdating !== null

	// Group addresses by type
	const billingAddresses = addresses.filter((a) => a.address_type === 'billing')
	const shippingAddresses = addresses.filter(
		(a) => a.address_type === 'shipping',
	)

	return (
		<div>
			<div className="content-header">
				<h1>Manage Addresses</h1>
				<div className="display-flex">
					<div className="display-flex">
						<Link to="/customers/$customerId" params={{ customerId }}>
							← Back to {customer?.customer_name || 'Customer'}
						</Link>
					</div>
					<div>
						{hasPermission('customers', 'update-any') && (
							<button
								className="button-primary"
								type="button"
								onClick={() =>
									navigate({
										to: '/customers/$customerId/addresses/create',
										params: { customerId },
									})
								}
							>
								Add Address
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="content-body">
				<div className="scroll-container">
					<LoadingOverlay isLoading={isLoading || isProcessing} />

					{/* Billing Addresses */}
					<div className="address-section">
						<h2>Billing Addresses</h2>
						{billingAddresses.length === 0 ? (
							<p className="no-data">No billing addresses found</p>
						) : (
							<div className="address-grid">
								{billingAddresses.map((address) => (
									<div key={address.id} className="address-card">
										<div className="address-header">
											<h3>{address.address_label || 'Billing Address'}</h3>
											{address.is_default === 1 && (
												<span className="badge-primary">Default</span>
											)}
										</div>
										<div className="address-body">
											<p>{address.address_line1}</p>
											{address.address_line2 && <p>{address.address_line2}</p>}
											{address.address_line3 && <p>{address.address_line3}</p>}
											{address.address_line4 && <p>{address.address_line4}</p>}
											<p>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</p>
											{address.country && <p>{address.country}</p>}
										</div>
										<div className="address-actions">
											<button
												className="button-small"
												type="button"
												onClick={() =>
													navigate({
														to: '/customers/$customerId/addresses/$addressId/edit',
														params: { customerId, addressId: address.id },
													})
												}
												disabled={isUpdating === address.id}
											>
												Edit
											</button>
											{address.is_default !== 1 && (
												<button
													className="button-small"
													type="button"
													onClick={() => handleSetDefault(address)}
													disabled={isUpdating === address.id}
												>
													Set Default
												</button>
											)}
											<button
												className="button-small button-danger"
												type="button"
												onClick={() => handleDelete(address.id)}
												disabled={
													isUpdating === address.id || address.is_default === 1
												}
												title={
													address.is_default === 1
														? 'Cannot delete default address'
														: ''
												}
											>
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Shipping Addresses */}
					<div className="address-section">
						<h2>Shipping Addresses</h2>
						{shippingAddresses.length === 0 ? (
							<p className="no-data">No shipping addresses found</p>
						) : (
							<div className="address-grid">
								{shippingAddresses.map((address) => (
									<div key={address.id} className="address-card">
										<div className="address-header">
											<h3>{address.address_label || 'Shipping Address'}</h3>
											{address.is_default === 1 && (
												<span className="badge-primary">Default</span>
											)}
										</div>
										<div className="address-body">
											<p>{address.address_line1}</p>
											{address.address_line2 && <p>{address.address_line2}</p>}
											{address.address_line3 && <p>{address.address_line3}</p>}
											{address.address_line4 && <p>{address.address_line4}</p>}
											<p>
												{[address.city, address.state, address.postcode]
													.filter(Boolean)
													.join(', ')}
											</p>
											{address.country && <p>{address.country}</p>}
										</div>
										<div className="address-actions">
											<button
												className="button-small"
												type="button"
												onClick={() =>
													navigate({
														to: '/customers/$customerId/addresses/$addressId/edit',
														params: { customerId, addressId: address.id },
													})
												}
												disabled={isUpdating === address.id}
											>
												Edit
											</button>
											{address.is_default !== 1 && (
												<button
													className="button-small"
													type="button"
													onClick={() => handleSetDefault(address)}
													disabled={isUpdating === address.id}
												>
													Set Default
												</button>
											)}
											<button
												className="button-small button-danger"
												type="button"
												onClick={() => handleDelete(address.id)}
												disabled={
													isUpdating === address.id || address.is_default === 1
												}
												title={
													address.is_default === 1
														? 'Cannot delete default address'
														: ''
												}
											>
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
