// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; 
import "hardhat/console.sol"; // For debugging


// Ownable helps manage ownership of the contract, useful for functions only the owner (you) should call.
import "@openzeppelin/contracts/access/Ownable.sol";


contract Unlockable is Ownable { // "is Ownable" means our contract inherits features from Ownable.

    struct LockableItem {
        uint id;                
        address payable publisher; 
        string title;            
        string description;
        uint price;
        bool exists;             
    }

    
    uint public nextItemId; 

    // This one maps an item ID (uint) to its LockableItem struct.
    mapping(uint => LockableItem) public items;
    // Outer mapping: user's address => Inner mapping: item ID => boolean (true if purchased)
    mapping(address => mapping(uint => bool)) public purchasedAccess;

    uint256 public platformFeePercent; // The percentage fee the platform takes (e.g., 5 for 5%)

    event ItemListed(
        uint indexed id,
        address indexed publisher,
        string title,
        uint price
    );

    event ItemPurchased(
        uint indexed id,
        address indexed buyer,
        address indexed publisher,
        uint pricePaid,
        uint platformFee
    );

    event PlatformFeeUpdated(uint256 newFeePercent);
    // The Ownable contract already has an OwnershipTransferred event

    constructor(
        uint256 _initialPlatformFeePercent,
        address _initialFeeRecipient
    ) Ownable(_initialFeeRecipient) {
        require(_initialPlatformFeePercent <= 100, "Fee cannot exceed 100%");
        platformFeePercent = _initialPlatformFeePercent;
        require(
            _initialFeeRecipient != address(0),
            "Initial fee recipient cannot be zero address"
        );
    }

    // Function for Publisher to List Items
    function listItem(string calldata _title, string calldata _description, uint _price) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        uint currentId = nextItemId; 
        items[currentId] = LockableItem({ 
            id: currentId,
            publisher: payable(msg.sender), 
            title: _title,
            description: _description,
            price: _price,
            exists: true
        });

        emit ItemListed(currentId, msg.sender, _title, _price); // Announce that an item was listed
        nextItemId++; 
    }

    // Function for a buyer to purchase an item. 'payable' means this function can receive ETH.
    function purchaseItem(uint _itemId) public payable {
        LockableItem storage item = items[_itemId]; 
        require(item.exists, "Item does not exist");
        require(msg.value == item.price, "Incorrect ETH amount sent");
        require(!purchasedAccess[msg.sender][_itemId], "Already purchased");

        uint256 feeAmount = (msg.value * platformFeePercent) / 100;
        uint256 publisherAmount = msg.value - feeAmount;

        (bool successPublisher, ) = item.publisher.call{value: publisherAmount}("");
        require(successPublisher, "Failed to send funds to publisher");

        if (feeAmount > 0) {
            (bool successOwner, ) = owner().call{value: feeAmount}(""); 
            require(successOwner, "Failed to send funds to platform owner");
        }

        purchasedAccess[msg.sender][_itemId] = true; 
        emit ItemPurchased(_itemId, msg.sender, item.publisher, msg.value, feeAmount); 
    }

    // View function to check if a user has purchased an item.
    function hasAccess(address _user, uint _itemId) public view returns (bool) {
        return purchasedAccess[_user][_itemId];
    }

    // View function to get all listed item IDs.
    function getAllItemIds() public view returns (uint[] memory) {
        uint count = 0;
        for(uint i = 0; i < nextItemId; i++){
            if(items[i].exists) { 
                count++;
            }
        }

        uint[] memory activeIds = new uint[](count); 
        uint j = 0; 
        for(uint i = 0; i < nextItemId; i++){
            if(items[i].exists) {
                activeIds[j] = i;
                j++;
            }
        }
        return activeIds;
    }

    // --- Owner-only Functions ---
    // 'onlyOwner' is a modifier from Ownable.sol that adds this restriction.

    function setPlatformFeePercent(uint256 _newFeePercent) public onlyOwner {
        console.log("Setting new platform fee percent to: %s", _newFeePercent);
        require(_newFeePercent <= 100, "Fee cannot exceed 100%");
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(_newFeePercent);
    }

    // The contract owner (fee recipient) can be changed by the current owner
    // by calling 'transferOwnership(newOwnerAddress)' which is inherited from Ownable.sol.
}