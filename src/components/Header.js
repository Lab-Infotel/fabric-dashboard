import React from 'react'

import logo from '../logo_infotel.png'
import { Consumer } from './Container'
import Graph from './Graph'

const component = ({ channel, blocks, lastUpdated, loading }) => (
  <div className="Header">
    <h1 className="Header__Title">
      Fabric channel:{' '}
      <span className="Header__Title__Value">{channel.name}</span>
    </h1>
    <div className="Header__Status">
      Status:
      {loading ? (
        <span className="Header__Status__Description Header__Status__Description--loading">
          Loading...
        </span>
      ) : (
        <span className="Header__Status__Description Header__Status__Description--loaded">
          Up to date
        </span>
      )}
    </div>

    <div className="Header__LastUpdate">
      Last data update:
      <span className="Header__LastUpdate__Time">
        {new Date(lastUpdated).toLocaleTimeString('fr-FR')}
      </span>
    </div>

    <div className="Header__Length">
      <i className="fas fa-cube" />
      <span>
        {blocks.length} block{blocks.length ? 's' : ''}
      </span>
    </div>

    <div className="Header__Orderers">
      <i className="fas fa-server" />
      <span>
        {channel.orderers ? channel.orderers.length : 0} orderer{channel.orderers &&
        channel.orderers.length > 1
          ? 's'
          : null}
        {channel.orderers
          ? channel.orderers.map((orderer, idx) => (
              <div key={idx}>{orderer.url}</div>
            ))
          : null}
      </span>
    </div>

    <div className="Header__Peers">
      <i className="fas fa-server" />
      <span>
        {channel.peers ? channel.peers.length : 0} peer{channel.peers &&
        channel.peers.length > 1
          ? 's'
          : null}
        {channel.peers
          ? channel.peers.map((peer, idx) => <div key={idx}>{peer.url}</div>)
          : null}
      </span>
    </div>

    <div className="Header__Graph">
      <Graph blocks={blocks} />
    </div>

    <div className="Header__Logo">
      <img src={logo} alt="infotel" />
    </div>
  </div>
)

export default () => <Consumer>{component}</Consumer>
