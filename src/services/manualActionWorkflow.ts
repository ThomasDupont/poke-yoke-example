import { Context } from 'effect'
import { ManualAction } from '../types'

declare const askForManualActionWorkflow: (args: ManualAction) => void

export class ManualActionWorkflow extends Context.Tag('ManualActionWorkflow')<
  ManualActionWorkflow,
  { readonly askForManualActionWorkflow: typeof askForManualActionWorkflow }
>() {}
