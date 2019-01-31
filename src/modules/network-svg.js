import * as d3                          from 'd3'
import Network                          from './network'
import throttle                         from '../utils/throttle.js'

class NetworkSvg extends Network {
    constructor(data) {
        super()
        // this.$container = $('.network__countries')
        this.svg = null
        this.lines = null
        this.data = data
    }

    init() {
        super.init()
        this.svg = d3.select('.network__svg')
        this.drawLines()
        this.mouseEvents()

        throttle('resize', 'resize.network')
        this.$window.on('resize.network', () => {
            this.resize()
        })
    }

    resize() {
        super.resize()

        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`)
        this.lines
            .attr('x1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return $entry.offset().left + this.entryWidth / 2 - this.$container.offset().left
            })
            .attr('y1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return $entry.offset().top - this.$container.offset().top + 11 + this.entryHeight / 2
            })
            .attr('x2', (d) => {
                return $(`#entry-${d.to}`).offset().left - this.$container.offset().left + this.entryWidth / 2
            })
            .attr('y2', (d) => {
                return $(`#entry-${d.to}`).offset().top - this.$container.offset().top + 11 + this.entryHeight / 2
            })
    }

    drawLines() {
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`)

        let lines = this.svg.selectAll('.entry__line')
            .data(this.linesArray)

        lines.enter()
            .append('line')
            .attr('x1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return $entry.offset().left + this.entryWidth / 2 - this.$container.offset().left
            })
            .attr('y1', (d) => {
                let $entry = $(`#entry-${d.from}`)
                return $entry.offset().top - this.$container.offset().top + 11 + this.entryHeight / 2
            })
            .attr('x2', (d) => {
                return $(`#entry-${d.to}`).offset().left - this.$container.offset().left + this.entryWidth / 2
            })
            .attr('y2', (d) => {
                return $(`#entry-${d.to}`).offset().top - this.$container.offset().top + 11 + this.entryHeight / 2
            })
            .attr('stroke', this.colorLines)
            .attr('stroke-width', 1)
            .attr('class', 'entry__line')

        this.lines = d3.selectAll('.entry__line')
    }

    mouseEnter($entry) {
        const id = $entry.data('id')
        $entry.find('.network__sending, .network__receiving').css('background', this.colorsHover[this.mode])

        this.lines.filter((d) => {
            if (this.mode === 0) {
                return d.from === id || (d.to === id && d.bilateral)
            } else {
                return d.to === id || (d.from === id && d.bilateral)
            }
        })
            .raise()
            .transition()
            .duration(350)
            .attr('stroke', this.colorLinesHover)
    }

    mouseLeave() {
        this.$circles.css('background', this.colors[this.mode])
        this.lines
            .transition()
            .duration(350)
            .attr('opacity', (d) => {
                if (this.mode === 0) {
                    return 1
                } else {
                    if (d.bilateral) {
                        return 1
                    } else {
                        return 0
                    }
                }
            })
            .attr('stroke', this.colorLines)
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

            this.lines
                .filter((d) => {
                    if (this.mode === 0) {
                        return d.from !== id && (d.to !== id || !d.bilateral)
                    } else {
                        return d.to !== id && (d.from !== id || !d.bilateral)
                    }
                })
                .transition()
                .duration(350)
                .attr('opacity', 0)


            this.lines
                .filter((d) => {
                    if (this.mode === 0) {
                        return d.from === id || (d.to === id && d.bilateral)
                    } else {
                        return d.to === id || (d.from === id && d.bilateral)
                    }
                })
                .transition()
                .duration(350)
                .attr('opacity', 1)
                .attr('stroke', this.colorLines)

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

        this.lines
            .transition()
            .duration(350)
            .attr('opacity', 1)
            .attr('stroke', this.colorLines)

        this.mouseEvents()
    }
}

export default NetworkSvg
