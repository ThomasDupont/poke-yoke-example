export type ReceiptLineType =
  | 'Rent'
  | 'Maintenance'
  | 'Utilities'
  | 'PropertyTax'
  | 'Insurance'
  | 'LateFee'
  | 'Deposit'
  | 'Adjustment'
  | 'Refund'
  | 'Credit'
  | 'FinanceCharge'
  | 'LegalFee'
  | 'Miscellaneous'

export const rentReceiptAutorizedTypes: ReceiptLineType[] = [
  'Rent',
  'Maintenance',
  'Utilities',
  'PropertyTax', // ordures ménagère
  'Insurance',
  'LateFee',
  'Deposit'
] as const

export type RentReceipt = {
  id: number
  tenantName: string
  lines: Array<{
    type: ReceiptLineType
    description: string
    amount: number
  }>
  date: string
  yearToDateAmount: number
}

export type ManualAction = {
  type: 'receipt'
  objectId: number
  message: string
}
