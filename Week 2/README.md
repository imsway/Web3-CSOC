# Decentralized Voting System Smart Contract

This smart contract implements a decentralized voting system on the Ethereum blockchain, allowing for secure and transparent voting processes with delegation capabilities.

## Features

- **Chairperson Management**: A designated chairperson controls the voting process
- **Voter Registration**: Only registered voters can participate
- **Proposal Management**: Chairperson can add proposals to the ballot
- **Vote Delegation**: Voters can delegate their voting power to other registered voters
- **Weighted Voting**: Votes are weighted based on delegations received
- **Time-Limited Voting**: Voting period is set to 1 week from contract deployment
- **Event Logging**: Comprehensive event emission for tracking all actions

## Video Implementation of the DApp

- https://drive.google.com/file/d/1An2E2bJjQbq-0gbF97tdY8ek4rAawMHU/view?usp=drive_link

## Technical Implementation

### Contract Structure

The contract is built using Solidity version 0.8.30 and implements the following key components:

#### Data Structures
- `Voter`: Stores voter information including registration status, voting status, and delegation details
- `Proposal`: Contains proposal name and vote count

#### State Variables
- `chairperson`: Address of the contract administrator
- `votingEndTime`: Timestamp when voting period ends
- `voters`: Mapping of addresses to Voter structs
- `proposals`: Array of Proposal structs

#### Modifiers
- `onlyChairperson`: Restricts access to chairperson-only functions
- `votingPeriod`: Ensures actions are performed within the voting period

### Key Functions

1. **Constructor**
   - Sets the deployer as chairperson
   - Initializes voting period to 1 week

2. **registerVoter(address _voterAddress)**
   - Chairperson-only function
   - Registers new voters
   - Emits VoterRegistered event

3. **addProposal(string memory _name)**
   - Chairperson-only function
   - Adds new proposals to the ballot
   - Emits ProposalAdded event

4. **delegate(address _to)**
   - Allows voters to delegate their voting power
   - Includes checks for self-delegation and delegation to unregistered voters
   - Emits VoteDelegated event

5. **vote(uint _proposalId)**
   - Records votes for proposals
   - Includes weighted voting based on delegations
   - Emits VoteCast event

6. **getWinner()**
   - Returns the winning proposal and vote count
   - Only callable after voting period ends

### Security Features

- Access control through modifiers
- Prevention of double voting
- Validation of proposal IDs
- Checks for self-delegation
- Time-based voting restrictions

### Events

The contract emits the following events for tracking:
- `VoterRegistered`: When a new voter is registered
- `ProposalAdded`: When a new proposal is added
- `VoteCast`: When a vote is cast
- `VoteDelegated`: When voting power is delegated

## Usage

1. Deploy the contract (deployer becomes chairperson)
2. Chairperson registers voters
3. Chairperson adds proposals
4. Voters can either vote directly or delegate their voting power
5. After the voting period ends, anyone can call getWinner() to determine the winning proposal

## Testing

To test the contract:
1. Deploy to a test network
2. Register test voters
3. Add test proposals
4. Simulate voting and delegation scenarios
5. Verify the winner calculation

## Resources

- [Solidity by Example](https://solidity-by-example.org/) - A comprehensive collection of Solidity examples and patterns
- [Cyfrin Updraft's Solidity Course](https://updraft.cyfrin.io/courses/solidity) - A thorough knowledge base for begineers of Solidity Smart Contract Development

This project is licensed under the MIT License - see the SPDX-License-Identifier in the contract file for details. 
