import { 
    Finding, 
    HandleTransaction, 
    TransactionEvent, 
    FindingSeverity, 
    FindingType,
  } from 'forta-agent'
  
  import {
    APPROVE_EVENT,
    APPROVEAL_FOR_ALL_EVENT,
  } from './constants'

  
  const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = []

    const contractAddress: string = txEvent.to as string
    const txnSender = txEvent.from
  
    // get all approve and approveForAll event logs
    let approvals = txEvent.filterLog(APPROVE_EVENT, contractAddress);
    const approvalForAlls = txEvent.filterLog(APPROVEAL_FOR_ALL_EVENT, contractAddress)
    approvals.concat(approvalForAlls)
  
    for (let approve of approvals){
      // get the current owner of an NFT 
      const currentNFTOwner = approve.args.owner

      // get the address approved to transfer the NFT
      const approvedAddress= approve.args.approved

      // check if the txn sender is not the current NFT owner and if the txn sender is approving themselves to transfer another person's NFT
      if (currentNFTOwner != txnSender && approvedAddress == txnSender){
          findings.push(Finding.fromObject({
            name: "Sleeping Minted an NFT",
            description: `An NFT was approved for ${txnSender} but owned by ${currentNFTOwner}.`,
            alertId: "SLEEPMINT-2",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious
          })) 
      }   
  }
    
  return findings
 }
  
  
  export default {
    handleTransaction 
  }