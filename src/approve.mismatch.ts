import { 
    Finding, 
    HandleTransaction, 
    TransactionEvent, 
    FindingSeverity, 
    FindingType,
  } from 'forta-agent'
  
  import {
    APPROVE_EVENT,
    APPROVAL_FOR_ALL_EVENT,
  } from './constants'

  
  const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = []

    const contractAddress: string = txEvent.to as string
    const txnSender = txEvent.from.toLowerCase()
  

    // get all Approval and ApprovalForAll event logs
    let approvals = txEvent.filterLog([APPROVE_EVENT, APPROVAL_FOR_ALL_EVENT], contractAddress) 

    for (let approve of approvals){

      // get the current owner of an NFT 
      const eventCurrentNFTOwner = approve.args.owner.toLowerCase()

      // get the address approved to transfer the NFT
      const eventApprovedAddress = typeof(approve.args.approved) == "boolean"? approve.args.operator.toLowerCase(): approve.args.approved.toLowerCase()
     
      // check if the txn sender is not the current NFT owner
      // check if the txn sender is approving themselves to transfer another person's NFT
      if (eventCurrentNFTOwner != txnSender && eventApprovedAddress == txnSender){
          findings.push(Finding.fromObject({
            name: "Sleep Minted an NFT",
            description: `An NFT was approved for ${txnSender}, by ${txnSender}, but owned by ${eventCurrentNFTOwner}. The NFT contract address is ${contractAddress}`,
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