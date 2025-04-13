import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { rentReceiptPokaYoke } from './rentReceiptCalculation'
import { Logger } from './services/logger'
import { DB } from './services/db'
import { ManualActionWorkflow } from './services/manualActionWorkflow'

describe('Rent Receipt Calculation', () => {
  const loggerMock = {
    error: vi.fn()
  }

  const dbMock = {
    getDBrentReceipt: vi.fn()
  }
  const manualActionWorkflowMock = {
    askForManualActionWorkflow: vi.fn()
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Return true when the receipt is valid', async () => {
    const receipt = {
      id: 1,
      tenantName: 'John Doe',
      lines: [
        { type: 'Rent', description: 'Loyer brut', amount: 900 },
        { type: 'Utilities', description: 'Charges locatives', amount: 150 }
      ],
      date: '2023-10-01',
      yearToDateAmount: 12000
    }

    dbMock.getDBrentReceipt.mockResolvedValue(receipt)

    const result = await rentReceiptPokaYoke(1).pipe(
      T.provideService(Logger, loggerMock),
      T.provideService(DB, dbMock as { getDBrentReceipt: typeof dbMock.getDBrentReceipt }),
      T.provideService(
        ManualActionWorkflow,
        manualActionWorkflowMock as {
          askForManualActionWorkflow: typeof manualActionWorkflowMock.askForManualActionWorkflow
        }
      ),
      T.runPromise
    )

    expect(result).toBe(true)
  })

  it('Call askForManualActionWorkflow when the total amount is too high', async () => {
    const receipt = {
      id: 1,
      tenantName: 'John Doe',
      lines: [
        { type: 'Rent', description: 'Loyer brut', amount: 900 },
        { type: 'Utilities', description: 'Charges locatives', amount: 3000 }
      ],
      date: '2023-10-01',
      yearToDateAmount: 12000
    }

    dbMock.getDBrentReceipt.mockResolvedValue(receipt)

    const result = await rentReceiptPokaYoke(1).pipe(
      T.provideService(Logger, loggerMock),
      T.provideService(DB, dbMock as { getDBrentReceipt: typeof dbMock.getDBrentReceipt }),
      T.provideService(
        ManualActionWorkflow,
        manualActionWorkflowMock as {
          askForManualActionWorkflow: typeof manualActionWorkflowMock.askForManualActionWorkflow
        }
      ),
      T.runPromise
    )

    expect(result).toBe(false)
    expect(manualActionWorkflowMock.askForManualActionWorkflow).toHaveBeenCalledWith({
      type: 'receipt',
      objectId: 1,
      message: 'check_total_amount'
    })
  })
  it('Call askForManualActionWorkflow when there are forbidden lines', async () => {
    const receipt = {
      id: 1,
      tenantName: 'John Doe',
      lines: [
        { type: 'Rent', description: 'Loyer brut', amount: 900 },
        { type: 'Utilities', description: 'Charges locatives', amount: 150 },
        { type: 'FinanceCharge', description: 'Frais financiers', amount: 100 }
      ],
      date: '2023-10-01',
      yearToDateAmount: 12000
    }

    dbMock.getDBrentReceipt.mockResolvedValue(receipt)

    await rentReceiptPokaYoke(1).pipe(
      T.provideService(Logger, loggerMock),
      T.provideService(DB, dbMock as { getDBrentReceipt: typeof dbMock.getDBrentReceipt }),
      T.provideService(
        ManualActionWorkflow,
        manualActionWorkflowMock as {
          askForManualActionWorkflow: typeof manualActionWorkflowMock.askForManualActionWorkflow
        }
      ),
      T.runPromiseExit
    )

    expect(manualActionWorkflowMock.askForManualActionWorkflow).toHaveBeenCalledWith({
      type: 'receipt',
      objectId: 1,
      message: 'check_lines'
    })
  })
})
