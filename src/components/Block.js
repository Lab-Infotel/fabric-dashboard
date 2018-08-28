import React from 'react'

import logo from '../logo_hyperledger.png'

export default ({ header, data }) => (
  <div className="Block">
    <img src={logo} alt="Hyperledger Fabric" className="Block__Logo" />

    <div className="Block__Number">
      Block #{header.number}
      {parseInt(header.number) === 0 ? ' : Genesis Block' : null}
    </div>

    <div className="Block__Hash">
      Data hash: <span className="Block__Hash__Value">{header.data_hash}</span>
    </div>

    <div className="Block__PreviousHash">
      Previous block hash:
      <span className="Block__PreviousHash__Value">
        {parseInt(header.number) === 0 ? 'None' : header.previous_hash}
      </span>
    </div>

    <div className="Block__Transactions">
      Transactions amount:
      <span className="Block__Transactions__Value">
        {parseInt(header.number) === 0 ? 0 : data.data.length}
      </span>
    </div>
  </div>
)
