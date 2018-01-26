# ODEM.io ICO

## Development

**Dependencies**

* `node@8.5.x`
* `truffle@^4.0.1`
* `ganache-cli@^6.0.x`
* `zeppelin-solidity@1.4.X`

## Setting Up

* Clone this repository.

* Install all [system dependencies](#development).

  * `npm install`

* Compile contract code

  * `node_modules/.bin/truffle compile`

* Run the personal blockchain for development opting to have the accounts with many ether

  * `ganache-cli --gasLimit 8000000 --account="0xee4e871def4e297da77f99d57de26000e86077528847341bc637d2543f8db6e2,10000000000000000000000000" --account="0x4be9f21ddd88e9e66a526d8dbb00d27f6d7b977a186eb5baa87e896087a6055f,10000000000000000000000000" --account="0x09e775e9aa0ac5b5e1fd0d0bca00e2ef429dc5f5130ea769ba14be0163021f16, 10000000000000000000000000" --account="0xed055c1114c433f95d688c8d5e460d3e5d807544c5689af262451f1699ff684f, 10000000000000000000000000" --account="0x3f81b14d33f5eb597f9ad2c350716ba8f2b6c073eeec5fdb807d23c85cf05794,10000000000000000000000000" --account="0x501a3382d37d113b6490e3c4dda0756afb65df2d7977ede59618233c787239f2,10000000000000000000000000" --account="0x3d00e5c06597298b7d70c6fa3ac5dae376ff897763333db23c226d14d48333af, 10000000000000000000000000" --account="0xc00db81e42db65485d6ce98d727f12f2ace251cbf7b24a932c3afd3a356876ad, 10000000000000000000000000" --account="0xd6f7d873e7349c6d522455cb3ebdaa50b525dc6fd34f96b9e09e2d8a22dce925, 10000000000000000000000000" --account="0x13c8853ac12e9e30fda9f070fafe776031cc4d13bee88d7ad4e099601d83c594, 10000000000000000000000000"`

* Deploy contracts
  * `node_modules/.bin/truffle develop`
    Once you are in the develop console, run the command:
  * `migrate --reset`

## Running tests

    - `node_modules/.bin/truffle develop`
    Once you are in the develop console, run the command:
    - `test`

# If you work on these contracts, write tests!

**Testing Pattern**

* a good pattern to use, when testing restrictions on contract is to structure this way:

```javascript
describe('testing user restriction', () => {
  beforeEach('deploy and prepare', () => {
    // Deploy a contract(s) and prepare it up
    // to the pass / fail point
  })

  it('test the failing user', () => {
    // Test something with the bad user
    // in as few steps as possible
  })

  it('test the good user', () => {
    // Test the VERY SAME steps,
    // with only difference being the good user
  })
})
```
