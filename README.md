# NFT Sleep Minting Agent

## Description

A Forta Agent to detect transactions that may indicate NFT sleep minting.
Sleep Minting is when an attacker mints an NFT directly to a famous creator's wallet with permissions to reclaim or pull the NFT back out of the creator's wallet. This creates the appearance that (1) a famous creator minted an NFT to themselves, and (2) the creator sent that NFT to an attacker. Based on “on-chain” provenance, the attacker can claim they own an NFT created by a famous artist and sell it for a high value.

Documentation for how to build your own Forta Agent can be found [here](https://docs.forta.network/en/latest/)

## Install

- ```git clone https://github.com/a16z/nft-forta-agent.git```
- ```cd nft-forta-agent```
- ```npm install .```


## Supported Chains

- Ethereum

## Alerts

- SLEEPMINT-1
  - Fired when an NFT is transferred by an address that is not the owner of the NFT.
      - i.e., the transaction sender != the transferFrom argument in an emitted Transfer() event 
  - Severity is always set to "info" 
      - This type of transfer may be OK. There are cases where an address is approved to transfer an NFT on another person's behalf.
  - Type is always set to "suspicious"

- SLEEPMINT-2
  - Fired when an NFT is minted to an address that is not the same as the mint transaction sender.
  - Severity is always set to "info"
  - Type is always set to "suspicious"
    - This might not always be malicious. For example, this alert may fire if there is an airdrop and NFTs are minted directly to airdrop receivers.
  
- SLEEPMINT-3
  - Fired when there is an NFT approval where the address that sent the approval transaction is different from the current NFT owner. This would be malicious if someone mints an NFT to a famous artist but maintains the permissions to pull that NFT back out of the famous artist's wallet.
  - Severity is always set to "medium."
  - Type is always set to "suspicious."


## Test Data

Create a file named ```forta.config.json``` in the root of the project directory that contains your own RPC endpoint from [Alchemy](https://www.alchemy.com/). See the example below. Note, use an appropriate endpoint for the chain you are looking to test. For example, use a Rinkeby endpoint to test a Rinkeby transaction hash or a Mainnet endpoint to test a Mainnet transaction hash. 
```
{
    "jsonRpcUrl": YOUR_RPC_ENDPOINT_HERE
}
```

The agent behavior can be verified with the following transactions:

- SLEEPMINT-1 (Mainnet): 0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e
- SLEEPMINT-2 (Mainnet): 0x6f62e6ae6db13d9bf3decf31654bc84c2a49df3330f5ca64a28dd0706aeb7908
- SLEEPMINT-1 (Rinkeby): 0x3fdd4435c13672803490eb424ca93094b461ae754bd152714d5b5f58381ccd4b
- SLEEPMINT-2 & SLEEPMINT-3 (Rinkeby): 0x53aa1bd7fa298fa1b96eeed2a4664db8934e27cd28ac0001a5bf5fa3b30c6360

To test a transaction hash run the command: ```npm run tx <TRANSACTION HASH>```. For example,
```
npm run tx 0x57f23fde8e4221174cfb1baf68a87858167fec228d9b32952532e40c367ef04e
```

## More

Here is the smart contract that sleep minted Beeple's "First 5000 Days" NFT: https://etherscan.io/address/0x5fbbacf00ef20193a301a5ba20acf04765fb6dac


## Disclaimer
_This agent code is being provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the agent code. The agent code has not been audited and as such there can be no assurance it will work as intended, and users may experience delays, failures, errors, omissions or loss of transmitted information. THE AGENT CODE CONTAINED HEREIN ARE FURNISHED AS IS, WHERE IS, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTY OF MERCHANTABILITY, NON- INFRINGEMENT OR FITNESS FOR ANY PARTICULAR PURPOSE. Further, use of any of this agent code may be restricted or prohibited under applicable law, including securities laws, and it is therefore strongly advised for you to contact a reputable attorney in any jurisdiction where this agent code may be accessible for any questions or concerns with respect thereto. Further, no information provided in this repo should be construed as investment advice or legal advice for any particular facts or circumstances, and is not meant to replace competent counsel. a16z is not liable for any use of the foregoing, and users should proceed with caution and use at their own risk. See a16z.com/disclosures for more info._
