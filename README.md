# NFT Sleep Minting Agent

## Description

This agent detects transactions that may indicate NFT sleep minting.

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- SLEEPMINT-1
  - Fired when a transaction consumes more gas than 1,000,000 gas
  - Severity is always set to "medium" (mention any conditions where it could be something else)
  - Type is always set to "suspicious" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

- SLEEPMINT-2
  - Fired when

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e
- 0x0 (on Rinkeby Testnet)
