import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TaxTokenModule", (m) => {

  const initialOwner = m.getAccount(0);
  const taxToken = m.contract("TaxToken", [initialOwner]);

  return { taxToken };
});
