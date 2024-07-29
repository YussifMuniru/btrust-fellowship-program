# Tiny Bitcoin Peer Boot Process

## Introduction

The readMe provides an outline pertaining to the key steps involved in the boot process of a Tiny Bitcoin Peer. It will focus on the regtest network. It will highlight basic operations like configuration loading, network initialization, peer discovery and connection(the use of addnode/ connect), blockchain synchronization, and security measures. This explanation will assume multiple instances of regtest nodes on the same machine `localhost=127.0.0.1`. 


## Boot Sequence

### 1. Configuration Loading
- You start by executing the command `bitcoind`(provided you are not using any aliases.).
- The peer begins by loading its configuration settings from a file or environment variables. This includes network settings (mainnet, testnet, or regtest), node operation mode, and any relevant paths for data storage. I am illustrating this on a regtest network. with five nodes(including the default data directory which is  `~/.bitcoin/` directory). The configuration file is located at `~/.bitcoin/bitcoin.conf`. 
- Inside the configuration file you can have a configuratio like this : `addnode=127.0.0.1:18445` and `port=18444`. This will make the node connect to a peer listening on `port 18445`. While it listens on port 18444. 
- Note that `addnode` will leave room for connection to other nodes whilst `connect` only connects to the specific node.



### 2. Network Initialization

- Establishes network parameters based on the selected Bitcoin network (mainnet, testnet, or regtest) for this case regtest.
- The node starts to prepare for both incoming and outgoing connections and number of connections using it's pockets and sockets.


### 3. Peer Discovery

- It initiates processes to find other others. This usually involvesa DNS seed lookup or look ups from a previously caches database. But since I am in regtest, which is a controlled and isolated environment their is a manual configuration to connect to nodes by using either addnode/connect in the `bitcoin.conf` file or in the `command-line`. 


### 4. Connection Establishment

- Now the node attempts to connect to the discovered nodes in networks like mainnet, testnet or signet but for regtest, pre-configured nodes with IP addresses and ports.
- Performs version handshake with connected peers to ensure compatibility.

### 5. Blockchain Synchronization

- Begins the blockchain synchronization process by requesting blocks from connected peers.Even for regtest nodes this is the case. It's just that in a regtest environment, you control how the blocks are created with the `-generate` command.
- Validates transactions and blocks with the consensus rules since regtest is for development purposes. 
- Stores validated blocks locally to maintain the current state of the blockchain.

### 6. Entering Listening Mode

- Once synchronized, the peer enters a listening mode, ready to receive new transactions and blocks. This enables efficient testing of applications in a controlled evironment.
- Continuously monitors the network for new data and propagates valid transactions and blocks to its peers enabling developers to test our blocks are propagated in the real-world. This is ideal for applications that require or depend on network-wide behaviours like transactions propagation, consensus and conflict resolution.

## Security

- Then using the bitcoin protocol rules, it ensure's security by verifying signatures, cryptographic hashes, etc to valid transactions.

