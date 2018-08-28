import React, { Component, createContext } from 'react'
import { get } from 'axios'

import { URL, PORT } from '../config.json'

const defaultContext = {
  channel: {},
  blocks: [],
  lastUpdate: null,
  loading: true
}

const Context = createContext(defaultContext)

class Container extends Component {
  constructor(props) {
    super(props)
    this.state = defaultContext
  }

  updateData() {
    this.setState({ loading: true }, () =>
      get(`${URL}:${PORT}/api/filtered/blocks`).then(({ data }) =>
        this.setState(
          {
            blocks: data,
            lastUpdated: Date.now(),
            loading: false
          },
          // Updating data every 60 seconds
          () => setTimeout(this.updateData.bind(this), 60000)
        )
      )
    )
  }

  componentDidMount() {
    get(`${URL}:${PORT}/api/channel`).then(({ data }) =>
      this.setState({
        channel: data
      })
    )

    this.updateData()
  }

  render() {
    return (
      <Context.Provider value={this.state}>
        <div className="Container">{this.props.children}</div>
      </Context.Provider>
    )
  }
}

export const Consumer = Context.Consumer
export default Container
