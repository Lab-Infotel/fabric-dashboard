# CONFIGURATION AND PREREQUISITES

1.  `src/config.json` (Front-end configuration)
    - URL
      (string)
      Should be the IP address of your server e.g. "http://192.168.0.10"
    - PORT
      (integer)
      Should be equal to the port the server is running on
2.  `.env` (Back-end configuration)
    - PORT
      (integer)
      Should be equal to the port the server is running on
    - FABRIC
      (bool)
      Should be true when used with Hyperledger Fabric.
      Should be false during development of the Front-end without access to Hyperledger Fabric.
    - USE_PERSISTENCE
      (bool)
      Should be true when Authentication with the network should store certificates or used previously stored certificates to register to the network
3.  `connection.yml`
    Composer-client support json and yaml connection profiles.
    By default, composer creates a json connection profile located at `~/.composer-connection-profiles/hlfv1/connection.json`.
    We found more success using a YAML file. You can find an example of such configuration file at `example-connection.yml`
4.  `crypto-config` folder
    Please copy the `crypto-config` folder at the root of the fabric-dashboard project
    This folder can usually be found in the following directory:
    `./composer-data/<<NETWORK NAME>>/fabric-scripts/hlfv1/composer/crypto-config`

_Note :_
This project is based on Hyperledger Fabric v1.0 and was not tested with Fabric v1.1 and will probably not work with the latter.

# BUILDING AND RUNNING

Prerequisite: `yarn`

Back-end (dev): `yarn server-dev` (Prerequisite: `yarn build` to build front-end)
Front-end(dev): `yarn start` (This does not launch the back-end, hence the API will not be launched)

Back-end (deploy): 1. `yarn build` 2. `yarn build-server` 3. `yarn start-server`

Front-end: 1. `yarn build` (result app in `./build/` folder)

## PLEASE NOTE:

A recurring error occurs due to background processes still using your defined PORT:

```events.js:183
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE :::<<YOUR PORT NUMBER HERE>>
[...]
```

FIX:
`kill $(lsof -ti :<<YOUR PORT NUMBER HERE>>)`
This command has a specific set of skills, and it will find and kill the process using your PORT.
Add `sudo`s for maximum firepower.

# API ROUTES

