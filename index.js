import Visualization from 'zeppelin-vis'
import AdvancedTransformation from 'zeppelin-tabledata/advanced-transformation'

import Highcharts from 'highcharts/highcharts'
require('highcharts/highcharts-more.js')(Highcharts)
require('highcharts/modules/exporting')(Highcharts);

import { CommonParameter, createRangeChartDataStructure, createRangeChartOption, } from './chart/range'
import { ComparativeParameter, createComparativeChartDataStructure, createComparativeOption, } from './chart/comparative'

export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    const spec = {
      charts: {
        'range': {
          transform: { method: 'array', },
          sharedAxis: false,
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'aggregator', minAxisCount: 2, maxAxisCount: 2, },
            'yAxis': { dimension: 'multiple', axisType: 'key', minAxisCount: 1, },
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        },

        'comparative': {
          transform: { method: 'array', },
          sharedAxis: false,
          axis: {
            'xAxis': { dimension: 'single', axisType: 'aggregator', minAxisCount: 1, },
            'yAxis': { dimension: 'multiple', axisType: 'key', },
            'binomial': { dimension: 'single', axisType: 'group', minAxisCount: 1, },
          },
          parameter: ComparativeParameter,
        },
      },
    }

    this.transformation = new AdvancedTransformation(config, spec)
  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.destroy() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  drawRangeChart(parameter, column, transformer) {
    if (column.aggregator.length !== 2) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, keyNames, selectors, } = transformer()

    const data = createRangeChartDataStructure(rows, selectors, keyNames)
    const chartOption = createRangeChartOption(data, parameter, keyNames)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  drawComparativeChart(parameter, column, transformer) {
    if (column.aggregator.length === 0 || column.group.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, keyNames, selectors, } = transformer()

    const data = createComparativeChartDataStructure(rows, selectors, keyNames)
    const chartOption = createComparativeOption(Highcharts, data, parameter, keyNames)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
    this.keepYAxisCenterAsZero(this.chartInstance)
  }

  keepYAxisCenterAsZero(chart) {
    // http://stackoverflow.com/questions/17087704/highcharts-keep-zero-centered-on-y-axis-with-negative-values
    let dExt;
    const ext = chart.yAxis[0].getExtremes();
    const dMax = Math.abs(ext.dataMax);
    const dMin = Math.abs(ext.dataMin);
    dMax >= dMin ? dExt = dMax : dExt = dMin;
    const min = 0 - dExt;
    chart.yAxis[0].setExtremes(min, dExt);
  }

  showError(error) {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 300">
            <span style="font-size:30px; color: #e4573c;">
                ${error.message}
            </span>
        </div>`
  }

  render(data) {
    const {
      chartChanged, parameterChanged,
      chart, parameter, column, transformer,
    } = data

    if (!chartChanged && !parameterChanged) { return }

    try {
      if (chart === 'range') {
        this.drawRangeChart(parameter, column, transformer)
      } else if (chart === 'comparative') {
        this.drawComparativeChart(parameter, column, transformer)
      }
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  refresh() {
    try {
      this.chartInstance && this.chartInstance.setSize(this.targetEl.width())
    } catch (e) {
      console.warn(e)
    }
  }

  getTransformation() {
    return this.transformation
  }
}


