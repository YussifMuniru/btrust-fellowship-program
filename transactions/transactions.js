import * as crypto from "crypto";
import bitcoin from 'bitcoinjs-lib';
import * as ecpair from 'ecpair';
import * as secp256k1  from "tiny-secp256k1";


import axios from 'axios';



const ECPair = ecpair.ECPairFactory(secp256k1);

const keyPair = ECPair.fromPrivateKey(Buffer.from("d4473603292312d2b5662cc05e27df987a101c4f7b6428107df84b9595ecbffe","hex"));

const stackEvaluation = (scriptHex) => {
//   Stack Evaluation:
// 010101029301038801027693010487
// Initial State:
// 01 - This is typically a data push operation in Bitcoin script, but without the context of the preceding OP_CODE to define how many bytes to push, it's treated as part of the data or an incomplete operation.
// 0101 - These are likely intended to be data values to be pushed onto the stack, but again, without a data push OP_CODE (like OP_PUSHDATA1, OP_PUSHDATA2, etc.), it's unclear.
// 02 - Similar to above, this would be data to push but lacks a preceding OP_CODE.
// 93 - This does not correspond to a standard OP_CODE.
// 01 - Data push indicator without a clear operation.
// 0388 - More data, unclear without push operation.
// 01 - Data push indicator.
// 0276 - Data, potentially intended to be pushed.
// 93 - Not a standard OP_CODE.
// 0104 - Data push indicator with data.
// 87 - Not a standard OP_CODE.
// Stack: [] (empty)
// 01: Push 0x01 onto the stack

// Stack: [0x01]
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01]
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01]
// 02: Duplicate the top item on the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 93: Divide the top two items on the stack

// Stack: [0x01, 0x01, 0x01] (0x01 / 0x01 = 0x01)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 03: Push 0x03 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x03]
// 88: Equal (VERIFY): Check if the top two items are equal

// Stack: [0x01, 0x01, 0x01] (0x01 == 0x03 is false, but VERIFY doesn't pop values)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 02: Duplicate the top item on the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x01]
// 76: Data push: the next byte (0x93) determines the length of the data

// Stack: [0x01, 0x01, 0x01, 0x01] (no data pushed)
// 93: Divide the top two items on the stack

// Stack: [0x01, 0x01, 0x01] (0x01 / 0x01 = 0x01)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 04: Push 0x04 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x04]
// 87: Equal: Check if the top two items are equal

// Stack: [0x01, 0x01, 0x01] (0x01 == 0x04 is false)
// Final State:

// Stack: [0x01, 0x01, 0x01]
// Result:

// The script evaluates to FALSE because the final comparison (0x01 == 0x04) is false.


  // Convert the hex string to an array of bytes
  
  const bytes = Buffer.from(scriptHex, 'hex');

  // Initialize an empty stack
  const stack = [];

  // Iterate over each byte in the script
  for (let i = 0; i < bytes.length; i++) {
      const opcode = bytes[i];

      // Push opcode onto the stack
      stack.push(opcode);

      // If opcode is OP_TRUE (0x51), OP_FALSE (0x00), or OP_PUSHDATA (0x01-0x4b), continue
      if (opcode === 0x51) {
          stack.pop(); // Remove OP_TRUE from stack
          stack.push(true); // Push true onto stack
      } else if (opcode === 0x00) {
          stack.pop(); // Remove OP_FALSE from stack
          stack.push(false); // Push false onto stack
      } else if (opcode >= 0x01 && opcode <= 0x4b) {
          const dataLength = opcode;
        const data = bytes.subarray(i + 1, i + 1 + dataLength);
          stack.pop(); // Remove OP_PUSHDATA from stack
          stack.push(data); // Push data onto stack
          i += dataLength; // Increment i to skip over the data bytes
      }
  }

  // If stack contains a single element and it's true, return true; otherwise, return false
  return {"result":stack.length === 1 && stack[0] === true};
}



const isTaprootOutput = output => {
  // Taproot outputs have a scriptPubKey starting with OP_1 (0x51) followed by a 32-byte or  public key
  return  output.script.length === 34 && output.script[0] === 0x51 ;
}

const isSegwitInput = input => {
  // SegWit inputs have a non-empty witness field
  return input.witness.length > 0;
}

const isRBFEnabled = input => {
  // RBF is signaled by a sequence number less than 0xffffffff
  return input.sequence < 0xffffffff;
}

const analyzeTransaction = tx => {
  const isSegWit = tx.ins.some(isSegwitInput);
  const isRBF = tx.ins.some(isRBFEnabled);
  const containsTaprootOutput = tx.outs.some(isTaprootOutput);

  let txType = 'Legacy';
  if (isSegWit) {
      txType = 'SegWit';
  }
  if (containsTaprootOutput) {
      txType += '/Taproot';
  }
  if (isRBF) {
      txType += '/RBF';
  }
  return txType;
}


