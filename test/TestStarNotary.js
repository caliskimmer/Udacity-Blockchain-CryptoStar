const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    const starId = 6;

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const currencyName = await instance.name();
    const currencySymbol = await instance.symbol();
    const expectedName = "Cryptostar";
    const expectedSymbol = "CST";
    assert.equal(currencyName, expectedName);
    assert.equal(expectedSymbol, expectedSymbol);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    const user1 = owner;
    const user2 = accounts[2];

    // 1. create 2 Stars with different tokenId
    const firstStarId = 7;
    const secondStarId = 8;
    const firstStar = await instance.createStar("TestStar1", firstStarId, {from: user1});
    const secondStar = await instance.createStar("TestStar2", secondStarId, {from: user2});
    
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(firstStarId, secondStarId);

    // 3. Verify that the owners changed
    const newFirstStarOwner = await instance.ownerOf(firstStarId);
    const newSecondStarOwner = await instance.ownerOf(secondStarId);
    assert.equal(newFirstStarOwner, user2);
    assert.equal(newSecondStarOwner, user1);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];

    // 1. create a Star with different tokenId
    const starId = 9;
    const star = await instance.createStar("TestStar1", starId, {from: owner});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user1, starId, {from: owner});

    // 3. Verify the star owner changed.
    const newOwner = await instance.ownerOf(starId);
    assert.equal(newOwner, user1);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    const starId = 10;
    const star = await instance.createStar("TestStar1", starId, {from: owner});
    
    // 2. Call your method lookUptokenIdToStarInfo
    const starName = await instance.lookUptokenIdToStarInfo(starId);

    // 3. Verify if you Star name is the same
    const expectedStarName = "TestStar1";
    assert.equal(starName, expectedStarName);
});
