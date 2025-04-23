import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
/* Imports */
import { Button, Container, Graphics, HeatLegend, Root, color as am5color, p0 as am5p0, p50 as am5p50, p100 as am5p100, percent as am5percent, Slider, Label, Circle, RoundedRectangle } from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodataWorldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5geodataUSALow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import dayjs from 'dayjs';
import { DataItem, IComponentDataItem } from '@amcharts/amcharts5/.internal/core/render/Component';
import { FLATTENED_TARIFF_DATA, FlattenedTariffDataEntry, TariffType, Valid2DigitCountryCodesWithoutUSA, GDP_PER_STATE_MILLIONS, POP_PER_STATE_2020_CENSUS, ValidStateCodes, validStateCodes, Valid2DigitCountryCodes } from './data';
import PersonSVG from './personSVG';


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

function formatLargeValue(value: number) {
  // Add commas for every 3 digits
  const valueString = value.toString();
  const reversedValueString = valueString.split("").reverse().join("");
  let ret = "";
  for (let i = 0; i < reversedValueString.length; i++) {
    if (i > 0 && i % 3 === 0) {
      ret = "," + ret;
    }
    ret = reversedValueString[i] + ret;
  }
  return ret;
}

interface AmChartsData extends IComponentDataItem, Partial<Pick<FlattenedTariffDataEntry, Exclude<keyof FlattenedTariffDataEntry, "id" | "date" | "type" | "color">>> {
  id: Valid2DigitCountryCodesWithoutUSA;
  approxValueFormatted?: string;
}

/**
 * 
 * @param {Object} props
 * @param {number} props.valueUSD - The value in USD to be displayed
 * @param {boolean} [props.lowestFirst=true] - Whether to display the states with the lowest population/GDP first
 * @param {number} props.averageSalary - The average salary to use if using uniform distribution (do not include this value to show how many entire states' GDPs compose valueUSD, include this value to show how many people in each state * average salary compose valueUSD)
 * @param {string} props.id - The unique ID of the map
 * @returns {JSX.Element} - The AmChartsUSAMap component
 */
function AmChartsUSAMap({ valueUSD, averageSalary, id }: { valueUSD: number, averageSalary: number, id: string }) {
  const [polygonSeries, setPolygonSeries] = useState<am5map.MapPolygonSeries | null>(null);
  const [lowestFirst, setLowestFirst] = useState(true);
  const [usingAverageSalary, setUsingAverageSalary] = useState(false);
  const data = useMemo(() => {
    let stateValue: Record<ValidStateCodes, number> = Object.fromEntries(Object.entries(GDP_PER_STATE_MILLIONS).map(([state, gdp]) => [state, gdp * 1_000_000])) as Record<ValidStateCodes, number>; // Need to multiply by one million to get the real value
    if (usingAverageSalary) {
      if (averageSalary <= 0) {
        throw new Error("Average salary must be greater than 0");
      }
      stateValue = Object.fromEntries(Object.entries(POP_PER_STATE_2020_CENSUS).map(([state, pop]) => [state, pop * averageSalary])) as Record<ValidStateCodes, number>;
    }
    const states: ValidStateCodes[] = [];
    let combinedValue = 0;
    let sortedData = Object.entries(stateValue).toSorted(([, valueA], [, valueB]) => valueA - valueB);
    console.log(sortedData);
    if (lowestFirst) {
      for (let i = 0; i < sortedData.length && combinedValue + sortedData[i][1] <= valueUSD; i++) {
        const [state, value] = sortedData[i];
        combinedValue += value;
        states.push(state as ValidStateCodes);
      }
    } else {
      sortedData = sortedData.reverse();
      for (const [state, value] of sortedData) {
        if (combinedValue + value > valueUSD) {
          continue;
        }
        combinedValue += value;
        states.push(state as ValidStateCodes);
      }
    }
    const data = validStateCodes.map((state) => ({
      id: `US-${state}`,
      value: stateValue[state],
      formattedValue: usingAverageSalary ? formatLargeValue(POP_PER_STATE_2020_CENSUS[state]) : formatLargeMoney(stateValue[state]),
      active: states.includes(state),
    }));
    return data;
  }, [valueUSD, lowestFirst, usingAverageSalary, averageSalary])

  useEffect(() => {
    if (polygonSeries) {
      polygonSeries.data.setAll(data);
      const activeStates = data.filter(d => d.active).map(d => d.id);
      polygonSeries.mapPolygons.values
        .filter(polygon => polygon.dataItem && activeStates.includes((polygon.dataItem as DataItem<AmChartsData>).get("id")))
        .forEach((polygon) => {
          polygon.set("active", true);
        });
    }
  }, [polygonSeries, data]);

  useEffect(() => {
    // Create root
    const root = Root.new(id, {});

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    const chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "none",
      projection: am5map.geoAlbersUsa(),
      layout: root.horizontalLayout,
    }));

    // Create polygon series
    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodataUSALow,
      valueField: "value",
    }));

    setPolygonSeries(polygonSeries);

    polygonSeries.mapPolygons.template.set("tooltipText", `{name}: {formattedValue}`);
    polygonSeries.mapPolygons.template.states.create("active", {
      fill: root.interfaceColors.get("primaryButtonActive")
    });

    const lowestContainer = chart.children.push(Container.new(root, {
      layout: root.horizontalLayout,
      x: am5percent(70),
      centerX: am5p100,
      y: am5percent(100),
      dy: -40,
    }));

    // Add labels and controls
    lowestContainer.children.push(Label.new(root, {
      centerY: am5p50,
      text: "Smallest States First",
      fontSize: 16
    }));

    const lowestSwitchButton = lowestContainer.children.push(Button.new(root, {
      themeTags: ["switch"],
      centerY: am5p50,
      icon: Circle.new(root, {
        themeTags: ["icon"]
      }),
      active: !lowestFirst,
    }));

    lowestSwitchButton.on("active", function () {
      setLowestFirst(!lowestSwitchButton.get("active"))
    });

    lowestContainer.children.push(
      Label.new(root, {
        centerY: am5p50,
        text: "Largest States First",
        fontSize: 16
      })
    );

    const usingAverageSalaryContainer = chart.children.push(Container.new(root, {
      layout: root.horizontalLayout,
      x: am5percent(35),
      centerX: am5p100,
      y: am5percent(100),
      dy: -40,
    }));

    // Add labels and controls
    usingAverageSalaryContainer.children.push(Label.new(root, {
      centerY: am5p50,
      text: "Real GDP of State",
      fontSize: 16
    }));

    const usingAverageSalarySwitchButton = usingAverageSalaryContainer.children.push(Button.new(root, {
      themeTags: ["switch"],
      centerY: am5p50,
      icon: Circle.new(root, {
        themeTags: ["icon"]
      }),
      active: usingAverageSalary,
    }));

    usingAverageSalarySwitchButton.on("active", function () {
      setUsingAverageSalary(usingAverageSalarySwitchButton.get("active")!)
    });

    usingAverageSalaryContainer.children.push(
      Label.new(root, {
        centerY: am5p50,
        text: "Population of State",
        fontSize: 16
      })
    );


    return () => {
      root.dispose();
    }
  }, [id]);

  return <div style={{ width: "100%", height: "50vh" }} id={id} />
}

