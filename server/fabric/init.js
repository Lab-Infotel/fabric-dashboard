const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const os = require('os')

const fabricClient = FabricClient.loadFromConfig(
  path.join(process.cwd(), 'connection.yml')
)
console.log('Succesfully loaded configuration with client.')

// Shorthand
const netconfig = fabricClient._network_config._network_config

// Do we load cached connection profile ?
const storePath = path.join(os.homedir(), '.hfc-key-store')
console.log('Key store path:' + storePath)

// Getting the only CA
const ca = Object.values(netconfig.certificateAuthorities)[0]

// use the same location for the state store (where the users' certificate are kept)
// and the crypto store (where the users' keys are kept)
const cryptoStore = FabricClient.newCryptoKeyStore({ path: storePath })
const cryptoSuite = FabricClient.newCryptoSuite()
cryptoSuite.setCryptoKeyStore(cryptoStore)
fabricClient.setCryptoSuite(cryptoSuite)

// be sure to change the http to https when the CA is running TLS enabled
const fabricCAClient = new FabricCAClient(
  ca.url,
  {
    trustedRoots: [],
    verify: false
  },
  ca.name,
  cryptoSuite
)

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
const storePromise = FabricClient.newDefaultKeyValueStore({ path: storePath })

const storeUserPromise = storePromise
  .then(store => {
    // assign the stores to the fabric client
    fabricClient.setStateStore(store)

    return fabricClient.getUserContext('admin', true)
  })
  .then(storeUser => {
    // first check to see if the admin is already enrolled
    if (
      storeUser &&
      storeUser.isEnrolled() &&
      process.env.USE_PERSISTENCE.toLowerCase() === 'true'
    ) {
      console.log('Successfully loaded admin from persistence')
      return storeUser
    } else {
      console.log('Need to enroll admin with CA...')
      return fabricCAClient
        .enroll({
          enrollmentID: 'admin',
          enrollmentSecret: 'adminpw',
          attr_reqs: [
            { name: 'hf.Registrar.Roles' },
            { name: 'hf.Registrar.Attributes' }
          ]
        })
        .then(enrollment => {
          console.log('Successfully enrolled admin user "admin"')
          return fabricClient.createUser({
            username: 'admin',
            mspid: 'Org1MSP',
            cryptoContent: {
              privateKeyPEM: enrollment.key.toBytes(),
              signedCertPEM: enrollment.certificate
            }
          })
        })
        .then(user => {
          return fabricClient.setUserContext(user)
        })
        .catch(err => {
          console.error(
            'Failed to enroll and persist admin. Error: ' + err.stack
              ? err.stack
              : err
          )
          throw new Error('Failed to enroll admin')
        })
    }
  })

const init = storeUserPromise.then(() => {
  const channelName = Object.keys(netconfig.channels)[0]
  const channelConfig = netconfig.channels[channelName]

  const ordererName = channelConfig.orderers[0]
  const ordererConfig = netconfig.orderers[ordererName]

  const channel = fabricClient.newChannel(channelName)
  const orderer = fabricClient.newOrderer(ordererConfig.url)
  channel.addOrderer(orderer)

  const peersNames = Object.keys(channelConfig.peers)
  const peersConfigs = peersNames.map(peerName => netconfig.peers[peerName])
  peersConfigs.map(peerConfig =>
    channel.addPeer(fabricClient.newPeer(peerConfig.url))
  )

  const genesisBlockPromise = channel.getGenesisBlock({
    orderer: orderer,
    txId: fabricClient.newTransactionID(true)
  })

  return { channel, genesisBlockPromise }
})

init.then(() => console.log('Initialisation succesful'))

export const channelPromise = init.then(({ channel }) => channel)
export const genesisBlockPromise = init.then(
  ({ genesisBlockPromise }) => genesisBlockPromise
)
