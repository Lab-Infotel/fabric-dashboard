import React, { Component } from 'react'
import * as d3 from 'd3'
import ReactFauxDOM from 'react-faux-dom'
import { format, eachDay, min, subDays } from 'date-fns'

class Graph extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  areSameDay(date1, date2) {
    return format(date1, 'MM/DD/YYYY') === format(date2, 'MM/DD/YYYY')
  }

  makeData(blocks) {
    let data = []
    blocks.forEach(block => {
      if (block.data)
        block.data.data.forEach(transaction => {
          let date = new Date(
            transaction.payload.header.channel_header.timestamp
          )

          let d = data.find(point => this.areSameDay(point.date, date))
          d ? (d.transactions += 1) : data.push({ date: date, transactions: 1 })
        })
    })
    return this.insertZerosInData(data)
  }

  insertZerosInData(data) {
    if (data.length === 0) {
      return data
    } else {
      let maxDate = new Date()
      let minDate = subDays(maxDate, 60)

      return eachDay(minDate, maxDate).map(date => {
        let d = data.find(point => this.areSameDay(point.date, date))
        return { date: date, transactions: d ? d.transactions : 0 }
      })
    }
  }

  render() {
    let data = this.makeData(this.props.blocks)
    ////////////////////////////////////////////////////////////////////////////////
    // Set top DOM
    ////////////////////////////////////////////////////////////////////////////////
    let fauxSvg = ReactFauxDOM.createElement('svg')
    let svg = d3.select(fauxSvg)
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: -30, bottom: 100, left: 50 }
    let width = 400 - margin.left - margin.right
    let height = 250 - margin.top - margin.bottom

    svg
      .attr('class', 'Graph')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    ////////////////////////////////////////////////////////////////////////////////
    // Draw
    ////////////////////////////////////////////////////////////////////////////////
    let x = d3.scaleTime().range([0, width])
    let y = d3.scaleLinear().range([height, 0])

    x.domain(d3.extent(data, d => d.date))
    y.domain([0, d3.max(data, d => d.transactions)])

    // define the line and area
    let valueline = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.transactions))
    let area = d3
      .area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.transactions))

    svg
      .append('path')
      .data([data])
      .attr('class', 'Graph__Area')
      .attr('d', area)

    svg
      .append('path')
      .data([data])
      .attr('class', 'Graph__Line')
      .attr('d', valueline)

    ////////////////////////////////////////////////////////////////////////////////
    // Add Axes
    ////////////////////////////////////////////////////////////////////////////////
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDay.every(7))
          .tickFormat(d3.timeFormat('%Y-%m-%d'))
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)')

    svg
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(d3.max(data, d => d.transactions)))

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('font-size', '75%')
      .style('text-anchor', 'middle')
      .text('Transactions')

    return fauxSvg.toReact()
  }
}

export default Graph
