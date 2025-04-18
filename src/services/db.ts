import { Context } from 'effect'
import { RentReceipt } from '../types'

declare const getDBrentReceipt: (id: number) => Promise<RentReceipt>

export class DB extends Context.Tag('DB')<
  DB,
  { readonly getDBrentReceipt: typeof getDBrentReceipt }
>() {}
