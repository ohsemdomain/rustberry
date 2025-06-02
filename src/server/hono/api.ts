import type { Env } from '@/server/worker-env'
import { Hono } from 'hono'

interface ZenQuoteResponse {
	q: string
	a: string
}

export const app = new Hono<{ Bindings: Env }>()

app.get('/api/', (c) => {
	return c.json({
		name: 'Cloudflare (with Hono)',
	})
})

app.get('/api/quote', async (c) => {
	try {
		// Try to get quote from KV
		const cachedQuote = await c.env.rustyberry_kv.get('daily_quote_current')

		if (cachedQuote) {
			return c.json(
				JSON.parse(cachedQuote) as { quote: string; author: string },
			)
		}

		// If no cached quote, fetch and store (first run fallback)
		const response = await fetch('https://zenquotes.io/api/today')
		const data = (await response.json()) as ZenQuoteResponse[]

		if (data?.[0]) {
			const quote = {
				quote: data[0].q,
				author: data[0].a,
			}

			// Store in KV
			await c.env.rustyberry_kv.put(
				'daily_quote_current',
				JSON.stringify(quote),
			)

			return c.json(quote)
		}

		// Fallback if API fails
		return c.json({
			quote: 'The only way to do great work is to love what you do.',
			author: 'Steve Jobs',
		})
	} catch (error) {
		console.error('Error fetching quote:', error)
		// Fallback quote
		return c.json({
			quote: 'The only way to do great work is to love what you do.',
			author: 'Steve Jobs',
		})
	}
})
