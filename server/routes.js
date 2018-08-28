const { channelPromise } = require('./fabric/init')
const {
  getBlocksNumber,
  getBlockById,
  getAllBlocks,
  getPeers,
  getChannelName,
  getOrderers
} = require('./fabric/utils')

const length = async res => {
  try {
    const channel = await channelPromise
    const chainLength = await getBlocksNumber(channel)

    res.status(200).json({ chainLength })
  } catch (error) {
    res.status(400).json(error)
  }
}

const filterBlock = ({ header, data }) => {
  if (header.number == 0) {
    return { header }
  }

  const filteredBlock = {
    header,
    data: {
      data: data.data.map(({ payload }) => ({
        payload: {
          header: { channel_header: payload.header.channel_header },
          data: {
            actions: payload.data.actions.map(({ payload }) => ({
              payload: {
                action: {
                  proposal_response_payload: {
                    proposal_hash:
                      payload.action.proposal_response_payload.proposal_hash
                  },
                  endorsements: payload.action.endorsements.map(
                    ({ endorser }) => ({ endorser })
                  )
                }
              }
            }))
          }
        }
      }))
    }
  }
  return filteredBlock
}

const blocks = async (res, { blockId = null, filtered = false } = {}) => {
  try {
    const channel = await channelPromise
    const chainLength = await getBlocksNumber(channel)

    if (blockId || blockId === 0) {
      if (blockId > chainLength - 1) {
        res.status(404).json({ error: `Block #${blockId} does not exist` })
      } else {
        const unfilteredBlock = await getBlockById(channel, blockId)
        if (filtered) {
          res.status(200).json(filterBlock(unfilteredBlock))
        } else {
          res.status(200).json(unfilteredBlock)
        }
      }
    } else {
      const unfilteredBlocks = await getAllBlocks(channel, chainLength)
      if (filtered) {
        const filteredBlocks = unfilteredBlocks.map(filterBlock)
        res.status(200).json(filteredBlocks)
      } else {
        res.status(200).json(unfilteredBlocks)
      }
    }
  } catch (error) {
    res.status(400).json(error)
  }
}

const channel = async res => {
  try {
    const channel = await channelPromise

    res.status(200).json({
      name: getChannelName(channel),
      orderers: getOrderers(channel),
      peers: getPeers(channel)
    })
  } catch (error) {
    res.status(400).json(error)
  }
}

module.exports = { length, blocks, channel }
