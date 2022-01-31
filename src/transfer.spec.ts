import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
} from "forta-agent"

import transferMismatch from './transfer.mismatch'

import {
  ZERO_ADDRESS
} from './constants'


describe("NFT Sleep agent", () => {

  let handleTransaction: HandleTransaction

  let txnSender = "0x87F6cA7862feA6411de6c0aFc1b4b23DD802bf00".toLowerCase()
  let famousArtist = "0xc6b0562605D35eE710138402B878ffe6F2E23807".toLowerCase()
  let thirdParty = "0xd8dB81216D8cf1236d36B4A1c328Fbd5CB2bD1e7".toLowerCase()

  const mockTxEvent: any = {
    filterLog: jest.fn(),
    from: txnSender,
    to: "0x23414f4f9cb421b952c9050f961801bb2c8b8d58"
  };


  beforeAll(async () => {
    handleTransaction = transferMismatch.handleTransaction
  })

  beforeEach(() => {
    mockTxEvent.filterLog.mockReset();
  });

  describe("handleTransaction", () => {



    it("returns a finding of a transfer mismatch", async () => {

      // create fake transfer event 
      const mockERC721TransferEvent = {
        args: {
          from: famousArtist,
          to: thirdParty,
          tokenId: 1,
        },
      };
    
      mockTxEvent.filterLog.mockReturnValueOnce([mockERC721TransferEvent]);

      const findings = await handleTransaction(mockTxEvent)

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Sleep Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${famousArtist}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious
          }),
      ])

      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    })



    it("returns a finding of a sleep mint", async () => {

      // create fake transfer event 
      const mockERC721TransferEvent = {
        args: {
          from: ZERO_ADDRESS,
          to: famousArtist,
          tokenId: 1,
        },
      };
    
      mockTxEvent.filterLog.mockReturnValueOnce([mockERC721TransferEvent]);

      const findings = await handleTransaction(mockTxEvent)

      expect(findings).toStrictEqual([
        Finding.fromObject({
            name: "Sleep Minted an NFT",
            description: `An NFT was minted to ${famousArtist} but the mint transaction was sent by ${txnSender}.`,
            alertId: "SLEEPMINT-2",
            severity: FindingSeverity.Info,
            type: FindingType.Suspicious
          }),
      ])

      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
   })


    it("returns a empty finding if actual owner transfers the NFT", async () => {

      // create fake transfer event 
      const mockERC721TransferEvent = {
        args: {
          from: famousArtist,
          to: famousArtist,
          tokenId: 1,
        },
      };
      
      mockTxEvent.from = famousArtist
      mockTxEvent.filterLog.mockReturnValueOnce([mockERC721TransferEvent]);

      const findings = await handleTransaction(mockTxEvent)

      expect(findings).toStrictEqual([])
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    })




    it("returns a empty finding if a person mints an NFT to themself", async () => {

      // create fake transfer event 
      const mockERC721TransferEvent = {
        args: {
          from: ZERO_ADDRESS,
          to: famousArtist,
          tokenId: 1,
        },
      };

      mockTxEvent.from = famousArtist
      mockTxEvent.filterLog.mockReturnValueOnce([mockERC721TransferEvent]);

      const findings = await handleTransaction(mockTxEvent)

      expect(findings).toStrictEqual([])
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    })

  })
})