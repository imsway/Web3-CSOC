import { expect } from "chai";
import { ethers } from "hardhat"; 
import { Unlockable } from "../typechain-types"; 
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"; 

describe("Unlockable Contract Tests", function () {
    let unlockableContract: Unlockable;
    let contractOwner: SignerWithAddress;    
    let publisherAccount: SignerWithAddress; 
    let buyerAccount: SignerWithAddress;     
    let otherAccount: SignerWithAddress;

    const initialPlatformFeePercent = 5n; // 5%

    beforeEach(async function () {
        // Get test accounts provided by Hardhat's local network
        [contractOwner, publisherAccount, buyerAccount, otherAccount] = await ethers.getSigners();

        // Get the contract factory for "Unlockable". A factory is an abstraction to deploy new smart contracts.
        const UnlockableFactory = await ethers.getContractFactory("Unlockable");

        // Deploy a new instance of the Unlockable contract.
        unlockableContract = (await UnlockableFactory.connect(contractOwner).deploy(
            initialPlatformFeePercent,
            contractOwner.address // The deployer (contractOwner) will receive platform fees
        )) as Unlockable;

    });

    // 'it' defines an individual test case.
    it("Should allow a publisher to list an item", async function () {
        const title = "My Awesome Guide";
        const description = "A great guide to blockchain.";
        const price = ethers.parseEther("0.1"); // 'parseEther' converts "0.1" ETH to its WEI equivalent (0.1 * 10^18)

        await expect(unlockableContract.connect(publisherAccount).listItem(title, description, price))
            .to.emit(unlockableContract, "ItemListed")
            .withArgs(0, publisherAccount.address, title, price); // Item ID should be 0 for the first item

        // Verify the item details stored in the contract
        const item = await unlockableContract.items(0); // Call the public getter for items mapping
        expect(item.publisher).to.equal(publisherAccount.address);
        expect(item.title).to.equal(title);
        expect(item.price).to.equal(price);
        expect(item.exists).to.be.true;
        expect(await unlockableContract.nextItemId()).to.equal(1);
    });

    it("Should allow a buyer to purchase an item and distribute funds correctly", async function () {
        const itemTitle = "Test Item for Purchase";
        const itemPrice = ethers.parseEther("1.0"); // 1 ETH for easier fee calculation

        // 1. Publisher lists an item
        await unlockableContract.connect(publisherAccount).listItem(itemTitle, "Desc", itemPrice);
        const itemId = 0;

        // Get initial balances
        const publisherInitialBalance = await ethers.provider.getBalance(publisherAccount.address);
        const ownerInitialBalance = await ethers.provider.getBalance(contractOwner.address);
        const buyerInitialBalance = await ethers.provider.getBalance(buyerAccount.address);


        // 2. Buyer purchases the item
        // Send ETH with the transaction using '{ value: itemPrice }'
        const purchaseTx = await unlockableContract.connect(buyerAccount).purchaseItem(itemId, { value: itemPrice });
        const receipt = await purchaseTx.wait();
        if (!receipt) {
            throw new Error("Transaction receipt is null"); // Should not happen if tx.wait() resolves without error
        }
        const gasUsedByBuyer = receipt.gasUsed * (receipt.gasPrice || 0n); // gasUsed and effectiveGasPrice are bigints

        // 3. Verify fund distribution
        const expectedPlatformFee = itemPrice*(initialPlatformFeePercent)/(100n);
        const expectedPublisherAmount = itemPrice-(expectedPlatformFee);

        expect(await ethers.provider.getBalance(publisherAccount.address))
            .to.equal(publisherInitialBalance +(expectedPublisherAmount));

        expect(await ethers.provider.getBalance(contractOwner.address))
            .to.equal(ownerInitialBalance+(expectedPlatformFee));

        // Buyer's balance should decrease by itemPrice + gas
        expect(await ethers.provider.getBalance(buyerAccount.address))
             .to.equal(buyerInitialBalance-(itemPrice)-(gasUsedByBuyer));

        // 4. Verify access
        expect(await unlockableContract.hasAccess(buyerAccount.address, itemId)).to.be.true;

        // 5. Verify event
        await expect(purchaseTx)
            .to.emit(unlockableContract, "ItemPurchased")
            .withArgs(itemId, buyerAccount.address, publisherAccount.address, itemPrice, expectedPlatformFee);
    });

    it("Should revert if trying to purchase with incorrect ETH amount", async function () {
        const itemPrice = ethers.parseEther("0.1");
        await unlockableContract.connect(publisherAccount).listItem("Test Item", "Desc", itemPrice);
        const itemId = 0;

        const incorrectPrice = ethers.parseEther("0.05");
        await expect(unlockableContract.connect(buyerAccount).purchaseItem(itemId, { value: incorrectPrice }))
            .to.be.revertedWith("Incorrect ETH amount sent");
    });

    it("Should revert if trying to purchase an already purchased item", async function () {
        const itemPrice = ethers.parseEther("0.1");
        await unlockableContract.connect(publisherAccount).listItem("Test Item", "Desc", itemPrice);
        const itemId = 0;

        // First purchase
        await unlockableContract.connect(buyerAccount).purchaseItem(itemId, { value: itemPrice });

        // Attempt second purchase
        await expect(unlockableContract.connect(buyerAccount).purchaseItem(itemId, { value: itemPrice }))
            .to.be.revertedWith("Already purchased");
    });

    it("Should allow contract owner to set platform fee percentage", async function () {
        const newFee = 10; 
        await expect(unlockableContract.connect(contractOwner).setPlatformFeePercent(newFee))
            .to.emit(unlockableContract, "PlatformFeeUpdated")
            .withArgs(newFee);
        expect(await unlockableContract.platformFeePercent()).to.equal(newFee);
    });

    it("Should prevent non-owner from setting platform fee percentage", async function () {
        await expect(unlockableContract.connect(otherAccount).setPlatformFeePercent(10))
            .to.be.revertedWith("Ownable: caller is not the owner"); // Error message from OpenZeppelin's Ownable
    });

    it("Should correctly report access for purchased and non-purchased items", async function () {
        const itemPrice = ethers.parseEther("0.1");
        await unlockableContract.connect(publisherAccount).listItem("Item 1", "Desc 1", itemPrice); // ID 0
        await unlockableContract.connect(publisherAccount).listItem("Item 2", "Desc 2", itemPrice); // ID 1

        await unlockableContract.connect(buyerAccount).purchaseItem(0, { value: itemPrice }); // Buy item 0

        expect(await unlockableContract.hasAccess(buyerAccount.address, 0)).to.be.true;  // Has access to item 0
        expect(await unlockableContract.hasAccess(buyerAccount.address, 1)).to.be.false; // No access to item 1
        expect(await unlockableContract.hasAccess(otherAccount.address, 0)).to.be.false; // Other user no access
    });

    it("Should return all existing item IDs correctly", async function () {
         const price = ethers.parseEther("0.01");
         await unlockableContract.connect(publisherAccount).listItem("Title 0", "Desc 0", price); // ID 0
         await unlockableContract.connect(publisherAccount).listItem("Title 1", "Desc 1", price); // ID 1
         await unlockableContract.connect(publisherAccount).listItem("Title 2", "Desc 2", price); // ID 2

         const itemIdsBigNumArray = await unlockableContract.getAllItemIds(); 
        const itemIds = itemIdsBigNumArray.map(id => Number(id)); 

        expect(itemIds.length).to.equal(3);
        expect(itemIds[0]).to.equal(0);
        expect(itemIds[1]).to.equal(1);
        expect(itemIds[2]).to.equal(2);
    });
});