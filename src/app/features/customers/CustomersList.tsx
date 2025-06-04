//src/app/features/customers/CustomersList.tsx
import { useAuth } from '@/app/AuthProvider'
import { LoadingOverlay } from '@/app/components/LoadingOverlay'
import { trpc } from '@/app/trpc'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export function CustomersList() {
	const { hasPermission } = useAuth()
	const navigate = useNavigate()
	const [searchInput, setSearchInput] = useState('')
	const [status, setStatus] = useState<0 | 1 | undefined>(1) // Default to active
	const [displayedCount, setDisplayedCount] = useState(20) // How many customers to show

	// Load ALL customers for the current status filter
	const { data, isLoading, error } = trpc.customers.listAll.useQuery({
		status,
	})

	// Client-side filtering using useMemo - instant search, no re-renders
	const filteredCustomers = useMemo(() => {
		if (!data?.customers) return []

		if (!searchInput.trim()) {
			return data.customers
		}

		const searchTerm = searchInput.toLowerCase().trim()
		return data.customers.filter(
			(customer) =>
				customer.contact_company_name.toLowerCase().includes(searchTerm) ||
				(customer.contact_email?.toLowerCase().includes(searchTerm) ?? false),
		)
	}, [data?.customers, searchInput])

	// Customers to display (with pagination)
	const displayedCustomers = useMemo(() => {
		return filteredCustomers.slice(0, displayedCount)
	}, [filteredCustomers, displayedCount])

	const handleLoadMore = () => {
		setDisplayedCount((prev) => prev + 20)
	}

	const hasMoreToLoad = displayedCount < filteredCustomers.length

	// Show error without layout
	if (error) {
		return (
			<div className="component-wrapper">
				<div className="content-header">
					<h1>Customers</h1>
				</div>
				<div className="content-body">
					<div style={{ padding: '2rem', textAlign: 'center' }}>
						Error: {error.message}
					</div>
				</div>
			</div>
		)
	}

	const totalCustomers = data?.totalCustomers || 0
	const filteredCount = filteredCustomers.length

	return (
		<div>
			<div className="content-header">
				<h1>Customers</h1>
				<div>
					{hasPermission('customers', 'create') && (
						<button
							className="button-blue"
							type="button"
							onClick={() => navigate({ to: '/customers/create' })}
						>
							Create Customer
						</button>
					)}
				</div>
			</div>

			<div className="content-body">
				<div className="content-actions">
					<input
						className="search-input"
						type="text"
						placeholder="Search by company name or email..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<div className="display-flex">
						<span className="light-text">
							{searchInput
								? `${filteredCount} of ${totalCustomers} customers`
								: `Total Customers: ${totalCustomers}`}
						</span>
						<select
							className="custom-select select-short"
							value={status === undefined ? 'all' : status}
							onChange={(e) => {
								const value = e.target.value
								setStatus(
									value === 'all' ? undefined : (Number(value) as 0 | 1),
								)
								setDisplayedCount(20) // Reset display count when filter changes
							}}
						>
							<option value={1}>Active</option>
							<option value={0}>Inactive</option>
							<option value="all">All</option>
						</select>
					</div>
				</div>

				<div className="scroll-container">
					{isLoading && <LoadingOverlay isLoading={true} />}
					{displayedCustomers.length === 0 && !isLoading ? (
						<div className="list-empty">
							{searchInput
								? 'No customers match your search'
								: 'No customers found'}
						</div>
					) : (
						displayedCustomers.map((customer) => (
							<div key={customer.id} className="list-item">
								{/* Left side - Customer info */}
								<div className="list-item-content">
									<div className="list-item-info">
										<div className="list-item-title">
											{customer.contact_company_name}
										</div>
										<div className="list-item-meta">
											{customer.id} • {customer.contact_email || 'No email'} •{' '}
											<span
												className={
													customer.status === 1 ? 'text-green' : 'text-red'
												}
											>
												{customer.status === 1 ? 'Active' : 'Inactive'}
											</span>
										</div>
									</div>
								</div>

								{/* Right side - Actions only */}
								<div className="list-item-links">
									<Link
										to="/customers/$customerId"
										params={{ customerId: customer.id }}
									>
										Show
									</Link>
									{hasPermission('customers', 'update-any') && (
										<>
											<span className="list-item-separator">|</span>
											<Link
												to="/customers/$customerId/edit"
												params={{ customerId: customer.id }}
											>
												Edit
											</Link>
										</>
									)}
								</div>
							</div>
						))
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
										Load More ({displayedCount} of {filteredCount} shown)
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
