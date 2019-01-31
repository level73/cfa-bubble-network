import * as d3                          from 'd3'
import Network                          from './network'
import { hexToRGB }                     from '../utils/helpers'
import throttle                         from '../utils/throttle'
import { state }                        from '../index.js'

class NetworkCanvas extends Network {
    constructor(data) {
        super()
        this.canvas = null
        this.customBase = null
        this.custom = null
        this.data = data
    }

    init() {
        super.init()
        this.setupCanvas()
        this.databind()
        this.draw()
        this.mouseEvents()

        throttle('resize', 'resize.network')
        this.$window.on('resize.network', () => {
            this.resize()
        })
    }

    switchMode() {
        super.switchMode()
        this.refreshCanvas()
    }

    resize() {
        super.resize()

        this.canvas.attr('width', this.width * 2)
            .attr('height', this.height * 2)

        this.refreshCanvas()
    }

    setupCanvas() {
        this.width = this.$container.outerWidth()
        this.height = this.$container.outerHeight()
        this.canvas = d3.select('.network__canvas-container')
            .append('canvas')
            .classed('network__canvas', true)
            .attr('width', this.width * 2)
            .attr('height', this.height * 2)
        this.customBase = document.createElement('custom')
        this.custom = d3.select(this.customBase)
    }

    databind() {
        let join = this.custom.selectAll('custom.line')
            .data(this.linesArray)

        const canvasLeft = this.$canvas.offset().left

        let enterSel = join.enter()
            .append('custom')
            .attr('class', 'line')
            .attr('id', (d) => d.from)
            .attr('x1', (d) => {
                let $entry = $('#entry-' + d.from)
              //  console.log($entry)
                return 2 * Math.floor($entry.offset().left + this.entryWidth / 2 - canvasLeft) + 0.5
            })
            .attr('y1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return 2 * Math.floor($entry.offset().top - this.$container.offset().top + 11 + this.entryHeight / 2) + 0.5
            })
            .attr('x2', (d) => {
                return 2 * Math.floor($(`#entry-${d.to}`).offset().left + this.entryWidth / 2 - canvasLeft) + 0.5
            })
            .attr('y2', (d) => {
                return 2 * Math.floor($(`#entry-${d.to}`).offset().top - this.$container.offset().top + 11 + this.entryHeight / 2) + 0.5
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d) => {
                let color = this.colorLines
                if (d.status === 'active') {
                    color = this.colorLinesHover
                }

                let opacity = 1
                if (d.status === 'hidden') {
                    opacity = 0
                }

                return hexToRGB(color, opacity)
            })

        join.merge(enterSel)
            .transition()
            .attr('x1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return 2 * Math.floor($entry.offset().left + this.entryWidth / 2 - canvasLeft) + 0.5
            })
            .attr('y1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return 2 * Math.floor($entry.offset().top - this.$container.offset().top + 11 + this.entryHeight / 2) + 0.5
            })
            .attr('x2', (d) => {
                return 2 * Math.floor($(`#entry-${d.to}`).offset().left + this.entryWidth / 2 - canvasLeft) + 0.5
            })
            .attr('y2', (d) => {
                return 2 * Math.floor($(`#entry-${d.to}`).offset().top - this.$container.offset().top + 11 + this.entryHeight / 2) + 0.5
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d) => {
                let color = this.colorLines
                if (d.status === 'active') {
                    color = this.colorLinesHover
                }

                let opacity = 1
                if (d.status === 'hidden') {
                    opacity = 0
                }

                return hexToRGB(color, opacity)
            })
    }

    draw() {
        // build context
        let context = this.canvas.node().getContext('2d')

        // clear canvas
        context.clearRect(0, 0, this.width * 2, this.height * 2)

        const elements = this.custom.selectAll('custom.line')

        elements.each(function() { // for each virtual/custom element...
            const node = d3.select(this)
            context.strokeStyle = node.attr('stroke')
            context.lineWidth = node.attr('stroke-width')
            context.beginPath()
            context.moveTo(node.attr('x1'), node.attr('y1'))
            context.lineTo(node.attr('x2'), node.attr('y2'))
            context.stroke()
        })
    }

    refreshCanvas(callback = false) {
        this.databind()

        let t = d3.timer((elapsed) => {

            this.draw()

            if (elapsed > 350) {
                t.stop()

                if (callback !== false) {
                    callback()
                }
            }
        })
    }

    mouseEnter($entry) {
        let colorsHover = Object.values(state.key_colors_selected)
        const id = $entry.data('id')
        $entry.find('.network__sending, .network__receiving').css('background', colorsHover[this.mode])

        for(let i = 0; i < this.linesArray.length; i++) {
            let entry = this.linesArray[i]
            if (this.mode === 0) {
                if (entry.from === id || (entry.to === id && entry.bilateral)) {
                    this.linesArray[i].status = 'active'
                }
            } else {
                if (entry.to === id || (entry.from === id && entry.bilateral)) {
                    this.linesArray[i].status = 'active'
                }
            }
        }
        this.refreshCanvas()
    }

    mouseLeave() {

        let colors = Object.values(state.key_colors)
        this.$circles.css('background', colors[this.mode])
        for(let i = 0; i < this.linesArray.length; i++) {
            if (this.linesArray[i].status !== 'hidden') {
                this.linesArray[i].status = 'neutral'
            }
        }
        this.refreshCanvas()
    }

    mouseEvents() {
        this.$entries.on('mouseenter', (e) => {
            this.mouseEnter($(e.currentTarget))
        })

        this.$entries.on('mouseleave', () => {
            this.mouseLeave()
        })

        this.$entries.on('click.select', (e) => {
            const $entry = $(e.currentTarget).addClass('active')
            const id = $entry.data('id')

            super.click($entry, id)

            for(let i = 0; i < this.linesArray.length; i++) {
                const d = this.linesArray[i]
                if(this.mode === 0) {
                    if (d.from !== id && (d.to !== id || !d.bilateral)) {
                        this.linesArray[i].status = 'hidden'
                    }
                } else {
                    if (d.to !== id && (d.from !== id || !d.bilateral)) {
                        this.linesArray[i].status = 'hidden'
                    }
                }
            }

            this.refreshCanvas()

            this.$active.on('click.deselect', () => {
                this.deselect()
            })

            $('.network__entry.hide').on('click.deselect', () => {
                this.deselect()
            })
        })
    }

    deselect() {
        super.deselect()

        for(let i = 0; i < this.linesArray.length; i++) {
            this.linesArray[i].status = 'neutral'
        }

        this.refreshCanvas(this.mouseEvents.bind(this))
    }
}

export default NetworkCanvas
