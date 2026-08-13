export type RestErrorKind = 'forbidden' | 'conflict' | 'not_found' | 'validation' | 'server' | 'network'

export class RestError extends Error {
  readonly kind: RestErrorKind
  readonly status: number
  readonly detail?: string

  constructor(kind: RestErrorKind, status: number, message: string, detail?: string) {
    super(message)
    this.name = 'RestError'
    this.kind = kind
    this.status = status
    this.detail = detail
  }
}

interface ProblemBody {
  title?: string
  detail?: string
  status?: number
}

function readProblemBody(data: unknown): ProblemBody {
  if (typeof data === 'object' && data !== null) {
    const body = data as Record<string, unknown>
    return {
      title: typeof body.title === 'string' ? body.title : undefined,
      detail: typeof body.detail === 'string' ? body.detail : undefined,
      status: typeof body.status === 'number' ? body.status : undefined,
    }
  }
  return {}
}

export function mapFetchError(error: unknown): RestError {
  if (error instanceof RestError) {
    return error
  }

  const fetchError = error as {
    status?: number
    statusCode?: number
    data?: unknown
    message?: string
  }

  const status = fetchError.status ?? fetchError.statusCode ?? 0
  const problem = readProblemBody(fetchError.data)
  const detail = problem.detail ?? problem.title
  const message = detail ?? fetchError.message ?? 'Request failed'

  if (status === 403) {
    return new RestError('forbidden', 403, message, detail)
  }
  if (status === 409) {
    return new RestError('conflict', 409, message, detail)
  }
  if (status === 404) {
    return new RestError('not_found', 404, message, detail)
  }
  if (status === 400 || status === 422) {
    return new RestError('validation', status, message, detail)
  }
  if (status >= 500) {
    return new RestError('server', status, message, detail)
  }
  if (status === 0) {
    return new RestError('network', 0, 'Unable to reach the API', detail)
  }

  return new RestError('server', status, message, detail)
}

export function restErrorMessage(error: RestError): string {
  switch (error.kind) {
    case 'forbidden':
      return 'You do not have permission to perform this action.'
    case 'conflict':
      return 'This detection cannot be updated — it may already be handled.'
    case 'not_found':
      return 'Detection not found.'
    case 'validation':
      return error.detail ?? 'The request was invalid.'
    case 'network':
      return 'Unable to reach the API. Check your connection and try again.'
    default:
      return error.detail ?? 'Something went wrong. Try again.'
  }
}
