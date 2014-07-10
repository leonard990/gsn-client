'use strict';

angular.module('gsnClientApp')
  .controller('ChartController', function ($scope, ChartService) {
    
    var enableDataLabels = false;
    var myData = [];

    $scope.chartTypes = ['areaspline','spline', 'column', 'area','line'];
    $scope.selectedChartType = $scope.chartTypes[0];
    
    // This is for all plots, change Date axis to local timezone
    Highcharts.setOptions({                                            
        global : {
            useUTC : false
        }
    });
    $scope.chartConfig = {
      chart: {
        renderTo: 'chartdiv',
        zoomType: 'x',
      },

      title: {
        text: ''
      },

      useHighStocks: false,

      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        labels: {
          formatter: function() {
            //return Highcharts.dateFormat('%Y-%m-%d, %H:%M', this.value);            
            return Highcharts.dateFormat('%H:%M', this.value);
          }
        }
      },

      yAxis: {
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
      },

      plotOptions: {
        series: {
          pointStart: 1,
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 2,
            states: {
                hover: {
                    enabled: true
                }
            }
          }
        }
      },

      series: []
    };

    $scope.showResulChart = function() {
      myData = ChartService.getDataForChart($scope.selectedChart, $scope.selectedChart.name, $scope.selectedChartType);
      var seriesArray = $scope.chartConfig.series;
      for(var i = 0; i < seriesArray.length; i++)
      {
        seriesArray.splice(i, seriesArray.length)
      }

      for(var i = 0; i < myData.length; i++)
      {
        seriesArray.push(myData[i]);
      }
    };
    
    $scope.seriesTypeChange = function(type) {
      var seriesArray = $scope.chartConfig.series;
      for(var i = 0; i < seriesArray.length; i++)
      {
        $scope.chartConfig.series[i].type =  type;    
      }
    };
    
    $scope.toggleLabels = function () {
      enableDataLabels = !enableDataLabels;
      $scope.chartConfig.series[0].dataLabels.enabled =  enableDataLabels;        
    }
  });