- `http://<URL>:<PORT>/api/channel` to access the Fabric channel information.
- `http://<URL>:<PORT>/api/blocks` to access the list of all blocks and `http://<URL>:<PORT>/api/blocks/<BLOCK_ID>` to access a specific one.
- `http://<URL>:<PORT>/api/filtered/blocks` and `http://<URL>:<PORT>/api/filtered/blocks/<BLOCK_ID>` to access a lightweight version of the previous endpoints (as the blocks contain whole strings of chaincode bytecode, each block's data can get quite heavy).

# PROJECT STRUCTURE

The root folder for the project, when it is ready to run, has the following structure:

```bash
.
├── build
├── connection.yml
├── crypto-config
├── lib
├── node_modules
├── package.json
├── public
├── README.md
├── server
├── src
└── yarn.lock
```

## `build`

The folder containing the transpiled frontend code. Nothing special here.

## `connection.yml`

This file is the key to connect the Fabric network to the dashboard. Its structure is detailed in the Fabric documentation, but an example is provided below :

```yaml
name: "hlfv1"
type: "hlfv1"
version: "1.0"
client:
  organization: <ORG_NAME>
  credentialStore:
    path: "./hfc-key-store"
    cryptoStore:
      path: "./hfc-key-store"
channels:
  <CHANNEL_NAME>:
    orderers:
      - <ORDERER_NAME>.<DOMAIN>.com
    peers:
      <PEER_NAME>.<ORG_NAME>.<DOMAIN>.com:
        endorsingPeer: true
        chaincodeQuery: true
        ledgerQuery: true
        eventSource: true
organizations:
  <ORG_NAME>:
    mspid: <ORG_MSP_NAME>
    peers:
      - <PEER_NAME>.<ORG_NAME>.<DOMAIN>.com
    certificateAuthorities:
      - ca.<DOMAIN>.com
    adminPrivateKey:
      path: ./crypto-config/peerOrganizations/<ORG_NAME>.<DOMAIN>.com/users/Admin@<ORG_NAME>.<DOMAIN>.com/msp/keystore/<Only file in the folder>
    signedCert:
      path: ./crypto-config/peerOrganizations/<ORG_NAME>.<DOMAIN>.com/users/Admin@<ORG_NAME>.<DOMAIN>.com/msp/signcerts/Admin@<ORG_NAME>.<DOMAIN>.com-cert.pem
orderers:
  <ORDERER_NAME>.<DOMAIN>.com:
    url: <ORDERER_URL>
    grpcOptions:
      ssl-target-name-override: <ORDERER_NAME>.<DOMAIN>.com
      grpc-max-send-message-length: 15
    tlsCACerts:
      path: ./crypto-config/ordererOrganizations/<DOMAIN>.com/msp/tlscacerts/tlsca.<DOMAIN>.com-cert.pem
peers:
  <PEER_NAME>.org1.example.com:
    url: <PEER_URL>
    eventUrl: <PEER_EVENT_URL>
    grpcOptions:
      ssl-target-name-override: <PEER_NAME>.<ORG_NAME>.<DOMAIN>.com
      grpc.keepalive_time_ms: 600000
    tlsCACerts:
      path: ./crypto-config/peerOrganizations/<ORG_NAME>.<DOMAIN>.com/peers/<PEER_NAME>.<ORG_NAME>.<DOMAIN>.com/msp/tlscacerts/tlsca.<ORG_NAME>.<DOMAIN>.com-cert.pem
certificateAuthorities:
  ca.<ORG_NAME>.<DOMAIN>.com:
    url: <CA_URL>
    httpOptions:
      verify: false
    tlsCACerts:
      path: ./crypto-config/peerOrganizations/<ORG_NAME>.<DOMAIN>.com/ca/ca.<ORG_NAME>.<DOMAIN>.com-cert.pem
    registrar:
      - enrollId: <ADMIN_ID>
        enrollSecret: <ADMIN_PASSWORD>
    caName: ca.<ORG_NAME>.<DOMAIN>.com
```

It provides a detailed definition for the Fabric network structure and is given as an argument to the [`FabricClient.loadFromConfig`](https://fabric-sdk-node.github.io/Client.html#.loadFromConfig__anchor) method.

## `crypto-config`

This is the folder generated by the [`cryptogen`](http://hyperledger-fabric.readthedocs.io/en/release-1.1/commands/cryptogen-commands.html) and [`configtxgen`](http://hyperledger-fabric.readthedocs.io/en/release-1.1/commands/configtxgen.html) CLI tools. Having it here allows to have access to all the necessary certificates to communicate with the network.
However, it is not necessary to have it here as it is only used in the `connection.yml` file and can then be located elsewhere, as long as it is properly configured.

## `lib`

The folder containing the transpiled server code. Nothing special here.

## `node_modules`

Just usual stuff.

## `package.json`

Nothing special here.
Scripts to build SCSS files, server code, frontend package and run everything.

## `public`

The base HTML file to serve, and some random files.

## `server`

This folder contains the server code, which is :

- The code allowing to connect to the server and some utilities to make queries once connected.
- The Express app and its routes, for both the API and static file hosting.

In `server/fabric` there are to files :

- `init.js` : mainly handling connection to the network
- `utils.js` : providing some utilities functions to access relevant data in the Fabric network.

Here are the steps run to initialize the connection to the Hyperledger Fabric blockchain:

1.  Load the connection profile (`connection.yml`)
2.  Initialize data stores
3.  If `USE_PERSISTENCE` is false, the client must enroll again with the CA
4.  Register the channel, peers and orderer
5.  Get the genesis block

The `app.js` file gathers all of the tools and creates a minimalist API to display the right data.
There are routes for fetching blocks and channel data.
However, as blocks can contain a lot of information (all the bytes for chaincode for example), we decided to implement filtered endpoints that only sends useful metadata on blocks.

The callback functions for the routes are defined in the `routes.js` file.

## `src`

This folder contains all the React code for the front-end. It's divided in 2 folders : one for the styling, using SCSS files, and another for the React components.

_Note :_
The classnames are defined following the [BEM](http://getbem.com/) syntax.

The components are the following:

### App

```js
import React from 'react'

import Container from './Container'
import Header from './Header'
import Details from './Details'
import Blockchain from './Blockchain'

export default () => (
  <Container>
    <Header />
    <Blockchain />
  </Container>
)
```

This component just gathers other big components, without any logic or display modifications. That's mainly just a wrapper.

### Container

That component handles all the data fetching logic and a small part of global styling.
It uses the Context API from React to allow other components to access it's state.
The said state has the following shape:

```js
const defaultContext = {
  channel: {}, // Channel data, as name, number of blocks, ...
  blocks: [], // List of blocks
  lastUpdate: null, // Last time the data was updated
  loading: true // Is the data currently being loaded ?
}
```

The `updateData` method is responsible for doing an API request to the URL defined in the `config.json` file, updating `lastUpdate` and `loading` values, and trigger the next update 1 minute later, with a `setTimeout` call.

### Header

First of all, as this component needs the data from the API, it has to consume the context set in the container. This is done in the export command:

```js
import React from 'react'

import logo from '../logo_infotel.png'
import { Consumer } from './Container'

import Graph from './Graph'

const component = ({ channel, blocks, lastUpdated, loading }) => (
// ...
)

export default () => <Consumer>{component}</Consumer>
```

Otherwise, this is mainly a display component, which doesn't have any logic. This element also displays the d3 graph.

### Graph

This a "normal" d3 graph, with a small specific detail : to make it work smoothly with React (which uses a shadow DOM while the former directly modifies the real DOM) we used [ReactFauxDOM](https://github.com/Olical/react-faux-dom).

### Blockchain

Displays the list of blocks. Uses Block, which displays data for a single block.
