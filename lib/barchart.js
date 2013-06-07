define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');

  /**
   * Module exports
   */

  return defineComponent(barchart);

  /**
   * Module function
   */

  function barchart() {

      this.defaultAttrs({
          barWidth: 0.8,
          model: 'defaultModel',
          tooltip: { caption: '' }
        });

      this.after('initialize', function () {

          var self = this;
          var chartDiv = $('<div>').addClass('barchart');
          $('body').append(chartDiv);

          var context = d3.select('.barchart').append('svg');
          context.attr('class', 'chart ' + this.attr.cssClass);

          var width = chartDiv.width();
          var height = chartDiv.height();

          var x = d3.time.scale().range([0, width]),
              y = d3.scale.linear().range([height, 0]),
              data = this.$node.data('value') || this.attr.value || [];

          if (this.attr.tooltip) {
            this.tooltip = $('<div>').addClass('tooltip').appendTo($('body'));
          }

          $.getJSON('./js/component/bar_chart.json')
          .done(function (data){
            self.trigger('valueChange', data);
          })
          .fail(function(e){
            console.log('error');
          });

          this.updateChart = function() {
            var bars = context.selectAll('.bar').data(data),
                barWidth = width / (data.length + 1),
                halfBarWidth = barWidth / 2;

            bars.enter().append('rect').attr('class', 'bar');
            var self = this;
            bars.attr('x', function(d) {
              return x(d.date) - halfBarWidth;
            })
            .attr('width', barWidth)
            .attr('y', function(d) {
              return d.value >= 0 ? y(d.value) : y(0);
            })
            .attr('height', function(d) {
              return Math.abs(y(0) - y(d.value));
            })
            .on('mouseover', function(d) {
              self.showTooltip(this, d.value, barWidth);
            })
            .on('mouseout', function(d) {
              self.hideTooltip();
            });

            bars.exit().remove();

          };

          this.on('resize', function(e, chartSize) {
            this.width = chartSize.width;
            this.height = chartSize.height;
            x.range([0, this.width]);
            y.range([this.height, 0]);
            this.updateChart();
            e.stopPropagation();
          });

          this.on('valueChange', function(e, options) {
            console.log(options);
            var valueField = this.attr.model;
            console.log(options.value[valueField]);
            data = $.map(options.value[valueField], function(val, i) {
                    if (val.date > options.range[0] &&
                      val.date < options.range[1]) {
                      return val;
                    }
                  });
            var valueRange = d3.max(options.value[valueField], function(d){
              return d.value;
            });
            options.range = [new Date(options.range[0]), new Date(options.range[1])];
            console.log(options.range);
            x.domain(options.range);
            y.domain([0, valueRange]);
            this.updateChart();
            e.stopPropagation();
          });

          this.showTooltip = function(rect, d, barWidth) {
            var pos = $(rect).offset();
            this.tooltip.html('<div>'+d+'</div><div>'+this.attr.tooltip.caption+'</div>');
            this.tooltip.css({
              top: pos.top,
              left: pos.left + barWidth/2
            });
            this.tooltip.show();
          };

          this.hideTooltip = function() {
            this.tooltip.hide();
          };

        });

    }

});
