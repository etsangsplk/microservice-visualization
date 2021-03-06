import * as d3 from 'd3'

import { SystemRenderer } from '../SystemRenderer'
import { NodeFocusser } from '../domain/NodeFocusser'
import { NodeCollapser } from '../domain/NodeCollapser'
import { GraphService } from '../domain/service'
import { NodeActions } from '../ui/NodeActions'

export class MenuActions {
  private nodeFocusser: NodeFocusser
  private nodeCollapser: NodeCollapser

  constructor(private systemRenderer: SystemRenderer, private graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
    this.nodeCollapser = new NodeCollapser()
  }

  install() {
    this.registerMenuHandlers()
  }

  registerMenuHandlers() {
    d3.select('#info-link').on('click', () => {
      const infoElement = d3.select('#info')
      const currentDisplay = infoElement.style('display')
      infoElement.style('display', currentDisplay === 'none' ? 'block' : 'none')
    })

    d3.select('#complete-link').on('click', () => {
      this.systemRenderer.renderSystem(this.graphService.getGraph())
      new NodeActions(this.systemRenderer, this.graphService).install()
    })

    d3.select('#cabinets-link').on('click', () => {
      const collapsedGraph = this.nodeCollapser.collapseContainedNodes(this.graphService.getGraph())
      this.systemRenderer.renderSystem(collapsedGraph)
      new NodeActions(this.systemRenderer, this.graphService).install()
    })
  }
}
