# Tax Token Ecosystem

A complete ecosystem for a taxed ERC20 token, featuring an automated ICO/Presale system, secure smart contracts, comprehensive automated testing, and CI/CD integration.

## System Architecture & How It Works

Before diving into the code, here is a brief overview of the core mechanics driving this ecosystem:

* **Deflationary Mechanism (The 1% Tax):** Every standard peer-to-peer (P2P) transaction incurs a 1% fee. This fee is automatically calculated and transferred directly to a designated `Tax Wallet`. This creates a deflationary effect or generates continuous revenue for the treasury.
* **Whitelist Exemption:** To prevent double taxation and ensure smooth operations, specific addresses (like the ICO/Presale contract, liquidity pools, or project owners) can be whitelisted. Whitelisted addresses bypass the 1% fee entirely during transfers.
* **Secure Presale (ICO):** The TokenSale contract safely holds a large supply of tokens and trades them for ETH at a fixed rate. It utilizes modern security practices (`.call` for ETH transfers) to mitigate reentrancy attacks, ensuring investor funds and project tokens are secure.

---

## Project Structure

### 1. Smart Contracts (`contracts/`)

* **`TaxToken.sol`**: A cutting-edge ERC20 token featuring an automated 1% tax on all Peer-to-Peer (P2P) transfers. The deducted tax is automatically routed to a designated Tax Wallet. It also includes a **Whitelist mechanism** for tax-exempt addresses.
* **`TokenSale.sol`**: An ICO/Presale contract for fundraising. Built with top-tier security standards (utilizing `.call` for ETH transfers to prevent Reentrancy attacks). It securely accepts ETH from investors and distributes `TAX` tokens at a predefined exchange rate.

### 2. Deployment & Orchestration (`ignition/modules/`)

* **`TokenSaleDeployment.ts`**: An all-in-one orchestration script. It handles the entire deployment flow smoothly:
1. Deploys the Token contract.
2. Deploys the TokenSale (Presale) contract.
3. Approves a quota of 500,000 TAX to the TokenSale contract.
4. Adds the TokenSale contract to the Whitelist, ensuring that investors buying from the presale are **exempt from the 1% tax**.



### 3. Quality Assurance & Testing (`test/`)

* **`TaxTokenEcosystem.test.ts`**: A robust automated test suite written in **TypeScript + Mocha/Chai**. It provides full test coverage (Assertions) across the ecosystem:
* Verifies that the Owner receives the initial supply and the Tax Wallet is configured correctly.
* Confirms the 1% tax deduction functions properly on regular P2P transfers.
* Ensures that ICO investors receive their full `TAX` token amount (zero tax applied) and that the incoming ETH is safely transferred to the project owner's wallet.



### 4. CI/CD Pipeline (`.github/workflows/`)

* **`ci.yml`**: An automated GitHub Actions workflow configured to run `npx hardhat test` on every code push. It implements **Mock Environment Variables** to ensure secrets are strictly protected and never leak to the cloud.

### 5. Network Deployments (`deployments/`)

The system is fully compatible with Localhost environments for development. Furthermore, the deployment history on the **Ethereum Sepolia Testnet** is securely tracked and recorded in the `deployments/` directory, allowing for seamless future upgrades and maintenance.

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org/) (v22.0 or higher recommended)
* npm (Package manager)

---

## Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/DiaBmond/tax-token-contract.git
cd tax-token-contract
```


2. **Install dependencies:**
```bash
npm install
```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory by copying the provided example file:
```bash
cp .env.example .env
```


Open the `.env` file and fill in your details (**Do NOT share your real private keys publicly**):

```env
   # RPC URL for Sepolia Testnet (e.g., Alchemy, Infura, or PublicNode)
   SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
   
   # Your wallet private key for deployment
   SEPOLIA_PRIVATE_KEY="0x_your_wallet_private_key_here"
```

---

## Available Commands

Here are the primary commands to interact with the Hardhat project:

### Compile Smart Contracts

Compiles the Solidity source files and generates the necessary ABI and Bytecode.

```bash
npx hardhat compile
```

### Run Automated Tests

Executes the comprehensive test suite using Mocha and Chai to ensure all tokenomic rules and presale functions work correctly.

```bash
npx hardhat test
```

### Run a Local Blockchain Node

Starts a local Hardhat network for fast and free development testing.

```bash
npx hardhat node
```

---

## Deployment

We use Hardhat Ignition for robust and declarative deployments.

**1. Deploying to Localhost:**
*(Make sure you have `npx hardhat node` running in a separate terminal first)*

```bash
npx hardhat ignition deploy ignition/modules/TokenSaleDeployment.ts --network localhost
```

**2. Deploying to Sepolia Testnet:**

```bash
npx hardhat ignition deploy ignition/modules/TokenSaleDeployment.ts --network sepolia
```
