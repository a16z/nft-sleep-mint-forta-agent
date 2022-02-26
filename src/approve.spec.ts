import {
    FindingType,
    FindingSeverity,
    Finding,
    HandleTransaction,
  } from "forta-agent"
  
  import approveMismatch from './approve.mismatch'
  
  
  describe("NFT Sleep agent", () => {
  
    let handleTransaction: HandleTransaction
    
    // store some addresses to use throughout tests
    let txnSender = "0x87F6cA7862feA6411de6c0aFc1b4b23DD802bf00".toLowerCase()
    let famousArtist = "0xc6b0562605D35eE710138402B878ffe6F2E23807".toLowerCase()
    let thirdParty = "0xd8dB81216D8cf1236d36B4A1c328Fbd5CB2bD1e7".toLowerCase()
  
    const mockTxEvent: any = {
      filterLog: jest.fn(),
      from: txnSender,
      to: "0x23414f4f9cb421b952c9050f961801bb2c8b8d58"
    };
  
  
    beforeAll(async () => {
      handleTransaction = approveMismatch.handleTransaction
    })
  
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });
  
    describe("handleTransaction", () => {
  
      it("returns a finding of an approval mismatch", async () => {
  
        const mockERC721ApproveEvent = {
          args: {
            owner: famousArtist,
            approved: txnSender,
            tokenId: 1,
          },
        };
  
        mockTxEvent.filterLog.mockReturnValueOnce([mockERC721ApproveEvent]);
  
        const findings = await handleTransaction(mockTxEvent)
   
        expect(findings).toStrictEqual([
          Finding.fromObject({
            name: "Sleep Minted an NFT",
            description: `An NFT was approved for ${txnSender}, by ${txnSender}, but owned by ${famousArtist}. The NFT contract address is 0x23414f4f9cb421b952c9050f961801bb2c8b8d58`,
            alertId: "SLEEPMINT-3",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious
           }),
        ])
   
        expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      })

      it("returns a finds if the approval for all event fires", async () => {

        const mockERC721ApproveAllEvent = {
          args: {
            owner: famousArtist,
            operator: txnSender,
            approved: true,
          },
        };
  
        mockTxEvent.filterLog.mockReturnValueOnce([mockERC721ApproveAllEvent]);
  
        const findings = await handleTransaction(mockTxEvent)
   
        expect(findings).toStrictEqual([
            Finding.fromObject({
              name: "Sleep Minted an NFT",
              description: `An NFT was approved for ${txnSender}, by ${txnSender}, but owned by ${famousArtist}. The NFT contract address is 0x23414f4f9cb421b952c9050f961801bb2c8b8d58`,
              alertId: "SLEEPMINT-3",
              severity: FindingSeverity.Medium,
              type: FindingType.Suspicious
             }),
          ])
   
        expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      })  


      it("returns no findings if actual owner approves another person to transfer the NFT", async () => {
        
        const mockERC721ApproveEvent = {
          args: {
            owner: famousArtist,
            approved: thirdParty,
            tokenId: 1,
          },
        };

        mockTxEvent.from = famousArtist
        mockTxEvent.filterLog.mockReturnValueOnce([mockERC721ApproveEvent]);
  
        const findings = await handleTransaction(mockTxEvent)
   
        expect(findings).toStrictEqual([])
   
        expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      })  
  
    })
  })
  