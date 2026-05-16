import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const TokenSaleModule = buildModule("TokenSaleModule", (m) => {
    const owner = m.getAccount(0);

    const taxToken = m.contract("TaxToken", [owner]);


    const saleRate = 10000;
    const tokenSale = m.contract("TokenSale", [saleRate, owner, taxToken]);

    const allowanceAmount = parseEther("500000");
    m.call(taxToken, "approve", [tokenSale, allowanceAmount], { from: owner });

    m.call(taxToken, "setExcludedFromTax", [tokenSale, true], { from: owner });

    return { taxToken, tokenSale };
});

export default TokenSaleModule;