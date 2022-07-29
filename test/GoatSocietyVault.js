const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");


describe("redeamwithPermit", function () {
    it("should accept goat tokens to provide liquidity", async function () {
        const accounts = await ethers.getSigners(1);
        const signer = accounts[0];

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.deployed();

        const GoatSocietyVault = await ethers.getContractFactory(
            "GoatSocietyVault"
        );
        const vault = await GoatSocietyVault.deploy(token.address);
        await vault.deployed();


        const amount = ethers.utils.parseEther("100000000");

        await (await token.transfer(vault.address, amount)).wait();
        expect(await token.balanceOf(vault.address)).to.equal(amount);
    });
    it("redeam with permit", async function () {
        const accounts = await ethers.getSigners(1);
        const signer = accounts[0];

        const user = accounts[1];

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.deployed();

        const GoatSocietyVault = await ethers.getContractFactory(
            "GoatSocietyVault"
        );
        const vault = await GoatSocietyVault.deploy(token.address);
        await vault.deployed();


        const amount = ethers.utils.parseEther("100000000");
        console.log("amount", amount);

        await (await token.transfer(vault.address, amount)).wait();

        const recipient = accounts[1].address;
        const redeemAmount = utils.parseEther("100");
        const nonce = new Date().getTime();


        const message = utils.solidityKeccak256(
            ["address", "uint256", "int256"],
            [recipient, redeemAmount, nonce]
        );
        //   const privatekey = "c888d06260a2317069d5e1678d5b14c2c6ba53322bb9a5d48e607b845f363c21"
        //   const wallet = new Wallet(privateKey)
        const messageHashBytes = utils.arrayify(message);
        const signature = await signer.signMessage(messageHashBytes);

        await vault
            .connect(user)
            .redemWithPermit(recipient, redeemAmount, signature, nonce);

        expect(await token.balanceOf(user.address)).to.equal(redeemAmount);
    });
    it("should not allow non-validated signature to redeem", async function () {
        const accounts = await ethers.getSigners(1);
        const validator = accounts[0];

        const nonValidator = accounts[2];

        const user = accounts[1];

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.deployed();

        const GoatSocietyVault = await ethers.getContractFactory(
            "GoatSocietyVault"
        );
        const vault = await GoatSocietyVault.deploy(token.address);
        await vault.deployed();
        const amount = ethers.utils.parseEther("100000000");

        await (await token.transfer(vault.address, amount)).wait();
        const recipient = accounts[1].address;
        const redeemAmount = utils.parseEther("100");
        const nonce = new Date().getTime();

        const message = utils.solidityKeccak256(
            ["address", "uint256", "int256"],
            [recipient, redeemAmount, nonce]
        );

        const messageHashBytes = utils.arrayify(message);
        const signature = await validator.signMessage(messageHashBytes);

        const invalidsSig = await nonValidator.signMessage(messageHashBytes);

        expect(
            vault
                .connect(user)
                .redemWithPermit(recipient, redeemAmount.mul("2"), signature, nonce)
        ).revertedWith("Not a valid signature!");

        expect(
            vault
                .connect(user)
                .redemWithPermit(recipient, redeemAmount, invalidsSig, nonce)
        ).revertedWith("Not a valid signature!");
    });
});