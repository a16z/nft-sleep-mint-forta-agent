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

import { BigNumber } from 'bignumber.js'
import { ethers } from 'ethers'
import ERC721_ABI from "./ERC721_ABI.json";

const ERC721_INTERFACE_ID = 0x5b5e139f
const transferEvent = "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)";
const approveEvent = ""
const mintEvent = ""

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

  const fromAddress = txEvent.from
  const transfers = txEvent.filterLog(transferEvent, contract.address);

  for (let transfer of transfers){
    const transferFromAddress = transfer.args.from

    if (transferFromAddress != fromAddress){
      findings.push(Finding.fromObject({
        name: "Sleeping Minted an NFT",
        description: `An NFT Transfer was initiated by ${fromAddress} to transfer an NFT owned by ${transferFromAddress}`,
        alertId: "SLEEPMINT-1",
        severity: FindingSeverity.Unknown,
        type: FindingType.Suspicious
      }))
    }
  }

  return findings
}


// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

export default {
  handleTransaction,
  // handleBlock
}