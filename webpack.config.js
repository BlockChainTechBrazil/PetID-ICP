const path = require('path');
const webpack = require('webpack');

function initCanisterEnv() {
  let localCanisters, prodCanisters;
  try {
    localCanisters = require(path.resolve('.dfx', 'local', 'canister_ids.json'));
  } catch (error) {
    console.log('No local canister_ids.json found. Continuing with production IDs.');
  }
  try {
    prodCanisters = require(path.resolve('canister_ids.json'));
  } catch (error) {
    console.log('No production canister_ids.json found. Continuing with local IDs.');
  }

  const network = process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === 'production' ? 'ic' : 'local');

  const canisters = network === 'local' ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[`CANISTER_ID_${canister.toUpperCase()}`] =
      canisters[canister][network];
  }
}
initCanisterEnv();

module.exports = {
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DFX_NETWORK: 'local',
    }),
  ],
};
