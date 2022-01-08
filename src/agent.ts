import { 
  BlockEvent, 
  Finding, 
  HandleBlock, 
  HandleTransaction, 
  TransactionEvent, 
  FindingSeverity, 
  FindingType,
  getEthersProvider
} from 'forta-agent'

import {
  ZERO_ADDRESS,
  ERC721_INTERFACE_ID,
  TRANSFER_EVENT,
  APPROVE_EVENT,
  APPROVEAL_FOR_ALL_EVENT
} from './constants'

import { ethers } from 'ethers'
import ERC721_ABI from "./ERC721_ABI.json";

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  const findings: Finding[] = []
  let contract: ethers.Contract;
  const to: string = txEvent.to as string

  try {
    
    contract = new ethers.Contract(to, ERC721_ABI, getEthersProvider())
    let isNFT = await contract.supportsInterface(ERC721_INTERFACE_ID)
    if (!isNFT){
        throw 'not an ERC721 contract!'
    }

  } catch (err){
    console.log(err)
    return findings
  }

  // get all transfer and approve events 
  const txnSender = txEvent.from

  const transfers = txEvent.filterLog(TRANSFER_EVENT, contract.address);

  let approvals = txEvent.filterLog(APPROVE_EVENT, contract.address);
  const approvalForAlls = txEvent.filterLog(APPROVEAL_FOR_ALL_EVENT, contract.address)
  approvals.concat(approvalForAlls)

  // check transfer events for mismatched txn sender and transferFrom address
  for (let transfer of transfers){
    const transferFromAddress = transfer.args.from
    // ignore mint transactions which by default have mismatched transferFrom and txn sender addresses
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

   // Method #2 if an NFT was minted and approved for re-transfer at the same time 

  for (let approve of approvals){
    const currentNFTOwner = approve.args.owner
    const approvedAddress= approve.args.approved
    
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



  // Method #3 look at previous transactions for analysis 

  return findings
}



export default {
  handleTransaction
}