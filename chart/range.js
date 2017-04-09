export const CommonParameter = {
  'floatingLegend': { valueType: 'string', defaultValue: 'default', description: 'floating legend', widget: 'option', optionValues: [ 'default', 'top-right', 'top-left', ], },
  'rotateXAxisLabel': { valueType: 'int', defaultValue: 0, description: 'rotate xAxis labels', },
  'rotateYAxisLabel': { valueType: 'int', defaultValue: 0, description: 'rotate yAxis labels', },
  'dataLabel': { valueType: 'boolean', defaultValue: true, description: 'use data labels in column', widget: 'checkbox', },
  'dataLabelPrecision': { valueType: 'string', defaultValue: '.1f', description: 'precision of data label format without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'tooltipPrecision': { valueType: 'string', defaultValue: '.1f', description: 'precision of tooltip format without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'legendLabelFormat': { valueType: 'string', defaultValue: '', description: 'text format of legend (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'yAxisPosition': { valueType: 'string', defaultValue: 'left', description: 'yAxis position', widget: 'option', optionValues: [ 'left', 'right', ], },
  'xAxisPosition': { valueType: 'string', defaultValue: 'bottom', description: 'xAxis position', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'showLegend': { valueType: 'boolean', defaultValue: true, description: 'show legend', widget: 'checkbox', },
  'legendPosition': { valueType: 'string', defaultValue: 'bottom', description: 'position of legend', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'legendLayout': { valueType: 'string', defaultValue: 'horizontal', description: 'layout of legend', widget: 'option', optionValues: [ 'horizontal', 'vertical', ], },
  'subTitle': { valueType: 'string', defaultValue: '', description: 'sub title of chart', },
  'mainTitle': { valueType: 'string', defaultValue: '', description: 'main title of chart', },
  'xAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of xAxis', },
  'yAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of yAxis', },
  'xAxisName': { valueType: 'string', defaultValue: '', description: 'name of xAxis', },
  'yAxisName': { valueType: 'string', defaultValue: '', description: 'name of yAxis', },
}

export function getPrecisionFormat(precision, prefix) {
  return (precision === '') ? `{${prefix}:.1f}` : `{${prefix}:${precision}}`
}

export function createRangeChartDataStructure(rows, selectors, keyNames) {
  const series = []

  // selectors.length always be even
  for(let i = 0; i < selectors.length; i = i + 2) {
    const splitedSelectorName = selectors[i].split('(')
    const s = { name: splitedSelectorName[0], data: [], }
    let reversed = false
    if (rows[i].selector.endsWith('(max)') &&
      rows[i + 1].selector.endsWith('(min)')) {
      reversed = true;
    }

    for (let j = 0; j < keyNames.length; j++) {
      const minMaxRow = (reversed) ? [rows[i + 1].value[j], rows[i].value[j]] :
        [rows[i].value[j], rows[i + 1].value[j]]
      s.data.push(minMaxRow)
    }

    series.push(s)
  }

  return series
}

export function createRangeChartOption(data, parameter, keyNames) {
  const {
    xAxisName, yAxisName, xAxisUnit, yAxisUnit,
    xAxisPosition, yAxisPosition, legendPosition, legendLayout, rotateXAxisLabel, rotateYAxisLabel,
    showLegend, legendLabelFormat, floatingLegend, dataLabel,
    tooltipPrecision, dataLabelPrecision,
    mainTitle, subTitle,
  } = parameter

  const option = {
    chart: { type: 'columnrange', inverted: true },
    lang: { thousandsSep: ',' },
    title: { text: ' ', },
    xAxis: {
      categories: keyNames, crosshair: true,
      labels: { rotation: rotateYAxisLabel, /** inverted */ },
    },
    yAxis: {
      labels: { rotation: rotateXAxisLabel, /** inverted */ },
    },
    labels: {},
    legend: { enabled: showLegend, labelFormat: '{name}', },
    tooltip: {
      headerFormat: `
        <span style="font-size: 10px;">Key: {point.key}</span>
          <table style="margin-top: 3px;">`,
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      `<td style="padding:0"><b>${getPrecisionFormat(tooltipPrecision, 'point.low')}</b> ~ ` +
      `<b>${getPrecisionFormat(tooltipPrecision, 'point.high')}</b></td></tr>`
      ,
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    series: data,
  }

  if (mainTitle !== '') { option.title.text = mainTitle  }
  if (subTitle !== '') { option.subtitle = { text: subTitle, } }
  if (yAxisName !== '') { option.xAxis.title = { text: yAxisName, /** inverted */ } }
  if (xAxisName !== '') { option.yAxis.title = { text: xAxisName, /** inverted */ } }
  if (yAxisUnit !== '') { option.xAxis.labels = { format: `{value} ${yAxisUnit}`, /** inverted */ } }
  if (xAxisUnit !== '') { option.yAxis.labels = { format: `{value} ${xAxisUnit}`, /** inverted */ } }
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
    const format = getPrecisionFormat(dataLabelPrecision, 'point.y')
    option.plotOptions = {
      columnrange: {
        dataLabels: { enabled: true, format: format, }
      }
    }
  }

  return option
}
