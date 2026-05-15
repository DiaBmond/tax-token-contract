import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.create();

describe("TaxToken Contract", function () {

    async function deployTaxTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const TaxTokenFactory = await ethers.getContractFactory("TaxToken");
        const taxToken = await TaxTokenFactory.deploy(owner.address);

        return { taxToken, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { taxToken, owner } = await deployTaxTokenFixture();
            expect(await taxToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { taxToken, owner } = await deployTaxTokenFixture();
            const ownerBalance = await taxToken.balanceOf(owner.address);
            expect(await taxToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions & Tax (1%)", function () {
        it("Should transfer full amount if sender is owner", async function () {
            const { taxToken, addr1 } = await deployTaxTokenFixture();

            const transferAmount = ethers.parseUnits("1000", 18);
            await taxToken.transfer(addr1.address, transferAmount);

            expect(await taxToken.balanceOf(addr1.address)).to.equal(transferAmount);
        });

        it("Should deduct 1% tax on regular transfers", async function () {
            const { taxToken, owner, addr1, addr2 } = await deployTaxTokenFixture();

            const initialAmount = ethers.parseUnits("1000", 18);
            await taxToken.transfer(addr1.address, initialAmount);

            const amountToTransfer = ethers.parseUnits("100", 18);
            await taxToken.connect(addr1).transfer(addr2.address, amountToTransfer);

            const expectedReceive = ethers.parseUnits("99", 18);
            expect(await taxToken.balanceOf(addr2.address)).to.equal(expectedReceive);

            const expectedOwnerBalance = ethers.parseUnits("999001", 18);
            expect(await taxToken.balanceOf(owner.address)).to.equal(expectedOwnerBalance);
        });
    });
});