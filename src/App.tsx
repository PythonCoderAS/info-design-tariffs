import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
/* Imports */
import { Button, Container, Graphics, HeatLegend, Root, color as am5color, p50 as am5p50, p100 as am5p100, percent as am5percent, Slider, Label } from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodataWorldLow from "@amcharts/amcharts5-geodata/worldLow";
// import am5geodataUSALow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import dayjs, { Dayjs } from 'dayjs';
import { DataItem, IComponentDataItem } from '@amcharts/amcharts5/.internal/core/render/Component';
import { FLATTENED_TARIFF_DATA, FlattenedTariffDataEntry, TariffType } from './data';


interface EffectiveTariff extends IComponentDataItem, FlattenedTariffDataEntry {
}

const dates = [...FLATTENED_TARIFF_DATA.keys()];

function formatLargeMoney(value: number) {
  const highestDigitLength = Math.floor(Math.log10(value)); // Gets the highest digit length (e.g. 1000 -> 3)
  let specifier = "";
  let highestPower = 0;
  if (highestDigitLength >= 12) {
    specifier = "T";
    highestPower = 12;
  } else if (highestDigitLength >= 9) {
    specifier = "B";
    highestPower = 9;
  } else if (highestDigitLength >= 6) {
    specifier = "M";
    highestPower = 6;
  } else if (highestDigitLength >= 3) {
    specifier = "K";
    highestPower = 3;
  }
  const valueTo100ths = value > 1000 ? Math.round(value / Math.pow(10, highestPower)) : value;
  return `$${valueTo100ths} ${specifier}`;
}


