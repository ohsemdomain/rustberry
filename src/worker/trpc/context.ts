import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { User } from '~/auth/types'
import type { Env } from '~/worker-env'

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
