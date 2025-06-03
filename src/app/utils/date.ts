/**
 * Date and time formatting utilities
 * Format: DD.MM.YY H:MM AM/PM (e.g., "03.06.25 4:30 PM")
 */

export const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp)
	return date
		.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
		})
		.replace(/\//g, '.') // Convert "03/06/25" to "03.06.25"
}

export const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp)
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	}) // "4:30 PM"
}

export const formatDateTime = (timestamp: number): string => {
	return `${formatDate(timestamp)} ${formatTime(timestamp)}`
	// "03.06.25 4:30 PM"
}

// Additional utility for just date without time
export const formatDateOnly = (timestamp: number): string => {
	return formatDate(timestamp) // "03.06.25"
}

// Additional utility for just time without date
export const formatTimeOnly = (timestamp: number): string => {
	return formatTime(timestamp) // "4:30 PM"
}
