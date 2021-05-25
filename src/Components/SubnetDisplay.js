import React, { Component } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

export default class SubnetDisplay extends Component {
  
  componentDidMount = () => {
    /*this.setState({
      w: window.innerWidth,
      h: window.innerHeight
    })*/
    this.setUpListeners()
  }

  componentDidUpdate = () => {
    const layout = {name: 'cose', animate: false};
    this.cy.layout(layout).run()
    this.cy.nodes('[tt_type = "alt"]').style('background-color', '#d81159')
    this.cy.nodes('[node_type = "alt-prey"]').style('background-color', '#d81159')
    this.cy.nodes('[node_type = "ref-prey"]').style('background-color', '#2582c6')
    this.cy.nodes('[node_type = "ref-bait"]').style('background-color', '#2535c6')

  }

  setUpListeners = () => {
    this.cy.bind('click', 'node', (event) => {
      console.log(event.target.data().label)
      //<a href='https.openprot.org'>{prot_acc}</a>
      this.props.OPlinkfun(event.target.data().label)
    })
  }

  render() {
    return(
      <div>
        <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements(this.props.state.elements)}
            style={{ width: this.props.state.w, height: this.props.state.h }}
            cy={(cy) => {this.cy = cy}}
        />
      </div>
    )
  }
}