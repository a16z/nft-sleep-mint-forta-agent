import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
  getEthersProvider
} from 'forta-agent'

import transferMismatch from './transfer.mismatch'
import approveMismatch from './approve.mismatch'

import {
  ERC721_INTERFACE_ID,
} from './constants'

import { ethers, Contract } from 'ethers'
import ERC721_ABI from "./ERC721_ABI.json";

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  let findings: Finding[] = []

  const to: string = txEvent.to as string
  let contract: Contract = new ethers.Contract(to, ERC721_ABI, getEthersProvider())

  let isNFT = await contract.supportsInterface(ERC721_INTERFACE_ID).catch((error: Error) => {
    // contract does not support ERC-165 interface if this fails so return empty findings
    console.log(error)
    return findings
  })

  // check to see if the contract support ERC-721
  if (!isNFT){
    return findings
  }

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