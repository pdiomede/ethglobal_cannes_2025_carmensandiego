const hre = require("hardhat");

async function main() {
  // Replace this with your actual IPFS hash after uploading questions
  const questionsIPFSHash = process.env.QUESTIONS_IPFS_HASH || "QmPlaceholderHash";
  
  console.log("Deploying Carmen Sandiego Game...");
  console.log("Questions IPFS Hash:", questionsIPFSHash);

  const CarmenSandiegoGame = await hre.ethers.getContractFactory("CarmenSandiegoGame");
  const game = await CarmenSandiegoGame.deploy(questionsIPFSHash);

  await game.waitForDeployment();
  const address = await game.getAddress();

  console.log("Carmen Sandiego Game deployed to:", address);
  console.log("Network:", hre.network.name);
  
  // Verify contract (optional)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await game.deploymentTransaction().wait(5);
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [questionsIPFSHash],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });