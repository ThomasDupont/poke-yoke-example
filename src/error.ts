export class RentReceiptCalculationError extends Error {
  id: number
  action?: string
  detailedError?: unknown
  constructor({
    id,
    action,
    message,
    detailedError
  }: {
    id: number
    action?: string
    message: string
    detailedError?: unknown
  }) {
    super(message)
    this.id = id
    this.action = action
    this.detailedError = detailedError
  }
}
