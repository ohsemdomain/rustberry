import { z } from 'zod'
import { publicProcedure, router } from '../trpc-instance'

export const demoRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.name || 'World'}!`,
				timestamp: new Date().toISOString(),
			}
		}),

	getUser: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(({ input }) => {
			// Example user data
			return {
				id: input.id,
				name: 'John Doe',
				email: 'john@example.com',
			}
		}),

	createPost: publicProcedure
		.input(
			z.object({
				title: z.string().min(1),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			// In a real app, you would save this to a database
			return {
				id: Math.random().toString(36).substring(7),
				...input,
				createdAt: new Date().toISOString(),
			}
		}),
})
