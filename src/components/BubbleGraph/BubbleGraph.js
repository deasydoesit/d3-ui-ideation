// External imports
import React, { Component } from 'react';
import * as d3 from 'd3';
import { FlexibleXYPlot, XAxis, YAxis, MarkSeries, Hint } from 'react-vis';
import Waypoint from 'react-waypoint';

// Internal imports
import landData from '../../data/BubbleGraph/land-area-by-country.csv';
import populationData from '../../data/BubbleGraph/population-by-country-2000-2014.csv';
import co2Data from '../../data/BubbleGraph/co2-by-country-2000-2014.csv';
import countryFlags from '../../data/BubbleGraph/country-flags.csv'

import './BubbleGraph.css';

class BubbleGraph extends Component {
  state = {
    countryFlags: null,
    data: null,
    totalPopData: null,
    totalCo2Data: null,
    totalLandData: null,
    value: false,
    year: 2000,
  };

  componentDidMount() {
    Promise.all([
      d3.csv(landData),
      d3.csv(populationData),
      d3.csv(co2Data),
      d3.csv(countryFlags),
    ])
    .then((files) => {
      this.setState({
        totalLandData: files[0],
        totalPopData: files[1],
        totalCo2Data: files[2],
        countryFlags: files[3],
      }, () => {
        this.setState({
          data: this.setData(2000),
        })
      })
    })
  }

  componentDidUpdate() {
    let diameter = [];

    d3.selectAll('circle').each(function() {
        const el = this;
        diameter.push(Math.ceil(d3.select(this).attr('r') * 2 ));
        d3.select(el.parentNode)
          .insert("svg")
          .attr("class", "wrapped")
          .append(function() { return el; });
    })
        .attr('style', (d, i) => `fill: url(#country-${i}) !important` )

    d3.selectAll('.wrapped')
      .append("defs")
      .append('pattern')
        .attr('id', (d, i) => `country-${i}`)
        .attr('width', '100%')
        .attr('height', '100%')
      .append("image")
        .attr("xlink:href", (d, i) => this.state.countryFlags[i]['URL'])
        .attr('width', (d, i) => diameter[i])
        .attr('height', (d, i) => diameter[i])

  }

  setData = year => {
    const { totalCo2Data, totalLandData, totalPopData } = this.state;
    return new Array(36).fill(0).map((row, i) => ({
      Country: totalPopData[i]['Country'],
      x: parseInt(totalCo2Data[i][year]),
      y: parseInt(totalLandData[i].Area),  
      size: parseInt(totalPopData[i][year]), 
    }));
  }

  updateBubbleGraph = year => {
    console.log('hello')
    this.setState({
      data: this.setData(year),
      year: year,
    });
  }

  render() {
    const { data } = this.state;

    const markSeriesProps = {
      animation: true,
      sizeRange: [10, 50],
      seriesId: 'BubbleGraph',
      opacityType: 'literal',
      data,
      onValueMouseOver: value => this.setState({value}),
    };

    return (
      <div>
        <div className='bubble-graph-container'>
          <div>
            {this.state.year}
          </div>
          <FlexibleXYPlot
            margin={{ top:75, bottom:100, left:75}}
            onMouseLeave={() => this.setState({value: false})}
            // width={960}
            // height={600}
            yType='log'
            xType='log'
            xDomain={[15000, 10000000]}
            yDomain={[15000, 30000000]}
            noHorizontalGridLines
            noVerticalGridLines
          >
            <XAxis 
              position="end"
              title="Greenhouse gas emissions (metric tonnes)"
              tickLabelAngle={-45}
              tickSize={4}
              tickFormat={ (value, i, scale, tickTotal) => {
                return `${scale.tickFormat(10, '.0s')(value)}`
              }}
            />
            <YAxis 
              position="end"
              title="Land area (sq. km)"
              tickSize={4}
              tickFormat={ (value, i, scale, tickTotal ) => {
                return `${scale.tickFormat(10, '.0s')(value)}`
              }}
            />
            <MarkSeries {...markSeriesProps} />
            {this.state.value 
              ? <Hint 
                align={{horizontal: 'right', vertical: 'top'}}
                value={this.state.value} 
              /> 
              : null
            }
          </FlexibleXYPlot>
        </div>

        <div className='foo'>
          foo
        </div>

        <Waypoint 
          onEnter={() => this.updateBubbleGraph(2001)}
        />

        <div className='bar'>
          bar
        </div>

        <Waypoint 
          onEnter={() => this.updateBubbleGraph(2002)}
        />

        <div className='foo'>
          foo
        </div>

        <Waypoint 
          onEnter={() => this.updateBubbleGraph(2003)}
        />

        <div className='bar'>
          bar
        </div>

        <Waypoint 
          onEnter={() => this.updateBubbleGraph(2004)}
        />
    
      </div>
    );
  }
}

export default BubbleGraph;
