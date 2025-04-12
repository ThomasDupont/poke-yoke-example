import { Effect as T } from 'effect'
import { DB } from './services/db'
import { Logger } from './services/logger'
import { RentReceiptCalculationError } from './error'
import { rentReceiptAutorizedTypes, RentReceipt } from './types'
import { ManualActionWorkflow } from './services/manualActionWorkflow'

const YEARLY_HUGE_AMOUNT_RULE = 0.3

const checkTotalAmount = (receipt: RentReceipt) => {
  const totalAmount = receipt.lines.reduce((total, line) => (total += line.amount), 0)

  if (totalAmount > receipt.yearToDateAmount * YEARLY_HUGE_AMOUNT_RULE) {
    return T.fail(
      new RentReceiptCalculationError({
        id: receipt.id,
        action: 'check_total_amount',
        message: `Possible incoherent amount on ${receipt.id}, 
          amount: ${totalAmount}, yearToDateAmount: ${receipt.yearToDateAmount}`
      })
    )
  }

  return T.succeed(receipt)
}

const checkIncoherentLines = (receipt: RentReceipt) => {
  const forbiddenLines = receipt.lines.filter(
    line => !rentReceiptAutorizedTypes.includes(line.type)
  )

  if (forbiddenLines.length > 0) {
    return T.fail(
      new RentReceiptCalculationError({
        id: receipt.id,
        action: 'check_lines',
        message: `Forbidden lines found on ${receipt.id}: ${forbiddenLines.map(line => line.type).join(', ')}`
      })
    )
  }

  return T.succeed(receipt)
}

export const rentReceiptPokaYoke = (
  receiptId: number
): T.Effect<boolean, never, DB | Logger | ManualActionWorkflow> =>
  T.gen(function* () {
    const db = yield* DB
    const logger = yield* Logger
    const workflowAction = yield* ManualActionWorkflow

    return T.tryPromise({
      try: () => db.getDBrentReceipt(receiptId),
      catch: error =>
        new RentReceiptCalculationError({
          id: receiptId,
          message: `Error fetching rent receipt`,
          detailedError: error
        })
    }).pipe(
      T.flatMap(checkTotalAmount),
      T.flatMap(checkIncoherentLines),
      T.match({
        onSuccess: () => true,
        onFailure: ({ detailedError, message, action, id }) => {
          logger.error(`Error in rent receipt calculation: ${message}`, {
            detailedError
          })

          if (action) {
            workflowAction.askForManualActionWorkflow({
              type: 'receipt',
              objectId: id,
              message: action
            })
          }

          return false
        }
      })
    )
  }).pipe(T.flatten)
