// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Voting
{
    address public chairperson;
    uint public votingEndTime;



    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only the chairperson can perform this action.");
        _;
    }
    modifier votingPeriod(){
        require(block.timestamp < votingEndTime, "Voting period is not over.");
        _;
    }



    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
        address delegate;
        uint numDelegationsRecieved;
    }
    struct Proposal {
        string name;
        uint voteCount;
    }



    mapping(address => Voter) public voters;
    Proposal[] public proposals;



    event VoterRegistered(address indexed voterAddress);
    event ProposalAdded(uint indexed proposalId, string indexed name);
    event VoteCast(address indexed voterAddress, uint indexed proposalId);
    event VoteDelegated(address indexed from, address indexed to);



    constructor()
    {
        chairperson = msg.sender;
        votingEndTime = block.timestamp + 1 weeks;
    }



    function registerVoter(address _voterAddress) public onlyChairperson {

        require(!voters[_voterAddress].isRegistered, "Voter is already registered.");

        voters[_voterAddress].isRegistered = true;
        voters[_voterAddress].hasVoted = false;
        voters[_voterAddress].delegate = address(0);
        voters[_voterAddress].numDelegationsRecieved = 0;

        emit VoterRegistered(_voterAddress);

    }


    function addProposal(string memory _name) public onlyChairperson {

        require(bytes(_name).length > 0, "Proposal Name in input is empty.");
        proposals.push(Proposal(_name, 0));
        emit ProposalAdded( proposals.length - 1, _name );

    }

    
    function delegate(address _to) public votingPeriod{

        require(voters[msg.sender].isRegistered, "You are not a registered voter.");
        require(!voters[msg.sender].hasVoted,"You already voted or delegated for this proposal.");

        require(_to != msg.sender , "Cannot Delegate to Self.");
        require(voters[_to].isRegistered, "Cannot delegate to unregistered address.");
        require(!voters[_to].hasVoted,"Cannot delegate because the address has voted or delegated already.");

        voters[msg.sender].delegate = _to;
        voters[msg.sender].hasVoted = true;

        voters[_to].numDelegationsRecieved++;

        emit VoteDelegated( msg.sender,  _to);

    }


    function vote(uint _proposalId ) public votingPeriod{

        require(voters[msg.sender].isRegistered, "You are not a registered voter.");
        require(!voters[msg.sender].hasVoted,"You already voted or delegated for this proposal.");
        require(voters[msg.sender].delegate == address(0), "You have delegated your vote. Your delegate must vote.");
        require(_proposalId < proposals.length,"Invalid Proposal id.");

        uint totalVoteWeight = 1+ voters[msg.sender].numDelegationsRecieved;

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId  = _proposalId;

        proposals[_proposalId].voteCount+= totalVoteWeight;

        emit VoteCast(msg.sender, _proposalId);

    }

    function getWinner() public view returns (string memory winner, uint winnerVoteCount) {
        require(proposals.length > 0, "No Proposals in memory.");
        require(block.timestamp >= votingEndTime, "Voting period is not over.");
        
        uint winnerProposalId = 0;

        if(proposals.length > 0) winnerVoteCount = proposals[0].voteCount;
        else winnerVoteCount = 0;

        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winnerVoteCount) {
                winnerVoteCount= proposals[p].voteCount;
                winnerVoteCount = p;
            }
        }

        if (winnerVoteCount == 0 && proposals.length > 0) {
        return (proposals[winnerProposalId].name, winnerVoteCount);
        }
    
        winner = proposals[winnerProposalId].name;

    }



}