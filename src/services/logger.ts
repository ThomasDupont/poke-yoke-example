import { Context } from 'effect'

export class Logger extends Context.Tag('Logger')<
  Logger,
  { error: (message: string, details?: { detailedError?: unknown }) => void }
>() {}
