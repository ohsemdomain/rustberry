import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Env } from '../index'

export interface Context {
	env: Env
	request: Request
	headers: Headers
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
