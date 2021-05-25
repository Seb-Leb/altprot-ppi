import React, { useState } from 'react';
import { Grid, Container } from '@material-ui/core';
import * as data from './data/nodes_clusters.json';
import Fuse from 'fuse.js';
import TreeView from 'react-simple-jstree';
import SubnetDisplay from './Components/SubnetDisplay';

function App(){
  const nodes = data.nodes
  const node_attrs = data.node_attrs
  const adj_list = data.adj_list
  const clusters = data.clusters
  const dummy_data = {
    data: {
      core: {
        data: [
          {

          }
        ]
      }
    },
    selected: [],
  };

  const CyState = {
    w: 800,
    h: 500,
    elements : []
  }

  const [query, updateQuery] = useState('');
  const [details, showDetails] = useState(dummy_data);
  const [cyState, setCyState] = useState(CyState);
  const [subnetTitle, setSubnetTitle] = useState('');
  const [OPlink, setOPlink] = useState('');

  const fuse = new Fuse(nodes, {
    keys: [
      'node_label',
      'clust_go',
      'node_type',
    ],
    includeScore: true
  })

  const results = fuse.search(query, {limit: 30})
  const nodeResults = results.map(node => node.item);

  function onSearch({ currentTarget }) {
    updateQuery(currentTarget.value);
  }

  function updateCyState(cluster) {
    const clust_name = "cluster#"+cluster.toString()
    const data = clusters[clust_name].cytoscape

    CyState.elements = data.elements
    setCyState(CyState);
  }

  function secondNeighb(node) {
    const firstNeighNodes = adj_list[node]

    const firstNeighb = firstNeighNodes.map(targetNode => {
      let obj = {}
      obj["data"] = {source: node, target: targetNode}
      return obj
    })
    const secondNeighb = firstNeighNodes.map(targetNode => {
      const secondNeighNodes = adj_list[targetNode]
      let secondNeighb = secondNeighNodes.map(targetSecondNode => {
        let obj = {}
        obj["data"] = {source: targetNode, target: targetSecondNode}
        return obj
      })
      return secondNeighb
    })
    const nodeAttrs = firstNeighNodes.map(targetNode => {
      const secondNeighNodes = adj_list[targetNode]
      let secondNodesAttrs = secondNeighNodes.map(secondNode => {
        let obj = {}
        obj["data"] = {label: secondNode, node_type:node_attrs[secondNode]["node_type"], id: secondNode}
        return obj
      })
      secondNodesAttrs.push({data: {label: targetNode, node_type: node_attrs[targetNode]["node_type"], id: targetNode}})
      return secondNodesAttrs
    })
    nodeAttrs.push({data: {label: node, node_type: node_attrs[node]["node_type"], id: node}})

    const graph = {
      edges:secondNeighb.flat(1),
      nodes:nodeAttrs.flat(1)
    }

    CyState.elements = graph
    setCyState(CyState);
  }

  function getDetails(cluster) {
    if (! Number.isInteger(cluster)){
      showDetails(dummy_data);
      const title =  "second neighborhood " + cluster
      setSubnetTitle(title);
    } else {
      const clust_name = "cluster#"+cluster.toString()
      const data = clusters[clust_name].jstree_go_data
      const state = {
        data:{
          core:{
            data:data
          }
        }
      }
      showDetails(state);
      setSubnetTitle(clust_name);
    }
  }
  function clusterButton(cluster) {
    return(
    <button onClick={ () => {getDetails(cluster); updateCyState(cluster)}}>Cluster#{ cluster }</button>
    );
  }
  return(
    <Container  fixed>
    <Grid container>
      <h1>Proteome wide PPI network with alternative proteins</h1>
      <p>This page allows the exploration of results derived  from the re-analysis of raw AP-MS data from the <a href="https://bioplex.hms.harvard.edu/">BioPlex 2.0</a> using proteome annotations  provided by <a href="https://openprot.org">OpenProt</a>. For more details on methodology and results see <a href="https://www.biorxiv.org/content/10.1101/2020.12.02.406710v2">our pre-print</a>. For data and code for this page see <a href="https://github.com/Seb-Leb/ppi_explorer">github</a>.</p>
    </Grid>
    <Grid container style={{ backgroundColor: '#ffff' }}>
      <Grid item xs={3}>
        <div>Search gene or function</div>
        <form className="search">
          <input type="text" value={query} onChange={onSearch} />
        </form>
        <ul className="nodes">
        {nodeResults.map(node => {
          const { node_label, cluster, node_type } = node;
          var cluster_button = ""
          if (Number.isInteger(cluster)) {
            cluster_button = clusterButton(cluster)
          } else {
            cluster_button = ''
          }
          return (
            <ul className="node-meta">
              <div className="degree-circle">{node_attrs[node_label].degree}</div>
              <button className={ node_type } onClick={ () => {getDetails(node_label); secondNeighb(node_label)}}>{ node_label }</button>
              {cluster_button}
            </ul>
          )
        })}
        </ul>
      </Grid>
      <Grid item xs={9}>
        <Grid container>
          <Grid item xs={4}>{ subnetTitle }</Grid>
          <Grid item xs={2}>{ OPlink }</Grid>
          <Grid item xs={6} align={"right"}>
            <span className="dot ref-bait"></span> refProt bait, <span></span>
            <span className="dot ref-prey"></span> refProt prey, <span></span>
            <span className="dot alt-prey"></span> altProt prey
          </Grid>
        </Grid>
        <SubnetDisplay state={ cyState } OPlinkfun={ setOPlink }/>
        <div>Gene Ontology</div>
        <TreeView treeData={ details.data }/>
      </Grid>
    </Grid>
    </Container>
  );
}

export default App;