function AmChartsMap() {
  const [field, setField] = useState<Exclude<keyof FlattenedTariffDataEntry, "id" | "date" | "type" | "color">>("percentValue");
  const [type, setType] = useState<TariffType>("announced");
  const [dateIndex, setDateIndex] = useState<number>(-1);
  const [polygonSeries, setPolygonSeries] = useState<am5map.MapPolygonSeries | null>(null);
  const [heatLegend, setHeatLegend] = useState<HeatLegend | null>(null);
  const dateIndexRef = useRef(dateIndex); // Need to pass this value into a callback in the use effect
  const oldData = useRef<AmChartsData[]>([]);
  const fieldRef = useRef(field);
  const [hoveredCountry, setHoveredCountry] = useState<Valid2DigitCountryCodesWithoutUSA | null>(null);
  const [clickedCountry, setClickedCountry] = useState<Valid2DigitCountryCodesWithoutUSA | null>(null);
  const clickedCountryRef = useRef(clickedCountry);
  const { visualizationCountry, visualizationValueUSD } = useMemo<{ visualizationCountry: string | null, visualizationValueUSD: number }>(() => {
    const effectiveCountry = clickedCountry || hoveredCountry;
    if (!FLATTENED_TARIFF_DATA.get(dates[dateIndex])) {
      return {
        visualizationCountry: null,
        visualizationValueUSD: 0,
      }
    }
    const globalTariffsValue = FLATTENED_TARIFF_DATA.get(dates[dateIndex])!.filter(d => d.type === type).reduce((acc, d) => acc + d.approximateValueOfImportsImpacted, 0);
    if (effectiveCountry === null || !polygonSeries) {
      return {
        visualizationCountry: null,
        visualizationValueUSD: globalTariffsValue,
      }
    }
    const countryData = FLATTENED_TARIFF_DATA.get(dates[dateIndex])!.find((d) => d.id === effectiveCountry && d.type === type);
    // @ts-expect-error I don't have the correct type to even fix this
    const countryName = polygonSeries.mapPolygons.values.find((polygon) => polygon.dataItem && (polygon.dataItem as DataItem<AmChartsData>).get("id") === effectiveCountry && polygon.dataItem.name)?.get("name") || "Unknown";
    return {
      visualizationCountry: countryName,
      visualizationValueUSD: countryData ? countryData.approximateValueOfImportsImpacted : 0,
    }
  }, [clickedCountry, hoveredCountry, polygonSeries, dates, dateIndex, type]);

  useEffect(() => {
    if (polygonSeries) {
      polygonSeries.set("valueField", field);
      polygonSeries.mapPolygons.template.set("tooltipText", field === "percentValue" ? `{name}: {${field}}%` : `{name}: {approxValueFormatted}`);
      const originalHeatRule = polygonSeries.get("heatRules")![0];
      const newHeatRule = {
        ...originalHeatRule,
        maxValue: field === "percentValue" ? 150 : undefined,
      };
      polygonSeries.set("heatRules", [newHeatRule]);
    }
    if (heatLegend) {
      heatLegend.setAll({
        endValue: field === "percentValue" ? 150 : undefined,
        startText: field === "percentValue" ? "0% Tariff" : "$0 Tariffed",
        stepCount: field === "percentValue" ? 15 : 100,
      })
      if (field === "percentValue") {
        heatLegend.set("endText", "150% Tariff");
      }
    }
  }, [field]);

  useEffect(() => {
    let maxValue = 0;
    if (polygonSeries) {
      const mappedData: AmChartsData[] = dateIndex === -1 ? [] : FLATTENED_TARIFF_DATA.get(dates[dateIndex])!.filter((d) => d.type === type).map(d => {
        maxValue = Math.max(maxValue, d[field]);
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
      console.log({
        mappedData, diffItems,
        filtered: mappedData.filter(d => diffItems.includes(d.id)),
      });
      oldData.current = mappedData;
      polygonSeries.mapPolygons.values
        .filter(polygon => polygon.dataItem && diffItems.includes((polygon.dataItem as DataItem<AmChartsData>).get("id")))
        .forEach((polygon) => {
          polygon.appear(1000);
        });
      if (field !== "percentValue") {
        const endValue = Math.max(maxValue, 1_000_000);
        heatLegend!.setAll({
          endValue,
          endText: `${formatLargeMoney(endValue)} Tariffed`,
        });
      }
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
    fieldRef.current = field;
  }, [field]);

  useEffect(() => {
    clickedCountryRef.current = clickedCountry;
  }, [clickedCountry]);

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
      layout: root.horizontalLayout,
    }));

    // Create polygon series
    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      // geoJSON: am5geodataUSALow,
      geoJSON: am5geodataWorldLow,
      valueField: field,
      calculateAggregates: true,
      exclude: ["AQ"], // Hide Antarctica
    }));
    // chart.seriesContainer.set("paddingBottom", 50);

    setPolygonSeries(polygonSeries);

    polygonSeries.set("heatRules", [{
      target: polygonSeries.mapPolygons.template,
      dataField: "value",
      min: am5color(0xd3a29f), // Green
      max: am5color(0x330000), // Red
      key: "fill",
      minValue: 0,
      maxValue: field === "percentValue" ? 150 : undefined,
    }]);

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: field === "percentValue" ? `{name}: {${field}}%` : `{name}: {approxValueFormatted}`,
      nonScalingStroke: true,
      cursorOverStyle: "pointer",
    })

    const heatLegendContainer = chart.children.push(Container.new(root, {
      layout: root.horizontalLayout,
      // Make this container be on the top of the page (y=0)
      x: am5percent(85),
      centerX: am5percent(85),
      y: am5p0,
      centerY: am5p0,
      width: am5percent(100),
    }));

    const heatLegend = heatLegendContainer.children.push(HeatLegend.new(root, {
      orientation: "horizontal",
      startColor: am5color(0xd3a29f),
      startValue: 0,
      endValue: field === "percentValue" ? 150 : undefined,
      endColor: am5color(0x330000),
      startText: field === "percentValue" ? "0% Tariff" : "$0 Tariffed",
      endText: field === "percentValue" ? "150% Tariff" : "Most Tariffed",
      stepCount: field === "percentValue" ? 15 : 100,
    }));

    setHeatLegend(heatLegend);

    polygonSeries.mapPolygons.template.events.on("pointerover", function (ev) {
      heatLegend.showValue(Number((ev.target.dataItem as DataItem<AmChartsData>).get(fieldRef.current)));
      const dataItem = ev.target.dataItem as DataItem<AmChartsData>;
      const id = dataItem.get("id");
      setHoveredCountry(id);
    });

    polygonSeries.mapPolygons.template.events.on("pointerout", function () {
      setHoveredCountry(null);
    });

    polygonSeries.mapPolygons.template.events.on("click", function (ev) {
      const dataItem = ev.target.dataItem as DataItem<AmChartsData>;
      const id = dataItem.get("id") as Valid2DigitCountryCodes;
      if (id === "US") {
        return;
      }
      if (clickedCountryRef.current) {
        polygonSeries.mapPolygons.values.filter(polygon => polygon.dataItem && (polygon.dataItem as DataItem<AmChartsData>).get("id") === clickedCountryRef.current).forEach((polygon) => {
          polygon.remove("stroke");
          polygon.remove("strokeWidth");
        });
      }
      if (clickedCountryRef.current === id) {
        setClickedCountry(null);
      } else {
        setClickedCountry(id);
        polygonSeries.mapPolygons.values.filter(polygon => polygon.dataItem && (polygon.dataItem as DataItem<AmChartsData>).get("id") === id).forEach((polygon) => polygon.setAll({
          "stroke": root.interfaceColors.get("primaryButtonActive"),
          "strokeWidth": 4,
        }));
      }
    });

    heatLegend.startLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("startColor")
    });

    heatLegend.endLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("endColor")
    });

    // Set clicking on "water" to zoom out
    chart.chartContainer.get("background")!.events.on("click", function () {
      chart.goHome();
    })

    // Make stuff animate on load
    chart.appear(1000, 100);

    const container = chart.children.push(Container.new(root, {
      y: am5p100,
      centerX: am5percent(55),
      centerY: am5p100,
      x: am5percent(55),
      width: am5percent(55),
      layout: root.horizontalLayout,
      dy: -10,
    }));

    const prevButton = container.children.push(Button.new(root, {
      centerY: am5p50,
      marginRight: 5,
      label: Label.new(root, {
        text: "<",
      }),
      tooltipText: "Previous",
    }));

    (prevButton.get("background") as RoundedRectangle).setAll({
      cornerRadiusBL: 100,
      cornerRadiusTL: 100,
      cornerRadiusTR: 100,
      cornerRadiusBR: 100,
    });

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
      centerY: am5p50,
      marginRight: 10
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

    const nextButton = container.children.push(Button.new(root, {
      centerY: am5p50,
      marginLeft: 30,
      label: Label.new(root, {
        text: ">",
      }),
      tooltipText: "Next",
    }));

    (nextButton.get("background") as RoundedRectangle).setAll({
      cornerRadiusBL: 100,
      cornerRadiusTL: 100,
      cornerRadiusTR: 100,
      cornerRadiusBR: 100,
    });


    prevButton.events.on("click", function () {
      prevButton.set("active", false);
      if (dateIndexRef.current > 0) {
        const lastDateMillis = dayjs(dates[dates.length - 1]).valueOf();
        const firstDateMillis = dayjs("2025-01-20").valueOf(); // Inauguration date
        setDateIndex(dateIndexRef.current - 1);
        const date = dates[dateIndexRef.current - 1];
        const dateInRangePercent = (dayjs(date).valueOf() - firstDateMillis) / (lastDateMillis - firstDateMillis);
        slider.set("start", dateInRangePercent);
      }
    });

    nextButton.events.on("click", function () {
      nextButton.set("active", false);
      if (dateIndexRef.current < dates.length - 1) {
        const lastDateMillis = dayjs(dates[dates.length - 1]).valueOf();
        const firstDateMillis = dayjs("2025-01-20").valueOf(); // Inauguration date
        setDateIndex(dateIndexRef.current + 1);
        const date = dates[dateIndexRef.current + 1];
        const dateInRangePercent = (dayjs(date).valueOf() - firstDateMillis) / (lastDateMillis - firstDateMillis);
        slider.set("start", dateInRangePercent);
      }
    });

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
      x: am5percent(25),
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
  }, []);

  return <div><div style={{ width: "100%", height: "50vh" }} id="chartdiv" />
    <div className='textblock'>
      <div><small>Hover over a country to view visualizations of the tariffs on that country in terms of US states population/GDP.</small></div>
      <div><small>Click a country to lock it, and click it again to unlock the country and make hover functional.</small></div>
    </div>
    <div className='textblock'>
      <h2>Visualizations</h2>
      <div style={{ display: "flex", alignContent: 'center', alignItems: "center" }}><span><PersonSVG width='75px' /></span><span>= $66,200 / year</span></div>
      <AmChartsUSAMap id="average-salary-map" valueUSD={visualizationValueUSD} averageSalary={66_200} />
    </div>
  </div>
}


function App() {
  return (
    <div>
      <div className='textblock'>
        <h1>The Effect of Trump Tariffs</h1>
        <p>In under 3 months, Trump has announced and implemented radical tariffs that affect the entire rest of the world. The map shows the approximate value of the tariffs, and attempts to put the insane numbers to scale.</p>
      </div>
      <AmChartsMap />
    </div>
  )
}

export default App;