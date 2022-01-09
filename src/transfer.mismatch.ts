import { 
    Finding, 
    HandleTransaction, 
    TransactionEvent, 
    FindingSeverity, 
    FindingType,
  } from 'forta-agent'
  
  import {
    ZERO_ADDRESS,
    TRANSFER_EVENT,
  } from './constants'
  
  
  const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = []

    const contractAddress: string = txEvent.to as string
    const txnSender = txEvent.from
  
    // get all transfer events from the NFT transaction
    const transfers = txEvent.filterLog(TRANSFER_EVENT, contractAddress);
  
    for (let transfer of transfers){
      
      // store the transferFrom address that was emitted in the event log
      const transferFromAddress = transfer.args.from
      
      // ignore mint transfer events which by default have mismatched transferFrom and txn sender addresses
      if (transferFromAddress != txnSender && transferFromAddress != ZERO_ADDRESS){
        findings.push(Finding.fromObject({
          name: "Sleeping Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${transferFromAddress}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Unknown,
          type: FindingType.Suspicious
        }))
      }
    }
  
    return findings
  }
  
  
  export default {
    handleTransaction
  }