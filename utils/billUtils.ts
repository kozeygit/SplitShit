import { Bill, Payer } from "@/models/bill";

export function getPayerById(bill: Bill, payerId: number) : Payer | undefined {
  for (const payer of bill.payers) {
    if (payer.id == payerId) {
      return payer
    }
  }
  return undefined
}