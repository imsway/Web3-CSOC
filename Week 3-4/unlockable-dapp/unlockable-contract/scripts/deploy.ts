import { ethers } from "hardhat";
async function main() {
    const initialPlatformFeePercent = 5; // 5%

    // ethers.getSigners() returns an array of SignerWithAddress objects.
    const [deployer] = await ethers.getSigners();
    const initialFeeRecipient = deployer.address; 

    console.log(
        `Deploying Unlockable contract with fee recipient: ${initialFeeRecipient} and fee: ${initialPlatformFeePercent}%`
    );
    console.log(`Deployer account: ${deployer.address}`); 
    console.log(`Deployer balance: ${(await deployer.provider.getBalance(deployer.address)).toString()} WEI`);

    const UnlockableFactory = await ethers.getContractFactory("Unlockable");
    const unlockableContract = await UnlockableFactory.deploy(
        initialPlatformFeePercent,
        initialFeeRecipient
    );


    // Wait for deployment to be confirmed before accessing contract properties
    await unlockableContract.waitForDeployment();
    console.log("Unlockable contract deployed to address:", await unlockableContract.getAddress()); // Correct
    console.log("Initial Platform Fee Percent set to:", (await unlockableContract.platformFeePercent()).toString());
    console.log("Initial Fee Recipient (Owner) set to:", await unlockableContract.owner());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });