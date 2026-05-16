import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.create();

describe("TaxToken & TokenSale Ecosystem", function () {


    async function deployEcosystemFixture() {
        const [owner, buyer1, buyer2, taxWallet] = await ethers.getSigners();

        // 1. Deploy TaxToken
        const TaxTokenFactory = await ethers.getContractFactory("TaxToken");
        const taxToken = await TaxTokenFactory.deploy(owner.address);

        // 2. Deploy TokenSale ( 1 ETH = 10,000 TAX)
        const TokenSaleFactory = await ethers.getContractFactory("TokenSale");
        const saleRate = 10000;
        const tokenSale = await TokenSaleFactory.deploy(saleRate, owner.address, taxToken.target);

        // 3. Setup 
        const allowanceAmount = ethers.parseUnits("500000", 18);
        await taxToken.approve(tokenSale.target, allowanceAmount);
        await taxToken.setExcludedFromTax(tokenSale.target, true);
        await taxToken.setTaxWallet(taxWallet.address);

        return { taxToken, tokenSale, owner, buyer1, buyer2, taxWallet, saleRate };
    }

    describe("Deployment & Config", function () {
        it("Should set the right owner", async function () {
            const { taxToken, owner } = await deployEcosystemFixture();
            expect(await taxToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { taxToken, owner } = await deployEcosystemFixture();
            const ownerBalance = await taxToken.balanceOf(owner.address);
            expect(await taxToken.totalSupply()).to.equal(ownerBalance);
        });

        it("Should set the correct tax wallet", async function () {
            const { taxToken, taxWallet } = await deployEcosystemFixture();
            expect(await taxToken.taxWallet()).to.equal(taxWallet.address);
        });
    });

    describe("Transactions & Tax (1%)", function () {
        it("Should transfer full amount if sender is whitelisted (e.g., Owner)", async function () {
            const { taxToken, buyer1 } = await deployEcosystemFixture();

            const transferAmount = ethers.parseUnits("1000", 18);
            await taxToken.transfer(buyer1.address, transferAmount);

            expect(await taxToken.balanceOf(buyer1.address)).to.equal(transferAmount);
        });

        it("Should deduct 1% tax on regular transfers", async function () {
            const { taxToken, buyer1, buyer2, taxWallet } = await deployEcosystemFixture();

            const initialAmount = ethers.parseUnits("1000", 18);
            await taxToken.transfer(buyer1.address, initialAmount);

            const amountToTransfer = ethers.parseUnits("100", 18);
            await taxToken.connect(buyer1).transfer(buyer2.address, amountToTransfer);

            const expectedReceive = ethers.parseUnits("99", 18);
            expect(await taxToken.balanceOf(buyer2.address)).to.equal(expectedReceive);

            const expectedTax = ethers.parseUnits("1", 18);
            expect(await taxToken.balanceOf(taxWallet.address)).to.equal(expectedTax);
        });
    });

    describe("TokenSale Pre-sale Integration", function () {
        it("Should allow users to buy tokens and receive full amount (No Tax)", async function () {
            const { taxToken, tokenSale, buyer1 } = await deployEcosystemFixture();

            const ethAmount = ethers.parseUnits("1", 18); // 1 ETH
            await tokenSale.connect(buyer1).buyTokens(buyer1.address, { value: ethAmount });

            //  1 ETH = 10,000 TAX
            const expectedTokens = ethers.parseUnits("10000", 18);
            expect(await taxToken.balanceOf(buyer1.address)).to.equal(expectedTokens);
        });

        it("Should forward the ETH to the owner's wallet instantly", async function () {
            const { tokenSale, owner, buyer1 } = await deployEcosystemFixture();

            const initialOwnerEth = await ethers.provider.getBalance(owner.address);
            const ethAmount = ethers.parseUnits("1", 18); // 1 ETH

            await tokenSale.connect(buyer1).buyTokens(buyer1.address, { value: ethAmount });

            const finalOwnerEth = await ethers.provider.getBalance(owner.address);
            expect(finalOwnerEth).to.equal(initialOwnerEth + ethAmount);
        });
    });
});