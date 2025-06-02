import { useEffect, useState } from 'react'

interface Quote {
	quote: string
	author: string
}

export function QuoteComponent() {
	const [quote, setQuote] = useState<Quote | null>(null)

	useEffect(() => {
		fetch('/api/quote')
			.then((res) => res.json())
			.then((data) => setQuote(data as Quote))
			.catch((err) => console.error('Failed to fetch quote:', err))
	}, [])

	if (!quote) {
		return null
	}

	return (
		<p style={{ display: 'flex', flexDirection: 'column' }}>
			"{quote.quote}"<span>~ {quote.author}</span>
		</p>
	)
}
