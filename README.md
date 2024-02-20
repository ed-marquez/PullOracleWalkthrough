# GitPod

1. Go to [this link](https://gitpod.io/#https://github.com/ed-marquez/PullOracleWalkthrough)

2. Run the following commands on the terminal:
   `cd client` `npm init --y` `npm install`

3. Rename the file `.env.SAMPLE` to `.env` and enter you Hedera network credentials (testnet/mainnet):
   `cp .env.SAMPLE .env`

4. Run the `main.js` script: `node main.js`

5. See error:
   `Request ID: e97d802f-1cae-494b-a321-f5475c77be9e] execution reverted: data field must not exceed call size limit`
   coming from line 85 in the `main.js`.
