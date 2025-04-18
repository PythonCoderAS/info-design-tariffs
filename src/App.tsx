import { useEffect, useRef, useState } from 'react'
import './App.css'
/* Imports */
import { Button, Container, Graphics, HeatLegend, Root, color as am5color, p50 as am5p50, p100 as am5p100, percent as am5percent, Slider, Label, Circle } from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodataWorldLow from "@amcharts/amcharts5-geodata/worldLow";
// import am5geodataUSALow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import dayjs from 'dayjs';
import { DataItem, IComponentDataItem } from '@amcharts/amcharts5/.internal/core/render/Component';
import { FLATTENED_TARIFF_DATA, FlattenedTariffDataEntry, TariffType, Valid2DigitCountryCodesWithoutUSA } from './data';


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

type AmChartsData = ({ id: Valid2DigitCountryCodesWithoutUSA, approxValueFormatted?: string } & Partial<Pick<FlattenedTariffDataEntry, Exclude<keyof FlattenedTariffDataEntry, "id" | "date" | "type">>>) & IComponentDataItem;

function AmChartsMap() {
  const [field, setField] = useState<Exclude<keyof FlattenedTariffDataEntry, "id" | "date" | "type">>("percentValue");
  const [type, setType] = useState<TariffType>("announced");
  const [dateIndex, setDateIndex] = useState<number>(-1);
  const [polygonSeries, setPolygonSeries] = useState<am5map.MapPolygonSeries | null>(null);
  const dateIndexRef = useRef(dateIndex); // Need to pass this value into a callback in the use effect
  const oldData = useRef<AmChartsData[]>([]);

  useEffect(() => {
    if (polygonSeries) {
      const mappedData: AmChartsData[] = dateIndex === -1 ? [] : FLATTENED_TARIFF_DATA.get(dates[dateIndex])!.filter((d) => d.type === type).map(d => {
        return {
          id: d.id,
          [field]: d[field],
          approxValueFormatted: field === "approximateValueOfImportsImpacted" ? formatLargeMoney(d.approximateValueOfImportsImpacted) : undefined,
        };
      });
      polygonSeries.data.setAll(mappedData);
      const diffItems = mappedData.filter((d) => {
        const oldItem = oldData.current.find((old) => old.id === d.id);
        if (!oldItem) {
          return true;
        }
        const isDifferent = oldItem[field] !== d[field];
        return isDifferent;
      }).map(d => d.id);
      oldData.current = mappedData;
      polygonSeries.mapPolygons.values
        .filter(polygon => polygon.dataItem && diffItems.includes((polygon.dataItem as DataItem<AmChartsData>).get("id")))
        .forEach(polygon => polygon.appear(1000));
    }
  }, [polygonSeries, dateIndex, field, type]);

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
      heatLegend.showValue(Number((ev.target.dataItem as DataItem<AmChartsData>).get(field)));
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
      const high = polygonSeries.getPrivate("valueHigh") ?? 0;
      // heatLegend.set("startValue", polygonSeries.getPrivate("valueLow"));
      // heatLegend.set("endValue", Math.max(polygonSeries.getPrivate("valueHigh") ?? 0, 100));
      if (field !== "percentValue") {
        const endValue = Math.max(high, 1_000_000);
        heatLegend.setAll({
          endValue,
          endText: formatLargeMoney(endValue),
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
      x: am5percent(50),
      width: am5percent(135),
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
      const firstDateMillis = dayjs("2025-01-20").valueOf(); // Inauguration date
      // var year = firstYear + Math.round(slider.get("start", 0) * (lastYear - firstYear));
      const nextDateMillis = firstDateMillis + Math.round(slider.get("start", 0) * (lastDateMillis - firstDateMillis));
      const nextDate = dayjs(nextDateMillis);
      slider.startGrip.get("label")!.set("text", nextDate.format("MM/DD/YYYY"));
      // If this is != -1, this is the next date index
      const potentialNextDateIndex = dates.findIndex((d) => d.isAfter(nextDate));
      if (potentialNextDateIndex === -1) {
        setDateIndex(dates.length - 1);
      } else {
        setDateIndex(potentialNextDateIndex - 1);
      }
    });

    const typeContainer = chart.children.push(Container.new(root, {
      layout: root.horizontalLayout,
      x: am5percent(85),
      centerX: am5p100,
      y: am5percent(100),
      dy: -40
    }));

    // Add labels and controls
    typeContainer.children.push(Label.new(root, {
      centerY: am5p50,
      text: "Announced"
    }));

    const typeSwitchButton = typeContainer.children.push(Button.new(root, {
      themeTags: ["switch"],
      centerY: am5p50,
      icon: Circle.new(root, {
        themeTags: ["icon"]
      }),
      active: type === "effective",
    }));

    typeSwitchButton.on("active", function () {
      if (!typeSwitchButton.get("active")) {
        setType("announced");
      } else {
        setType("effective");
      }
    });

    typeContainer.children.push(
      Label.new(root, {
        centerY: am5p50,
        text: "Effective"
      })
    );

    const fieldContainer = chart.children.push(Container.new(root, {
      layout: root.horizontalLayout,
      x: am5percent(15),
      centerX: am5p100,
      y: am5percent(100),
      dy: -40
    }));

    // Add labels and controls
    fieldContainer.children.push(Label.new(root, {
      centerY: am5p50,
      text: "Percent"
    }));

    const fieldSwitchButton = fieldContainer.children.push(Button.new(root, {
      themeTags: ["switch"],
      centerY: am5p50,
      icon: Circle.new(root, {
        themeTags: ["icon"]
      }),
      active: field === "approximateValueOfImportsImpacted",
    }));

    fieldSwitchButton.on("active", function () {
      if (!fieldSwitchButton.get("active")) {
        setField("percentValue")
      } else {
        setField("approximateValueOfImportsImpacted")
      }
    });

    fieldContainer.children.push(
      Label.new(root, {
        centerY: am5p50,
        text: "Approximate Value of Imports"
      })
    );

    return () => {
      root.dispose();
    }
  }, [field]);

  return <div style={{ width: "100%", height: "100vh" }} id="chartdiv" />
}


function App() {
  return (
    <AmChartsMap />
  )
}

export default App;