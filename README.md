# ODEM

## Introduction

The *ODEM* Crowdsale is an ICO based on *Ethereum* smart contracts written in the *Solidity* programming language, starting in the middle of February 2018.

Prior to deploying this project onto the Ethereum main network, extensive code tests and several code audits were performed on the involved smart contracts.

### Version notes

* Commit id of deployment:   ``42b9404431be3da972bc9b671a3b8546cdc36f81``
  from Feb 3, 2018, 16:42
* [Deployed Crowdsale](https://etherscan.io/address/0x607646f9ad1925c1839f0cf77fd0bcf27e0e2994 "Deployed Crowdsale")
* [Deployed Token](https://etherscan.io/address/0xbf52f2ab39e26e0951d2a02b49b7702abe30406a "Deployed Token")
* [Deployed Whitelist](https://etherscan.io/address/0x52fcc1cb912c18008823841336ae24186ff5b6aa "Deployed Whitelist")

## Functionality

### Pre-Crowdsale

During initialization, i.e. deployment, of an *ODEMCrowdsale* instance, a paused *ODEMToken* instance will be created, and the following state variables will be stored:

-  start and end time of crowdsale period
-  wallet and rewardWallet addresses
-  address of prior to this created *Whitelist* instance
-  address of newly created *ODEMToken* instance
-  (tokens per wei) rate

The rate can be changed by the owner at any later point in time, the other state variables not.

Until the start of crowdsale the owner may mint tokens (with respect to the given cap) for the benefit of private investors.

### First Hour of Crowdsale

Within the first hour after the start of crowdsale regular investors can buy a per investor limited amount of tokens for themselves.

Investors must be whitelisted prior to be able to purchase tokens. The whitelisting of an account can be done and undone at any point in time.

### Remaining Duration of Crowdsale

Investors can buy tokens for themselves as long as the cap of total available tokens is not reached.

Investors must be whitelisted prior to be able to purchase tokens. The whitelisting of an account can be done and undone at any point in time.

### End of Crowdsale

The crowdsale ends if either the crowdsale period elapsed or all available tokens were sold to investors.

In the latter case the crowdsale will end before its predefined end time.

### Finalization

After end of crowdsale it has to be finalized manually by the owner.

The *ODEMToken* instance will be unpaused, so that tokens become free tradable/transferable.

### Audit

[PDF Version](audit/ODEM_Audit.pdf "PDF Version")


