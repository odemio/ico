# ODEM ICO

## Development

**Dependencies**

- `node@8.5.x`
- `truffle@^4.0.x`
- `ethereumjs-testrpc@^4.0.x`
- `zeppelin-solidity@1.3.X`

## Setting Up

- Clone this repository.

- Install all [system dependencies](#development).
  - `npm install`

- Compile contract code
  - `node_modules/.bin/truffle compile`

- Start testrpc server
  - `testrpc --accounts="10"`

- Deploy contracts
  - `node_modules/.bin/truffle migrate`

## Running tests
  - `node_modules/.bin/truffle test`

# If you work on these contracts, write tests!
**Testing Pattern**
- a good pattern to use, when testing restrictions on contract is to structure this way:

```javascript
describe("testing user restriction", () => {
    beforeEach("deploy and prepare", () => {
        // Deploy a contract(s) and prepare it up
        // to the pass / fail point
    })

    it("test the failing user", () => {
        // Test something with the bad user
        // in as few steps as possible
    })

    it("test the good user", () => {
        // Test the VERY SAME steps,
        // with only difference being the good user
    })
})
```
