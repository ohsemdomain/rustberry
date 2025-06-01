import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Env } from '~/worker-env'
import type { User } from '~/auth/types'

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
