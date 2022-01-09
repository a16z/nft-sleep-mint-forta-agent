import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent
} from "forta-agent"
import agent from "./agent"

import {ethers} from 'ethers';

describe("NFT Sleep agent", () => {
  let handleTransaction: HandleTransaction

  let abiCoder: ethers.utils.AbiCoder
  let transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  let approveTopic = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

  let txnSender = "0x87F6cA7862feA6411de6c0aFc1b4b23DD802bf00"
  let famousArtist = "0xc6b0562605D35eE710138402B878ffe6F2E23807"
  let thirdParty = "0xd8dB81216D8cf1236d36B4A1c328Fbd5CB2bD1e7"
  let NFTContractAddress = "0x5fbbacf00ef20193a301a5ba20acf04765fb6dac"

  const createTxEvent = (from:string, to:string, logs: any) => createTransactionEvent({
    transaction: {from, to} as any,
    receipt: { logs } as any,
    block: {} as any,
  })


  const createLog = (address: string, topics: string[]) => {
    return {
      address: address,
      topics: topics,
      data: '0x',
      logIndex: 123,
      blockNumber: 12170189,
      blockHash: '0xbc94a2ea5b539dfd5115748137d2bab00a76f6e178f3eeb6ba225b26ed9288c4',
      transactionIndex: 161,
      transactionHash: '0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e',
      removed: false
    }
  }

  beforeAll(() => {
    handleTransaction = agent.handleTransaction
    abiCoder = new ethers.utils.AbiCoder()
  })

  describe("handleTransaction", () => {

    it("returns a finding of a transfer mismatch", async () => {

      // create fake transfer event 
      const txEvent = createTxEvent(
        txnSender,
        NFTContractAddress,
        [
          createLog(
            NFTContractAddress,
            [
              transferTopic,
              abiCoder.encode(["address"],[famousArtist]),
              abiCoder.encode(["address"],[thirdParty]),
              abiCoder.encode(["uint256"],[1])
            ]
          )
        ]
      )

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Sleeping Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${famousArtist}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Unknown,
          type: FindingType.Suspicious
          }),
      ])
    })


    it("returns a finding of a approva mismatch", async () => {

      // create fake approve event 
      const txEvent = createTxEvent(
        txnSender,
        NFTContractAddress,
        [
          createLog(
            NFTContractAddress,
            [
              approveTopic,
              abiCoder.encode(["address"],[famousArtist]),
              abiCoder.encode(["address"],[txnSender]),
              abiCoder.encode(["uint256"],[1])
            ])
        ]
      )

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Sleeping Minted an NFT",
          description: `An NFT was approved for ${txnSender} but owned by ${famousArtist}.`,
          alertId: "SLEEPMINT-2",
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious
          }),
      ])
    })



    it("returns no finding if actual owner transfer the NFT", async () => {

      // create honest approve event 
      const txEvent = createTxEvent(
        famousArtist,
        NFTContractAddress,
        [
          createLog(
            NFTContractAddress,
            [
              transferTopic,
              abiCoder.encode(["address"],[famousArtist]),
              abiCoder.encode(["address"],[thirdParty]),
              abiCoder.encode(["uint256"],[1])
            ])
        ]
      )

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([])

    })


    it("returns no finding if actual owner approves another person to transfer the NFT", async () => {

      // create honest approve event 
      const txEvent = createTxEvent(
        famousArtist,
        NFTContractAddress,
        [
          createLog(
            NFTContractAddress,
            [
              approveTopic,
              abiCoder.encode(["address"],[famousArtist]),
              abiCoder.encode(["address"],[thirdParty]),
              abiCoder.encode(["uint256"],[1])
            ])
        ]
      )

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([])
    })








  })
})