function parseTransaction(hexStrings) {
  
  let resultsObj = {};

  hexStrings.forEach((hex,index) => {
    
  const tx = bitcoin.Transaction.fromHex(hex);
  const version = tx.version;
  const locktime = tx.locktime;
  const txType = analyzeTransaction(tx);
  const inputs = tx.ins.map(input => {
      return {

          // due to the oddity of Display and internal byte orders,
          // we have to reverse the hex mapped to the txId property
          // since the hash is from the binary buffer which is in 
          // the little-endian format.
          txId: Buffer.from(input.hash).reverse().toString('hex'),
          //the index of the UTXO being referenced by this txId
          vout: input.index,
          // using the ASM will translate the input script into a human-readable format.
          // e.g from something like 76 a9 14 <20-byte hash> 88 ac to 
          // OP_DUP HASH160 <20-byte hash> OP_EQUALVERIFY OP_CHECKSIG
          script: bitcoin.script.toASM(input.script),
          //the sequence number or field of the UTXO being referenced by this txId
          sequence: input.sequence,
      };
  });
  const outputs = tx.outs.map(output => {
      return {
          // the amount being sent in the output
          value: (output.value / 1e8) + " BTC",
           // the script that stipulates the condition(s) 
           // necessary for this output to be sent
           scriptPubKey: bitcoin.script.toASM(output.script),
      };
  });
  resultsObj[index] = {'type':txType ,'version': version,'inputs': inputs,'outputs': outputs,'locktime': locktime};
  });


  return resultsObj;

}


// 'Btrust Builders' 
// bytesEncoding = 010101209384738472893824

const hexFromPreimage = (bytesEncoding) =>{

    // convert the bytes encoding to it's buffer format
    // as the crypto.hash256 take's a buffer instead of a hex
    const preimage = Buffer.from(bytesEncoding, 'hex');

    // create the lockhash for the redeem script by using
    // the preimage buffer.
    const lockHash = bitcoin.crypto.hash256(preimage).hex();

    // now compile the redeem script
    const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_SHA256,
    lockHash,
    bitcoin.opcodes.OP_EQUAL
    ]);

    // return the redeem script
    return redeemScript.toString('hex');
   
}




// this function gathers returns the raw hex for broadcast
const  getTransactionRawHex = async (amount,redeemScriptHex)  => {

  // initialize a raw UTXO hex variable
  let rawUTXOHex = "";

  // For Demonstration purposes I am sanitizing the amount input
  amount = (amount === undefined) || (amount.trim() === "") || (parseFloat(amount) === NaN)  ? 1000: parseFloat(amount) / 100000000;
 

  try {

    // since the redeem script will be sent in a hex format,
    // convert it to a buffer here. (You can use hexfromPreimage)
    const redeemScriptBuffer = Buffer.from(redeemScriptHex, 'hex');

   // initialize the network variable.
 const network = bitcoin.networks.testnet;

// Derive P2SH address from redeem script
const recipientAddress = bitcoin.payments.p2sh({
   redeem: { output: redeemScriptBuffer },
   network: network
}).address;



// Construct a transaction
const txb = new bitcoin.Psbt({network:network});



// Add inputs - Normally, you'd obtain txId and vout from a UTXO database or a wallet
// For demonstration, these are placeholder values
const txId = '7e44429a375f7c9b4b71342a2284b271045eef27d1b6b231840d6138d4746bd8'; // Transaction ID of the UTXO
const vout = 0; // Output index of the UTXO

   rawUTXOHex = (await axios({
    method: 'get',
    url: `https://blockstream.info/testnet/api/tx/${txId}/hex`,
    headers: { 'Content-Type': 'text/plain' },
  })).data;


  // add the input(s) to the transaction
  // i.e this is where you are getting your funds for spending
  txb.addInput({
    hash: txId,
    index: vout,
    nonWitnessUtxo: Buffer.from(rawUTXOHex,"hex")
  });


  // add the destination address you derive above
  // add the amount we sanitized above
  txb.addOutput({
    address: recipientAddress,
    value: amount,
  })


   // Signing the transaction would be the next step, requiring access to the private key
   txb.signInput(0,keyPair);

   // Once signed, you can build and serialize the transaction
   const transaction = txb.finalizeInput(0).extractTransaction();

   // return the serialized raw transaction output as a hex
    return {"txt_hex":transaction.toHex()};

  } catch (error) {

    // error.response ? error.response.data : error.message
    return {"error":'Failed transaction: ' +  error.message,"raw":rawUTXOHex};
  }



}

// after completing the test of sendBTC: this was the response
//{
//   "txt_id": "7e44429a375f7c9b4b71342a2284b271045eef27d1b6b231840d6138d4746bd8",
//   "hex_contructed_txt": {
//       "txt_hex": "020000000145e03ae1c39a3adaffaf44f4dbf97982170fc5ee1a62864fbf8c8b97a30518a3000000006b483045022100e07e2f46baf7871eb39f21ef96c567b7196375036c412d7ee5d30ccda54b936702205268d5a0da79f91f725cc4ccc320f3891b0fbf36dba92a547b4999ccf1a1494701210324077e816ee97a2ed9c27ad305b5be86200cd161ad36901e5ad4fb3d2e48f11dffffffff01e80300000000000017a9141c99440e4938b969f26e3792f85b457c0365625b8700000000"
//   }
// }

