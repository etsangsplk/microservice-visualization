import * as axios from 'axios'
import 'tachyons/css/tachyons.css'
import './html/style.css'
import * as d3 from 'd3'

import { getBaseUrlInCurrentEnvironment } from './appBaseUrl'

import { GraphService } from './domain/service'
import { Node } from './domain/model'
import { NodeActions } from './ui/NodeActions'
import { MenuActions } from './ui/MenuActions'
import { LoadExampleAction } from './ui/LoadExampleAction'
import { SystemRenderer } from './SystemRenderer'

const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
const systemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
console.log('fetching system from url ' + systemUrl)

// can also use: axios.defaults.baseURL
axios.default
  .get(systemUrl)
  .then((response) => {
    const rawSystem = response.data
    const system = Node.ofRawNode(rawSystem)
    GraphService.deepResolveNodesReferencedInEdges(system)

    const systemRenderer = new SystemRenderer()
    const graphService = new GraphService(system)
    const nodeActions = new NodeActions(systemRenderer, graphService)
    new MenuActions().install()

    systemRenderer.renderSystem(system)
    nodeActions.install()
  })
  .catch((error) => {
    const errorDiv = d3.select('#graph')
      .append('div')
      .classed('f1 pa2 bg-red white', true)

    errorDiv.append('div')
      .text(error)

    errorDiv.append('div')
      .text('Load example')
      .attr('id', 'load-example-link')
      .classed('f5 grow no-underline br-pill ph3 pv2 dib red bg-white clickable', true)

    new LoadExampleAction().install()
  })