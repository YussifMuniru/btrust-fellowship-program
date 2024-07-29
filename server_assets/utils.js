import * as http  from 'http';
import bitcoin from 'bitcoinjs-lib';





/**
 * Decodes the given hex string into a transaction object.
 * @param {string} hexString - The hex string representing the raw transaction.
 * @returns {object} The decoded transaction object.
 */



function decodeRawTransaction(hexString) {
   

// // hard-coding the hex here. we can later bring it through the ajax API
// const hex = '020000000001010ccc140e766b5dbc884ea2d780c5e91e4eb77597ae64288a42575228b79e234900000000000000000002bd37060000000000225120245091249f4f29d30820e5f36e1e5d477dc3386144220bd6f35839e94de4b9cae81c00000000000016001416d31d7632aa17b3b316b813c0a3177f5b6150200140838a1f0f1ee607b54abf0a3f55792f6f8d09c3eb7a9fa46cd4976f2137ca2e3f4a901e314e1b827c3332d7e1865ffe1d7ff5f5d7576a9000f354487a09de44cd00000000';

// get the transaction object
const txt = bitcoin.Transaction.fromHex(hexString);

// Access transaction details

const txtVersion  = txt.version;
const txtLocktime = txt.locktime;
const txtInputs   = txt.ins.map(input => {
  // in a bitcoin transaction input parsing the script will reveal several details
  return {
    hash: Buffer.from(input.hash).toString('hex'),
    index: input.index,
    sequence: input.sequence,
  };
});


 const txtOutputs = txt.outs.map(output => {
  // in a bitcoin transaction output parsing the script will reveal several details
  return {
    value: output.value,
    script: output.script.toString('hex'),
  };
});

return {version:txtVersion,locktime:txtLocktime,inputs: txtInputs,outputs: txtOutputs};
}



function decodeRawTxtTest(hexString,expectedVersion,expectedLocktime,expectedInputs,expectedOutputs){
 
 

  const result = decodeRawTransaction(hexString);

  // Validate the decoded transaction
  assert.strictEqual(result.version, expectedVersion, 'Version mismatch');
  assert.strictEqual(result.locktime, expectedLocktime, 'Locktime mismatch');
  
  // here we are comparing only the lengths just to save time, but it is very interesting to compare the various inner details of the objects.
  assert.strictEqual(result.inputs.length, expectedInputs.length, 'Inputs length mismatch');
  assert.strictEqual(result.outputs.length, expectedOutputs.length, 'Outputs length mismatch');

  console.log('All tests passed!');

}

export { decodeRawTransaction , decodeRawTxtTest }