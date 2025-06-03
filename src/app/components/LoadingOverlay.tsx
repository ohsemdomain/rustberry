import { useEffect, useRef, useState } from 'react'

interface LoadingOverlayProps {
	isLoading: boolean
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
	const [showOverlay, setShowOverlay] = useState(false)
	const [showSpinner, setShowSpinner] = useState(false)

	// Initialize refs with undefined
	const showTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const hideTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const spinnerTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

	useEffect(() => {
		// Clear any existing timers
		const clearAllTimers = () => {
			if (showTimerRef.current) clearTimeout(showTimerRef.current)
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
			if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current)
		}

		if (isLoading) {
			// Clear any hide timer if loading starts again
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

			// Delay showing overlay by 200ms to prevent flicker on fast loads
			showTimerRef.current = setTimeout(() => {
				setShowOverlay(true)

				// Show spinner after 3 seconds
				spinnerTimerRef.current = setTimeout(() => {
					setShowSpinner(true)
				}, 3000)
			}, 200)
		} else {
			// Clear the show timer if loading ends quickly
			if (showTimerRef.current) clearTimeout(showTimerRef.current)

			if (showOverlay) {
				// If overlay is showing, keep it for minimum 1 second
				hideTimerRef.current = setTimeout(() => {
					setShowOverlay(false)
					setShowSpinner(false)
				}, 1000)
			} else {
				// If overlay never showed, just reset
				setShowOverlay(false)
				setShowSpinner(false)
			}
		}

		// Cleanup function
		return () => {
			clearAllTimers()
		}
	}, [isLoading, showOverlay])

	if (!showOverlay) return null

	return (
		<div className="loading-overlay">
			{showSpinner && <div className="loading-spinner" />}
		</div>
	)
}
