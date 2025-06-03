interface LoadingOverlayProps {
	isLoading: boolean
	message?: string
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
	if (!isLoading) return null

	return (
		<div className="loading-overlay">
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '1rem',
				}}
			>
				<div className="loading-spinner" />
				{message && (
					<span style={{ fontSize: '14px', color: '#666' }}>{message}</span>
				)}
			</div>
		</div>
	)
}
