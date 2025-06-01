import type { Env } from '@/server/worker-env'
import type { User } from '@/shared/types'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export interface Context {
	env: Env
	request: Request
	headers: Headers
	user?: User | null
}

export const createContext = async ({
	req,
	env,
}: FetchCreateContextFnOptions & { env: Env }): Promise<Context> => {
	return {
		env,
		request: req,
		headers: req.headers,
	}
}
