const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    let defaultAccount = accounts[0]
    let account1 = accounts[1]
    let account2 = accounts[2]
    let name = 'super star'
    let story = 'my super star galactica'
    let ra = '1'
    let dec = '2'
    let mag = '3'
    let starData = [name, story, ra, dec, mag];

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: defaultAccount})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its data values correctly', async function () { 
            // This tests star creation (createStar) and data retrieved correctly (tokenIdToStarData)
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            assert.deepEqual(await this.contract.tokenIdToStarData(0), starData)
        })
    })

    describe('star uniqueness', () => { 
        it('only stars unique stars can be minted', async function() { 
            await this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount})
            await expectThrow(this.contract.createStar(name, story, ra, dec, mag, {from: defaultAccount}))
        })

        it('minting unique stars does not fail', async function() { 
            for(let i = 0; i < 10; i ++) { 
                let id = i
                let newRa = i.toString()
                let newDec = i.toString()
                let newMag = i.toString()

                await this.contract.createStar(name, story, newRa, newDec, newMag, {from: defaultAccount})

                let starInfo = await this.contract.tokenIdToStarData(id)
                assert.deepEqual(starInfo, [name, story, newRa, newDec, newMag])
            }
        })
    })

    describe('buying and selling stars', () => { 
        let user1 = defaultAccount
        let user2 = account1
        let randomMaliciousUser = account2
        
        let starId = 0
        let starPrice = web3.toWei(.01, "ether")

        it('user1 can put up their star for sale', async function () { 
            await this.contract.createStar(name, story, ra, dec, mag, {from: user1})
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function() {
                await this.contract.createStar(name, story, ra, dec, mag, { from: user1 })
                await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })
            })
            
            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })
})

var expectThrow = async function(promise) { 
    try { 
        await promise
    } catch (error) { 
        assert.exists(error)
        return
    }

    assert.fail('Expected an error but didnt see one!')
}
