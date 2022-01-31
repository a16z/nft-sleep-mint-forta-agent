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
    const txnSender = txEvent.from.toLowerCase()
  
    // get all transfer events from the NFT transaction
    const transfers = txEvent.filterLog([TRANSFER_EVENT], contractAddress) 

    for (let transfer of transfers){
      
      // store the transferFrom and transferTo address that was emitted in the event log
      const transferFromAddress = transfer.args.from.toLowerCase()
      const transferToAddress = transfer.args.to.toLowerCase()

      // is the transaction sender not the owner of the NFT
      let isSenderNotTheOwner = transferFromAddress != txnSender

      // is the NFT transfer a mint transfer (i.e., initial creation of the NFT from the 0 address)
      let isMint = transferFromAddress == ZERO_ADDRESS

      // is the transaction sender the person receiving the NFT in the transfer (this would be the case when you buy an NFT on OpenSea)
      // add this check to try and reduce agent alerts from common and honest NFT transfers from opensea.
      let isSenderAlsoReceiver = transferToAddress == txnSender

      if (isSenderNotTheOwner && !isMint && !isSenderAlsoReceiver){
        findings.push(Finding.fromObject({
          name: "Sleep Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${transferFromAddress}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious
        }))
      }

      // if the transaction is a MINT but the NFT is minted to an address that is NOT the transaction sender
      // this might not always be malicious in the case of an airdrop where an artist mints directly to receivers of the airdrop
      if (isMint && !isSenderAlsoReceiver){
        findings.push(Finding.fromObject({
          name: "Sleep Minted an NFT",
          description: `An NFT was minted to ${transferToAddress} but the mint transaction was sent by ${txnSender}.`,
          alertId: "SLEEPMINT-2",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious
        }))
      }



    }
  
    return findings
  }
  
  
  export default {
    handleTransaction
  }