import React from 'react'

import { Consumer } from './Container'
import Block from './Block'

const component = ({ blocks }) => (
  <div className="Blockchain">
    {blocks
      .reduce(
        (acc, block, idx) => [
          <Block {...block} key={2 * idx} />,
          <div className="Blockchain__Separator" key={2 * idx + 1} />,
          ...acc
        ],
        []
      )
      // Removing the last separator
      .slice(0, -1)}
    <div className="Blockchain__Pusher" />
  </div>
)
export default () => <Consumer>{component}</Consumer>
