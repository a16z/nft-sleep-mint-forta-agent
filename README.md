# NFT Sleep Minting Agent

## Description

This agent detects transactions that may indicate NFT sleep minting.
Sleep minting is a technique where someone will Mint an NFT directly to the wallet of a famous artist and then later take that NFT back. This causes NFT marketplaces to show that an NFT was created by a famous artist (as the person who minted it) even though they did not. 

## Supported Chains

- Ethereum

## Alerts

- SLEEPMINT-1
  - Fired when an NFT is transferred by an address that is not the owner of the NFT.
      - i.e., the transaction sender != the transferFrom argument in an emitted Transfer() event 
  - Severity is always set to "info." 
      - This type of transfer may be OK. There are cases where an address is approved to transfer an NFT on another person's behalf.
  - Type is always set to "suspicious."

- SLEEPMINT-2
  - Fired when an NFT is minted to an address that is not the same as the mint transaction sender.
  - Severity is always set to "info."
  - Type is always set to "suspicious."
    - This might not always be malicious such as if there is an airdrop and an artist mints NFTs directly to airdrop receivers. 
  
- SLEEPMINT-3
  - Fired when there is an NFT approval where the address that sent the transaction is different from the current NFT owner.
  - Severity is always set to "medium."
  - Type is always set to "suspicious."


## Test Data

The agent behavior can be verified with the following transactions:

- SLEEPMINT-1 (Mainnet): 0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e
- SLEEPMINT-1 (Rinkeby): 0x3fdd4435c13672803490eb424ca93094b461ae754bd152714d5b5f58381ccd4b
- SLEEPMINT-2 & SLEEPMINT-3 (Rinkeby): 0x53aa1bd7fa298fa1b96eeed2a4664db8934e27cd28ac0001a5bf5fa3b30c6360