function AmChartsMap({
  field = "percentValue", type = "announced"
}: {
  field: Exclude<keyof FlattenedTariffDataEntry, "id" | "date" | "type">,
  type: TariffType
}) {
  const [dateIndex, setDateIndex] = useState<number>(0);
  const [chart, setChart] = useState<am5map.MapChart | null>(null);
  const [polygonSeries, setPolygonSeries] = useState<am5map.MapPolygonSeries | null>(null);
  const dateIndexRef = useRef(dateIndex); // Need to pass this value into a callback in the use effect

  useEffect(() => {
    if (polygonSeries) {
      const mappedData = FLATTENED_TARIFF_DATA.get(dates[dateIndex])!.filter((d) => d.type === type).map(d => {
        return {
          id: d.id,
          [field]: d[field],
          approxValueFormatted: field === "approximateValueOfImportsImpacted" ? formatLargeMoney(d.approximateValueOfImportsImpacted) : undefined,
        };
      });
      console.log(mappedData);
      polygonSeries.data.setAll(mappedData);
      if (chart) {
        polygonSeries.mapPolygons.values.forEach(polygon => polygon.appear(1000));
      }
    }
  }, [polygonSeries, chart, dateIndex, field, type]);

  useEffect(() => {
    if (polygonSeries) {
      polygonSeries.set("valueField", field);
    }
  }, [polygonSeries, field]);

  useEffect(() => {
    dateIndexRef.current = dateIndex;
  }, [dateIndex]);

  useEffect(() => {
    // Create root
    const root = Root.new("chartdiv", {});

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    const chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "none",
      projection: am5map.geoMercator(),
      // projection: am5map.geoAlbersUsa(),
      layout: root.horizontalLayout
    }));

    setChart(chart);
    // Create polygon series
    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      // geoJSON: am5geodataUSALow,
      geoJSON: am5geodataWorldLow,
      valueField: field,
      calculateAggregates: true
    }));

    setPolygonSeries(polygonSeries);

    // Hide antartica
    polygonSeries.set("exclude", ["AQ"]);
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: field === "percentValue" ? `{name}: {${field}}%` : `{name}: {approxValueFormatted}`
    });

    polygonSeries.set("heatRules", [{
      target: polygonSeries.mapPolygons.template,
      dataField: "value",
      min: am5color(0xd3a29f), // Green
      max: am5color(0x6f0600), // Red
      key: "fill",
      minValue: 0,
      maxValue: field === "percentValue" ? 50 : undefined,
    }]);

    const heatLegend = chart.children.push(HeatLegend.new(root, {
      orientation: "horizontal",
      startColor: am5color(0xd3a29f),
      startValue: 0,
      endValue: field === "percentValue" ? 50 : undefined,
      endColor: am5color(0x6f0600),
      startText: "No Tariff",
      endText: field === "percentValue" ? "50% Tariff" : "Most Tariffed",
      stepCount: field === "percentValue" ? 5 : 100,
    }));

    polygonSeries.mapPolygons.template.events.on("pointerover", function (ev) {
      heatLegend.showValue(Number((ev.target.dataItem as DataItem<EffectiveTariff>).get(field)));
    });

    heatLegend.startLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("startColor")
    });

    heatLegend.endLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("endColor")
    });

    // change this to template when possible
    polygonSeries.events.on("datavalidated", function () {
      // console.log({ low: polygonSeries.getPrivate("valueLow"), high: polygonSeries.getPrivate("valueHigh") });
      // const low = polygonSeries.getPrivate("valueLow")!;
      const high = polygonSeries.getPrivate("valueHigh")!;
      // heatLegend.set("startValue", polygonSeries.getPrivate("valueLow"));
      // heatLegend.set("endValue", Math.max(polygonSeries.getPrivate("valueHigh") ?? 0, 100));
      if (field !== "percentValue") {
        heatLegend.setAll({
          endValue: Math.max(high, 100),
          endText: formatLargeMoney(high),
        });
      }
    })

    // Set clicking on "water" to zoom out
    chart.chartContainer.get("background")!.events.on("click", function () {
      chart.goHome();
    })

    // Make stuff animate on load
    chart.appear(1000, 100);

    const container = chart.children.push(Container.new(root, {
      y: am5p100,
      centerX: am5p50,
      centerY: am5p100,
      x: am5p50,
      width: am5percent(90),
      layout: root.horizontalLayout,
      paddingBottom: 10
    }));

    const playButton = container.children.push(Button.new(root, {
      themeTags: ["play"],
      centerY: am5p50,
      marginRight: 40,
      icon: Graphics.new(root, {
        themeTags: ["icon"]
      })
    }));

    const slider = container.children.push(Slider.new(root, {
      //width: am5.percent(80),
      orientation: "horizontal",
      start: 0,
      centerY: am5p50
    }));

    playButton.events.on("click", function () {
      if (playButton.get("active")) {
        slider.set("start", slider.get("start")! + 0.0001);
      } else {
        slider.animate({
          key: "start",
          to: 1,
          duration: 15000 * (1 - slider.get("start")!),
        });
      }
    });


    slider.startGrip.get("icon")!.set("forceHidden", true);
    slider.startGrip.set("label", Label.new(root, {
      text: dates[0].format("MM/DD/YYYY"),
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0
    }));

    slider.events.on("rangechanged", function () {
      const lastDateMillis = dayjs(dates[dates.length - 1]).valueOf();
      const firstDateMillis = dayjs(dates[0]).valueOf();
      // var year = firstYear + Math.round(slider.get("start", 0) * (lastYear - firstYear));
      const nextDateMillis = firstDateMillis + Math.round(slider.get("start", 0) * (lastDateMillis - firstDateMillis));
      const nextDate = dayjs(nextDateMillis);
      slider.startGrip.get("label")!.set("text", nextDate.format("MM/DD/YYYY"));
      // If this is != -1, this is the next date index
      const potentialNextDateIndex = dates.findIndex((d) => d.isAfter(nextDate));
      if (potentialNextDateIndex === -1) {
        setDateIndex(dates.length - 1);
      } else {
        setDateIndex(potentialNextDateIndex === 0 ? 0 : (potentialNextDateIndex - 1));
      }
    });

    return () => {
      root.dispose();
    }
  }, [field]);

  return <div style={{ width: "100%", height: "100vh" }} id="chartdiv" />
}


function App() {
  return (
    <AmChartsMap field='approximateValueOfImportsImpacted' type='announced' />
  )
}

export default App
