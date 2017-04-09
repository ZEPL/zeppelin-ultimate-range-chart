import {
  CommonParameter,
  getPrecisionFormat,
} from './range'

const p = JSON.parse(JSON.stringify(CommonParameter))
p.dataLabel.defaultValue = false
export const ComparativeParameter = p


export function createComparativeChartDataStructure(rows, selectors, keyNames) {
  const series = []

  // iterate selectors.length == 2, cause selector should be binomial in the comparative chart
  const refinedSelectors = selectors.slice(0, 2)

  for(let i = 0; i < refinedSelectors.length; i++) {
    const s = { name: refinedSelectors[i], data: [], }

    for (let j = 0; j < keyNames.length; j++) {
      let value = rows[i].value[j]
      if (i === 0) { value = -value /** the first series of comparative chart has - values */ }
      s.data.push(value)
    }

    series.push(s)
  }

  console.log(series)

  return series
}

export function createComparativeOption(Highcharts, data, parameter, keyNames) {
  const {
    xAxisName, yAxisName, xAxisUnit, yAxisUnit,
    xAxisPosition, yAxisPosition, legendPosition, legendLayout, rotateXAxisLabel, rotateYAxisLabel,
    showLegend, legendLabelFormat, floatingLegend, dataLabel,
    tooltipPrecision, dataLabelPrecision,
    mainTitle, subTitle,
  } = parameter

  const option = {
    chart: { type: 'bar', },
    lang: { thousandsSep: ',' },
    title: { text: ' ', },
    xAxis: [{
      categories: keyNames, crosshair: true,
      reversed: false,
      labels: { rotation: rotateXAxisLabel, },
    }, {
      categories: keyNames, crosshair: true,
      opposite: true,
      reversed: false,
      linkedTo: 0,
      labels: { rotation: rotateXAxisLabel, },
    }],
    yAxis: {
      labels: {
        rotation: rotateYAxisLabel,
        formatter: function () {
          return Math.abs(this.value) + xAxisUnit /** inverted */
        },
      },
      minorTickInterval: 'auto',
    },
    labels: {},
    legend: { enabled: showLegend, labelFormat: '{name}', },
    tooltip: {
      headerFormat: `
        <span style="font-size: 10px;">Key: {point.key}</span>
          <table style="margin-top: 3px;">`,
      pointFormatter: function() {
        let pointValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.y)
        return `
          <tr><td style="color:${this.series.color};padding:0">${this.series.name}: </td>
          <td style="padding:0"><b>${pointValue}</b>
          </td></tr>
        `
      },
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    series: data,
    plotOptions: {
      series: { stacking: 'normal' }
    },
  }

  if (mainTitle !== '') { option.title.text = mainTitle  }
  if (subTitle !== '') { option.subtitle = { text: subTitle, } }
  if (yAxisName !== '') { option.xAxis.title = { text: yAxisName, /** inverted */ } }
  if (xAxisName !== '') { option.yAxis.title = { text: xAxisName, /** inverted */ } }
  if (yAxisUnit !== '') { option.xAxis.labels = { format: `{value} ${yAxisUnit}`, /** inverted */ } }
  if (yAxisPosition === 'right') { option.xAxis.opposite = true }
  if (xAxisPosition === 'top') { option.yAxis.opposite = true }
  if (legendPosition === 'top') { option.legend.verticalAlign = 'top' }
  if (legendLayout === 'vertical') { option.legend.layout = legendLayout }
  if (legendLabelFormat !== '') { option.legend.labelFormat = legendLabelFormat }
  if (floatingLegend !== 'default') {
    option.legend.x = -30
    option.legend.y = 25
    option.legend.verticalAlign = 'top'
    option.legend.floating = true
    option.legend.backgroundColor = 'white'
    option.legend.borderColor = '#CCC'
    option.legend.borderWidth = 1
    option.legend.shadow = false

    if (floatingLegend === 'top-right') {
      option.legend.align = 'right'; option.legend.x = -30; option.legend.y = 25
    } else {
      option.legend.align = 'left'; option.legend.x = +50; option.legend.y = 25
    }
  }

  if (dataLabel) {
    option.series.map(r => {
      r.dataLabels = {
        enabled: true,
        color: '#FFFFFF',
        align: 'center',
        formatter: function() {
          return parseNumberUsingHighchartPrecision(Highcharts, dataLabelPrecision, this.point.y)
        },
        y: 10, // 10 pixels down from the top
      }
    })
  }

  return option
}

function parseNumberUsingHighchartPrecision(Highcharts, precision, value) {
  try {
    if (precision !== '' &&
      precision.startsWith('.') &&
      precision.endsWith('f')) {
      precision = precision.slice(1, -1)
    }

    if (typeof precision !== 'number') {
      precision = Number.parseInt(precision)
    }
  } catch (error) { /** ignore precision parsing error */ }
  return Highcharts.numberFormat(Math.abs(value), precision, '.', '')
}

