



class RawTransactionBuilder {
  constructor(rawHex) {
    this.rawHex = rawHex;
    this.cursor = 0; // To keep track of the parsing position
  }

  // Method to read bytes and move the cursor
  readBytes(n) {
    const bytes = this.rawHex.substring(this.cursor, this.cursor + n * 2);
    this.cursor += n * 2;
    return bytes;
  }

  // Convert hex to little-endian format
  hexToLE(hex) {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result = hex.substring(i, i + 2) + result;
    }
    return result;
  }

  // Convert hex to decimal
  hexToDec(hex) {
    return parseInt(this.hexToLE(hex), 16);
  }

  build() {
    const transaction = {
      version: null,
      inputs: [],
      outputs: [],
      locktime: null,
      // Additional fields like transaction type, hash, etc. can be added here
    };

    // Parse version
    transaction.version = this.hexToDec(this.readBytes(4));

    // If the transaction is a SegWit transaction, it will have a marker and flag byte here
    // For simplicity, this example does not handle SegWit transactions

    // Parse inputs
    const inputCount = this.hexToDec(this.readBytes(1)); // Assuming a compact size uint for input count
    for (let i = 0; i < inputCount; i++) {
      const input = {
        txid: this.readBytes(32),
        vout: this.hexToDec(this.readBytes(4)),
        scriptSig: null, // Placeholder, real parsing needed
        sequence: this.hexToDec(this.readBytes(4)),
      };
      // Skip scriptSig for simplicity
      transaction.inputs.push(input);
    }

    // Parse outputs (simplified)
    const outputCount = this.hexToDec(this.readBytes(1));
    for (let i = 0; i < outputCount; i++) {
      const output = {
        value: this.hexToDec(this.readBytes(8)),
        scriptPubKey: null, // Placeholder, real parsing needed
      };
      // Skip scriptPubKey for simplicity
      transaction.outputs.push(output);
    }

    // Parse locktime
    transaction.locktime = this.hexToDec(this.readBytes(4));

    return transaction;
  }
}

// // Example usage
// const rawHex = "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff080415112a1c02c100ffffffff0100f2052a01000000434104a9d6840fdd1497b3067b8066db783acf90bf42071a38fe2cf6d2d8a04835d0b5c45716d8d6012ab5d56c7824c39718f7bc7486d389cd0047f53785f9a63c0c9dac00000000";
// const builder = new RawTransactionBuilder(rawHex);
// const parsedTransaction = builder.build();
// console.log(parsedTransaction);


export default RawTransactionBuilder;