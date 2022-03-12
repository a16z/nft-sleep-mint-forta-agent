import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import { ZERO_ADDRESS, DEAD_ADDRESS, TRANSFER_EVENT } from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  const contractAddress: string = txEvent.to as string;
  const txnSender = txEvent.from.toLowerCase();

  // get all Transfer events from the NFT transaction
  const transfers = txEvent.filterLog([TRANSFER_EVENT], contractAddress);

  for (let transfer of transfers) {
    const eventTransferFromAddress = transfer.args.from.toLowerCase();
    const eventTransferToAddress = transfer.args.to.toLowerCase();

    // is the transaction sender not the owner of the NFT according to the NFT Transfer Event
    let isSenderNotTheOwner = eventTransferFromAddress != txnSender;

    // is the NFT transfer a mint transfer (i.e., initial creation of the NFT from the 0 address)
    let isMint = eventTransferFromAddress == ZERO_ADDRESS;

    // is the NFT transfer a burn transfer (i.e., the NFT is send to the 0 address)
    let isBurn =
      eventTransferToAddress == ZERO_ADDRESS ||
      eventTransferToAddress == DEAD_ADDRESS;

    // is the transaction sender the person receiving the NFT in the transfer (this would be the case when you buy an NFT on OpenSea)
    // add this check to try and reduce agent alerts from common and honest NFT transfers from OpenSea.
    let isSenderAlsoReceiver = eventTransferToAddress == txnSender;

    if (isSenderNotTheOwner && !isMint && !isBurn && !isSenderAlsoReceiver) {
      findings.push(
        Finding.fromObject({
          name: "Sleep Minted an NFT",
          description: `An NFT Transfer was initiated by ${txnSender} to transfer an NFT owned by ${eventTransferFromAddress}. The NFT contract address is ${contractAddress}`,
          alertId: "SLEEPMINT-1",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious,
        })
      );
    }
  }

  return findings;
};

export default {
  handleTransaction,
};
