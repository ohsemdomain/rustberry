import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import type { CustomerAddress } from '@/shared/customer'
import { Link, useNavigate } from '@tanstack/react-router'
import { MapPin, Plus, Package, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'

interface AddressListProps {
	customerId: string
}

export function AddressList({ customerId }: AddressListProps) {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	const [activeTab, setActiveTab] = useState<'billing' | 'shipping'>('billing')
	const [displayedCount, setDisplayedCount] = useState(20)

	// Get customer data to display name
	const {
		data: customer,
		isLoading,
		error,
	} = trpc.customers.getById.useQuery(customerId)

	// Get addresses - we already have them from the customer query
	const addresses = customer?.addresses || []

	const [isUpdating, setIsUpdating] = useState<string | null>(null)

	// Find default addresses
	const defaultBillingAddress = useMemo(() => {
		return addresses.find(
			(a) => a.address_type === 'billing' && a.is_default === 1,
		)
	}, [addresses])

	const defaultShippingAddress = useMemo(() => {
		return addresses.find(
			(a) => a.address_type === 'shipping' && a.is_default === 1,
		)
	}, [addresses])

	// Non-default addresses for the list
	const nonDefaultAddresses = useMemo(() => {
		return addresses.filter(
			(a) => a.address_type === activeTab && a.is_default !== 1,
		)
	}, [addresses, activeTab])

	// Addresses to display (with pagination)
	const displayedAddresses = useMemo(() => {
		return nonDefaultAddresses.slice(0, displayedCount)
	}, [nonDefaultAddresses, displayedCount])

	const handleLoadMore = () => {
		setDisplayedCount((prev) => prev + 20)
	}

	const hasMoreToLoad = displayedCount < nonDefaultAddresses.length

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

	const handleAddAddress = () => {
		navigate({
			to: '/customers/$customerId/addresses/create',
			params: { customerId },
		})
	}

	// Show error without layout
	if (error) {
		return (
			<div className="component-wrapper">
				<div className="content-header">
					<h1>Manage Addresses</h1>
				</div>
				<div className="content-body">
					<div style={{ padding: '2rem', textAlign: 'center' }}>
						Error: {error.message}
					</div>
				</div>
			</div>
		)
	}

	const isProcessing = isUpdating !== null
	const currentDefaultAddress =
		activeTab === 'billing' ? defaultBillingAddress : defaultShippingAddress

	const formatAddress = (address: CustomerAddress) => {
		const parts = [
			address.address_line1,
			address.address_line2,
			address.address_line3,
			address.address_line4,
			[address.city, address.state, address.postcode]
				.filter(Boolean)
				.join(', '),
			address.country,
		].filter(Boolean)
		return parts
	}

	return (
		<div>
			<div className="content-header">
				<h1>Manage Addresses</h1>
				<div>
					<Link to="/customers/$customerId" params={{ customerId }}>
						← Back to customer detail
					</Link>
				</div>
			</div>

			<div className="content-body">
				{/* Tabs */}
				<div className="address-tabs">
					<button
						className={`address-tab ${activeTab === 'billing' ? 'active' : ''}`}
						onClick={() => {
							setActiveTab('billing')
							setDisplayedCount(20)
						}}
						type="button"
					>
						<FileText size={16} />
						Billing Addresses
					</button>
					<button
						className={`address-tab ${activeTab === 'shipping' ? 'active' : ''}`}
						onClick={() => {
							setActiveTab('shipping')
							setDisplayedCount(20)
						}}
						type="button"
					>
						<Package size={16} />
						Shipping Addresses
					</button>
				</div>

				<div className="address-cards-section">
					{/* Default Address Card */}
					<div className="address-card primary-card">
						<div className="address-card-icon">
							<MapPin size={24} />
						</div>
						<div className="address-card-content">
							<h3 className="address-card-title">
								Default {activeTab} Address
							</h3>
							{currentDefaultAddress ? (
								<>
									{currentDefaultAddress.address_label && (
										<p className="address-card-label">
											{currentDefaultAddress.address_label}
										</p>
									)}
									<div className="address-card-lines">
										<p className="address-card-line">
											{[
												currentDefaultAddress.address_line1,
												currentDefaultAddress.address_line2,
												currentDefaultAddress.address_line3,
												currentDefaultAddress.address_line4,
											]
												.filter(Boolean)
												.join(' ')}
										</p>
										<p className="address-card-line">
											{[
												currentDefaultAddress.city,
												currentDefaultAddress.state,
												currentDefaultAddress.country,
												currentDefaultAddress.postcode,
											]
												.filter(Boolean)
												.join(' • ')}
										</p>
									</div>
									<div className="address-card-actions">
										<Link
											to="/customers/$customerId/addresses/$addressId/edit"
											params={{
												customerId,
												addressId: currentDefaultAddress.id,
											}}
											className="address-card-link"
										>
											Edit
										</Link>
									</div>
								</>
							) : (
								<p className="address-card-empty">
									No default {activeTab} address set
								</p>
							)}
						</div>
					</div>

					{/* Add Address Card */}
					{hasPermission('customers', 'update-any') && (
						<button
							className="address-card add-address-card"
							onClick={handleAddAddress}
							type="button"
						>
							<div className="add-address-icon">
								<Plus size={32} />
							</div>
							<p className="add-address-text">Add New Address</p>
						</button>
					)}
				</div>

				<div className="scroll-container">
					{(isLoading || isProcessing) && <LoadingOverlay isLoading={true} />}
					{nonDefaultAddresses.length === 0 && !isLoading ? (
						<div className="list-empty">
							No additional {activeTab} addresses found
						</div>
					) : (
						<>
							<div className="address-list-header">
								<h3>
									Other {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{' '}
									Addresses
								</h3>
							</div>
							{displayedAddresses.map((address) => (
								<div key={address.id} className="list-item">
									{/* Left side - Address info */}
									<div className="list-item-content">
										<div className="list-item-info">
											<div className="list-item-title">
												{address.address_label ||
													`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Address`}
											</div>
											<div className="list-item-meta">
												<div>{address.address_line1}</div>
												{[
													address.address_line2,
													address.address_line3,
													address.address_line4,
												].filter(Boolean).length > 0 && (
													<div>
														{[
															address.address_line2,
															address.address_line3,
															address.address_line4,
														]
															.filter(Boolean)
															.join(' ')}
													</div>
												)}
												<div>
													{[
														address.city,
														address.state,
														address.country,
														address.postcode,
													]
														.filter(Boolean)
														.join(' • ')}
												</div>
											</div>
										</div>
									</div>

									{/* Right side - Actions */}
									<div className="list-item-links">
										<Link
											to="/customers/$customerId/addresses/$addressId/edit"
											params={{
												customerId,
												addressId: address.id,
											}}
										>
											Edit
										</Link>
										{hasPermission('customers', 'update-any') && (
											<>
												<span className="list-item-separator">|</span>
												<button
													type="button"
													onClick={() => handleSetDefault(address)}
													disabled={isUpdating === address.id}
													style={{
														background: 'none',
														border: 'none',
														color: '#3b82f6',
														cursor: 'pointer',
														padding: 0,
														font: 'inherit',
													}}
												>
													Set Default
												</button>
											</>
										)}
										{hasPermission('customers', 'update-any') && (
											<>
												<span className="list-item-separator">|</span>
												<button
													type="button"
													onClick={() => handleDelete(address.id)}
													disabled={isUpdating === address.id}
													style={{
														background: 'none',
														border: 'none',
														color: '#ef4444',
														cursor: 'pointer',
														padding: 0,
														font: 'inherit',
													}}
												>
													Delete
												</button>
											</>
										)}
									</div>
								</div>
							))}
						</>
					)}

					{/* Load More button */}
					{hasMoreToLoad && (
						<div className="list-item">
							<div className="list-item-content">
								<div
									className="list-item-info"
									style={{ textAlign: 'center', width: '100%' }}
								>
									<button
										type="button"
										onClick={handleLoadMore}
										className="button-blue"
										style={{ margin: '0 auto' }}
									>
										Load More ({displayedCount} of {nonDefaultAddresses.length}{' '}
										shown)
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
