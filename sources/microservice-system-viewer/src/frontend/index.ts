import * as axios from 'axios'
import { getBaseUrlInCurrentEnvironment } from '../appBaseUrl'
import { EventRegistrator } from './viewhelper/EventRegistrator'
import 'tachyons/css/tachyons.css'
import './style.css'
import * as d3Base from 'd3'
import { graphviz } from 'd3-graphviz'

import { SystemToDotConverter, Options as ConverterOptions } from '../backend/domain/systemToDot'
import { GraphService } from '../backend/domain/service'
import { Node, INode } from '../backend/domain/model'
import { NodeFocusser } from '../backend/domain/NodeFocusser'

// attach all d3 plugins to the d3 library
const d3 = Object.assign(d3Base, { graphviz })

const queryPart = window.location.href.substr(window.location.href.lastIndexOf('?'))
const systemUrl = getBaseUrlInCurrentEnvironment() + '/system' + queryPart
console.log('fetching system from url ' + systemUrl)

// can also use: axios.defaults.baseURL
axios.default
  .get(systemUrl)
  .then(function(response) {
      // INFO: keeping the state in the backend is not ideal. it would be much better to use react.
      // then each user keeps his own state and can operate on it.
      // however, the backend solution is the one that we can implement the fastest right now
      // in order to allow graph navigation.
    const rawSystem = response.data
    const system = Node.ofRawNode(rawSystem)
    GraphService.deepResolveNodesReferencedInEdges(system)
    const nodeFocusser = new NodeFocusser(new GraphService(system))
    renderSystem(system, nodeFocusser)

    // EventRegistrator.init()
  })
  .catch(function(error) {
    let element: HTMLElement = document.createElement('div')
    element.innerHTML = error
    document.body.appendChild(element)
  })

function renderSystem(system: Node, nodeFocusser: NodeFocusser) {
  const systemToDotConverter = new SystemToDotConverter()

  const transition = d3.transition()
      .delay(100)
      .duration(1000)

  d3.select('#graph')
    .graphviz()
    .transition(transition)
    .renderDot(systemToDotConverter.convertSystemToDot(system))

  const nodes = d3.selectAll('.node,.edge')
  nodes.on('click', function() {
    const id = d3.select(this).attr('id')
    console.log('clicked on ' + id)
    const focusedSystem = nodeFocusser.focusNodeById(id)
    renderSystem(focusedSystem, nodeFocusser)
  })
}
