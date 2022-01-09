# NFT Sleep Minting Agent

## Description

This agent detects transactions that may indicate NFT sleep minting.

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- SLEEPMINT-1
  - Fired when a transaction consumes more gas than 1,000,000 gas
  - Severity is always set to "unknown". There may cases where a person is approved to transfer an NFT on another person's behalf.
  - Type is always set to "suspicious". There may cases where a person is approved to transfer an NFT on another person's behalf.

- SLEEPMINT-2
  - Fired when there is an approval for transfering an NFT owned by another person and this approval was not initiated by the current NFT owner.
  - Severity is always set to "medium".
  - Type is always set to "suspicious".

## Test Data

The agent behaviour can be verified with the following transactions:

- SLEEPMINT-1: 0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e
- SLEEPMINT-2 (on Rinkeby Testnet): 0x0
