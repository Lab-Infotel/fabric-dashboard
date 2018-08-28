export const getChannelName = channel => {
  return channel.getName()
}

export const getOrderers = channel => {
  return channel.getOrderers().map(orderer => ({
    url: orderer._url
  }))
}

export const getPeers = channel => {
  const peers = channel.getPeers()

  return peers.map(peer => ({
    url: peer.getUrl()
  }))
}

export const getBlocksNumber = channel => {
  return channel.queryInfo().then(info => info.height)
}

export const getBlockById = (channel, id) => {
  return channel.queryBlock(id)
}

export const getAllBlocks = (channel, blocksNumber) => {
  const blocksPromises = []
  for (let blockId = 0; blockId < blocksNumber; blockId++) {
    blocksPromises.push(getBlockById(channel, blockId))
  }
  return Promise.all(blocksPromises)
}
