import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  getEthersProvider,
} from "forta-agent"
import agent from "./agent"

import {ethers} from 'ethers';


describe("NFT Sleep agent", () => {

  let handleTransaction: HandleTransaction

  let abiCoder: ethers.utils.AbiCoder

  let transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  let approveTopic = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

  let txnSender = "0x87F6cA7862feA6411de6c0aFc1b4b23DD802bf00".toLowerCase()
  let famousArtist = "0xc6b0562605D35eE710138402B878ffe6F2E23807".toLowerCase()
  let thirdParty = "0xd8dB81216D8cf1236d36B4A1c328Fbd5CB2bD1e7".toLowerCase()
  let NFTContractAddress: string;

  // construct a transaction event for testing with event logs
  const createTxEvent = (from:string, to:string, logs: any) => createTransactionEvent({
    transaction: {from, to} as any,
    receipt: { logs } as any,
    block: {} as any,
  })

  // construct a log object for a transaction event 
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

  beforeAll(async () => {
    handleTransaction = agent.handleTransaction
    abiCoder = new ethers.utils.AbiCoder()
    const provider = new ethers.providers.JsonRpcProvider(getEthersProvider().connection)
    
    // use an NFT contract on correct network to make sure first section of agent passes (checking if ERC-721)
    let networkDetails = await provider.getNetwork()
    NFTContractAddress = networkDetails.chainId === 4 ? "0x23414f4f9cb421b952c9050f961801bb2c8b8d58".toLowerCase() : "0x67D9417C9C3c250f61A83C7e8658daC487B56B09".toLowerCase() 
  

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
          name: "Sleep Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${famousArtist}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Unknown,
          type: FindingType.Suspicious
          }),
      ])
    })


    it("returns a finding of an approva mismatch", async () => {

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
          name: "Sleep Minted an NFT",
          description: `An NFT was approved for ${txnSender}, by ${txnSender}, but owned by ${famousArtist}.`,
          alertId: "SLEEPMINT-2",
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious
          }),
      ])
    })



    it("returns no findings if actual owner transfers the NFT", async () => {

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


    it("returns no findings if actual owner approves another person to transfer the NFT", async () => {

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
