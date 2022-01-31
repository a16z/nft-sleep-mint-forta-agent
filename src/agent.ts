import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent
} from 'forta-agent'

import transferMismatch from './transfer.mismatch'
import approveMismatch from './approve.mismatch'

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  let findings: Finding[] = []

  findings = (
    await Promise.all([
      transferMismatch.handleTransaction(txEvent),
      approveMismatch.handleTransaction(txEvent),
    ])
  ).flat()

  return findings

}


export default {
  handleTransaction
}