// This sends bitcoin with bytesEncoding: 010101029301038801027693010487
const sendBTC = async (amount,redeemScriptHex) => {

   // get the raw transaction hex for broadcasting 
   const hex = await getTransactionRawHex(amount,redeemScriptHex);
  
   // now broadcast the transaction to the network
    try {
      if(hex["txt_hex"] === undefined) throw new Error(hex["error"]);
      const response = await axios({
        method: 'POST',
        url: 'https://blockstream.info/testnet/api/tx',
        data: hex["txt_hex"],
        headers: { 'Content-Type': 'text/plain' },
      });
  
      return {'txt_id':response.data,"hex_contructed_txt":hex};
    } catch (error) {
      // error.response ? error.response.data : error.message
      return {"error":'Failed to broadcast transaction:' +   error.message + " " + hex["error"]};
    }

};
      


// get the redeem script hex
const txtToBtrustPreimage = (amount,preimage) => {


  
const network = bitcoin.networks.regtest;


// Preimage
const preimageHash = crypto.createHash('sha256').update(preimage).digest('hex');

// Redeem script: OP_SHA256 <lock_hex> OP_EQUAL
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_SHA256,
  preimageHash,
  bitcoin.opcodes.OP_EQUAL,
]);


const p2sh = bitcoin.payments.p2sh({ // Destination address
     redeem: { output : redeemScript },
     network: network
  });
   
  // the recipient address 2MwDHax5L9jXVGmnhN2YECEx63ickZaf7n9
  const recipientAddress = p2sh.address;


  // on bash 
  //bitcoin-cli createrawtransaction '[{"txid":"868b2ca699a2cd9d3ec279f4fe3aed1568821db25eeb6b80c37a34813ed4ce43", "vout":0}]' '{"2MwDHax5L9jXVGmnhN2YECEx63ickZaf7n9":0.10000000, "bcrt1qu52656mwk9l4ptzt6jruckcwzrynfaygf4qqtr":49.8999100}'

  //bitcoin-cli createrawtransaction '[{"txid":"76a003419d40a2c3dc4edde192b7cd2db9f32d0f63d317318f7e517c509ed3c0", "vout":0}]' '{"bcrt1qk3hgrc8dg0tqztuvkk8zgk3x7n2asfpwr6qajz":0.10000000, "bcrt1q92j94gnx04477e0cuf726huv5tnq558dnks3sp":49.8999100}'


  // which yielded this below:
  //020000000143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48800000000

  // then 
  // bitcoin-cli signrawtransactionwithwallet "020000000143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48800000000"

  // which yielded this below:
  // {
  //   "hex": "0200000000010143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48802473044022034e5018f708f75b9d90094dda97fcd4ba4929cf2ef9484362afa372a4594f6bc02203bcbe2d72960e28b84b8fea5a56610770ff63399a3248663e8879ec5198961f0012103982a7caa4174728f76223c2f68c188b69fc06c785517bca3c121561e3fb2a6c400000000",
  //   "complete": true
  // }

  // then
  // bitcoin-cli sendrawtransaction "0200000000010143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48802473044022034e5018f708f75b9d90094dda97fcd4ba4929cf2ef9484362afa372a4594f6bc02203bcbe2d72960e28b84b8fea5a56610770ff63399a3248663e8879ec5198961f0012103982a7caa4174728f76223c2f68c188b69fc06c785517bca3c121561e3fb2a6c400000000"

  // which yielded this below:
  // aa3fa360386a20eb583890e26ed18e1aa782e29fd54f27c3fe033fc4153bcd4b
}



// create a keypair 
const createKeyPair = (source,value,network) => {


  let createdKeyPair = {};

  switch (network) {
    case "mainnet":
      network = bitcoin.networks.mainnet;
      break;
    case "signet":
      network = bitcoin.networks.signet;
      break;
  
    default : network = bitcoin.networks.testnet;
      break;
  }



  switch (source) {
    case "privkey":
      createdKeyPair = ECPair.fromPrivateKey(Buffer.from(value,"hex"))
      break;

    case "pubkey":
      createdKeyPair = ECPair.fromPublicKey(Buffer.from(value,"hex"))
      break;

    case "wif":
      createdKeyPair = ECPair.fromWIF()
      break;

    case "random":
      createdKeyPair = ECPair.makeRandom({network: network})
      break;


  }
 

  return {"privateKey":createdKeyPair.privateKey.toString('hex'),'publicKey':createdKeyPair.publicKey.toString('hex'),'wif':createdKeyPair.toWIF()};



}

export { getTransactionRawHex , stackEvaluation , parseTransaction  ,hexFromPreimage  , sendBTC , txtToBtrustPreimage, createKeyPair  }
