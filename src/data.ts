import dayjs, { Dayjs } from "dayjs";

export const valid2DigitCountryCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GO",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "JU",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM-DQ",
  "UM-FQ",
  "UM-HQ",
  "UM-JQ",
  "UM-MQ",
  "UM-WQ",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "XK",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW",
] as const; // Extracted these by running am5geodataWorldLow.features.map(item => item.id).sort()

export type Valid2DigitCountryCodes = (typeof valid2DigitCountryCodes)[number];

export type Valid2DigitCountryCodesWithoutUSA = Exclude<
  Valid2DigitCountryCodes,
  "US"
>;

export type Valid2DigitCountryCodesWithoutUSAAndWithGlobal =
  | Valid2DigitCountryCodesWithoutUSA
  | "GLOBAL"; // Special case for global tariffs, if there is a global

export const validStateCodes = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

export type ValidStateCodes = (typeof validStateCodes)[number];

export interface BaseTariffDataEntry {
  percentValue: number; // 25% -> {"percentValue": 25}
  announcedDate: Dayjs;
  announcedDateEnd?: Dayjs; // Optional end date for the tariff
  effectiveDate?: Dayjs; // Optional effective date for the tariff
  effectiveDateEnd?: Dayjs; // Optional end date for the effective tariff
}

export interface TariffDataEntryNonGlobal extends BaseTariffDataEntry {
  toCountry: Valid2DigitCountryCodesWithoutUSA;
}

export interface TariffDataEntryGlobal extends BaseTariffDataEntry {
  toCountry: "GLOBAL"; // Special case for global tariffs, if there is a global tariff
  excludeCountries?: Valid2DigitCountryCodesWithoutUSA[]; // Countries to exclude from the global tariff
}

export type TariffDataEntry = TariffDataEntryNonGlobal | TariffDataEntryGlobal;

// https://tradingeconomics.com/united-states/imports-by-country
export const COUNTRY_TRADE_DATA: Partial<
  Record<Valid2DigitCountryCodesWithoutUSA, number>
> = {
  MX: 509960000000,
  CN: 462620000000,
  CA: 421210000000,
  DE: 163390000000,
  JP: 152070000000,
  VN: 142480000000,
  KR: 135460000000,
  IE: 103760000000,
  IN: 91230000000,
  IT: 78420000000,
  GB: 68830000000,
  TH: 66010000000,
  CH: 64000000000,
  FR: 61140000000,
  MY: 53850000000,
  BR: 44180000000,
  SG: 43550000000,
  NL: 35030000000,
  ID: 29550000000,
  BE: 28270000000,
  IL: 22520000000,
  ES: 22090000000,
  SE: 18490000000,
  CO: 18430000000,
  AT: 17890000000,
  TR: 17800000000,
  CL: 17410000000,
  AU: 16570000000,
  ZA: 14820000000,
  PH: 14590000000,
  PL: 14080000000,
  KH: 13360000000,
  SA: 13190000000,
  HU: 12840000000,
  CR: 12010000000,
  DK: 10240000000,
  PE: 10010000000,
  EC: 9100000000,
  BD: 8780000000,
  CZ: 8310000000,
  SK: 8300000000,
  FI: 8250000000,
  AE: 7800000000,
  DO: 7730000000,
  IQ: 7690000000,
  AR: 7410000000,
  PT: 6880000000,
  NO: 6880000000,
  SI: 6330000000,
  VE: 6320000000,
  HK: 6050000000,
  NG: 5870000000,
  NZ: 5860000000,
  HN: 5800000000,
  GY: 5510000000,
  PK: 5470000000,
  GT: 5460000000,
  NI: 4770000000,
  RO: 4030000000,
  TT: 3490000000,
  JO: 3440000000,
  RU: 3270000000,
  LK: 3160000000,
  EG: 2720000000,
  DZ: 2540000000,
  KZ: 2410000000,
  SV: 2410000000,
  GR: 2400000000,
  LT: 2080000000,
  MA: 1980000000,
  AO: 1910000000,
  QA: 1870000000,
  BS: 1840000000,
  KW: 1750000000,
  BG: 1530000000,
  LY: 1490000000,
  OM: 1410000000,
  UY: 1280000000,
  BH: 1270000000,
  UA: 1230000000,
  GH: 1210000000,
  TN: 1150000000,
  IS: 1110000000,
  EE: 1100000000,
  CI: 1050000000,
  HR: 1030000000,
  RS: 877270000,
  LA: 849740000,
  KE: 758900000,
  MG: 753230000,
  LU: 721860000,
  MM: 683250000,
  LV: 675730000,
  HT: 641770000,
  PA: 580860000,
  BO: 515250000,
  ET: 488730000,
  BW: 415010000,
  PY: 377940000,
  JM: 376340000,
  FJ: 347030000,
  CD: 327430000,
  FO: 286230000,
  NA: 279550000,
  LB: 268300000,
  CM: 260330000,
  BN: 248560000,
  MU: 244790000,
  SN: 243690000,
  LS: 242460000,
  MT: 224180000,
  MZ: 220300000,
  TZ: 211410000,
  BA: 186170000,
  GA: 183190000,
  MK: 179320000,
  GE: 176710000,
  ZM: 171470000,
  AZ: 162760000,
  MD: 142050000,
  UG: 138090000,
  GQ: 137850000,
  AL: 133150000,
  AM: 129030000,
  NP: 128520000,
  MO: 111940000,
  TG: 97450000,
  SR: 96640000,
  BZ: 86370000,
  TD: 82730000,
  PG: 80900000,
  LR: 73770000,
  ZW: 69530000,
  CY: 60390000,
  BJ: 53490000,
  KY: 51020000,
  BB: 50590000,
  UZ: 44410000,
  PF: 43590000,
  MW: 43010000,
  CG: 41620000,
  DJ: 40570000,
  NC: 35360000,
  GL: 33200000,
  RW: 30960000,
  SL: 29610000,
  MN: 27540000,
  SM: 26140000,
  AG: 24040000,
  BM: 23780000,
  AF: 23770000,
  SZ: 23310000,
  MH: 23190000,
  BY: 21210000,
  KN: 20460000,
  KG: 17170000,
  GD: 15900000,
  TM: 15670000,
  ME: 15610000,
  VU: 14200000,
  SD: 13210000,
  SY: 11180000,
  AW: 10940000,
  YE: 9330000,
  NE: 8500000,
  VC: 8400000,
  SC: 8070000,
  PS: 7630000,
  GN: 6570000,
  MV: 6360000,
  IR: 6290000,
  TL: 6080000,
  ML: 5680000,
  WS: 5040000,
  CU: 4890000,
  TJ: 4710000,
  BF: 4690000,
  CV: 4690000,
  BI: 3800000,
  BT: 3530000,
  AD: 3330000,
  TO: 3330000,
  MR: 2920000,
  SO: 2600000,
  DM: 2380000,
  PW: 2330000,
  GM: 2170000,
  KM: 1870000,
  CF: 1470000,
  SB: 1350000,
  KI: 958010,
  ER: 883310,
  SS: 808310,
  ST: 591750,
  GW: 130240,
  KP: 57460,
};

export const EU_COUNTRIES: Valid2DigitCountryCodes[] = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

const LiberationDayTariffPercentages: Partial<
  Record<Valid2DigitCountryCodes, number>
> = {
  DZ: 30,
  AO: 32,
  AR: 10,
  AU: 10,
  BD: 37,
  BA: 35,
  BW: 37,
  BR: 10,
  BN: 24,
  KH: 49,
  CM: 11,
  TD: 13,
  CI: 21,
  CD: 11,
  GQ: 13,
  FK: 41,
  FJ: 32,
  GY: 38,
  IN: 26,
  ID: 32,
  IQ: 39,
  IL: 17,
  JP: 24,
  JO: 20,
  KZ: 27,
  LA: 48,
  LS: 50,
  LY: 31,
  LI: 37,
  MG: 47,
  MW: 17,
  MY: 24,
  MU: 40,
  MD: 31,
  MZ: 16,
  MM: 45,
  NA: 21,
  NR: 30,
  NI: 18,
  NG: 14,
  MK: 33,
  NO: 15,
  PK: 29,
  PH: 17,
  RU: 0,
  SA: 10,
  RS: 37,
  ZA: 30,
  KR: 25,
  LK: 44,
  CH: 31,
  SY: 41,
  TW: 32,
  TH: 36,
  TN: 28,
  TR: 10,
  GB: 10,
  VU: 22,
  VE: 15,
  VN: 46,
  ZM: 17,
  ZW: 18,
};

EU_COUNTRIES.forEach((country) => {
  LiberationDayTariffPercentages[country] = 20; // All EU countries got a 20% tariff on Liberation Day
});

// Order matters, as for any set of days, the last entry takes precedence
export const TARIFF_DATA: TariffDataEntry[] = [
  {
    toCountry: "CA",
    percentValue: 25,
    announcedDate: dayjs("2025-02-01"),
    effectiveDate: dayjs("2025-03-04"),
  },
  {
    toCountry: "MX",
    percentValue: 25,
    announcedDate: dayjs("2025-02-01"),
    effectiveDate: dayjs("2025-03-04"),
  },
  // The China situation is insane RN
  {
    toCountry: "CN",
    percentValue: 10,
    announcedDate: dayjs("2025-02-01"),
    effectiveDate: dayjs("2025-03-04"),
  },
  {
    toCountry: "CN",
    percentValue: 20,
    announcedDate: dayjs("2025-03-03"),
    effectiveDate: dayjs("2025-03-04"),
  },
  {
    toCountry: "CN",
    percentValue: 54,
    announcedDate: dayjs("2025-04-02"),
    effectiveDate: dayjs("2025-04-05"),
  },
  {
    toCountry: "CN",
    percentValue: 104,
    announcedDate: dayjs("2025-04-07"),
    effectiveDate: dayjs("2025-04-09"),
  },
  {
    toCountry: "CN",
    percentValue: 125,
    announcedDate: dayjs("2025-04-09"),
    effectiveDate: dayjs("2025-04-09"),
  },
  {
    toCountry: "CN",
    percentValue: 145,
    announcedDate: dayjs("2025-04-10"),
    effectiveDate: dayjs("2025-04-10"),
  },
  // Absolute cluster*uck, tariff policy is so random
  // All countries not excluded got the global 10% tariff on effect the 5th, and the individual country tariffs on effect the 9th
  // On the 9th, the 10% tariff stayed, and the individual tariffs were paused for 90 days (out of scope)
  {
    toCountry: "GLOBAL",
    percentValue: 10,
    announcedDate: dayjs("2025-04-02"),
    effectiveDate: dayjs("2025-04-05"),
    excludeCountries: ["CN", "MX", "CA"],
  },
];

Object.entries(LiberationDayTariffPercentages).forEach(
  ([country, percentValue]) => {
    TARIFF_DATA.push({
      toCountry: country as Valid2DigitCountryCodesWithoutUSA,
      percentValue: percentValue,
      announcedDate: dayjs("2025-04-02"),
      effectiveDate: dayjs("2025-04-09"),
    });
  }
);

TARIFF_DATA.push({
  toCountry: "GLOBAL",
  percentValue: 10,
  announcedDate: dayjs("2025-04-09"),
  // Hopefully this overrides everything
  effectiveDate: dayjs("2025-04-09"),
  excludeCountries: ["CN", "MX", "CA"],
});

export type TariffType = "announced" | "effective";

export interface FlattenedTariffDataEntry {
  id: Valid2DigitCountryCodesWithoutUSA;
  percentValue: number;
  approximateValueOfImportsImpacted: number; // Essentially just COUNTRY_TRADE_DATA[country] * percentValue / 100
  date: Dayjs;
  type: TariffType;
}

function keepOnlyUnique<T, V>(array: T[], keyFunc: (item: T) => V): T[] {
  const seen = new Set<V>();
  return array.filter((item) => {
    const key = keyFunc(item);
    if (seen.has(key)) {
      return false;
    } else {
      seen.add(key);
      return true;
    }
  });
}

function flattenData(): Map<Dayjs, FlattenedTariffDataEntry[]> {
  const latestAnnouncedByCountry: Partial<
    Record<
      Valid2DigitCountryCodesWithoutUSA,
      Omit<FlattenedTariffDataEntry, "type">
    >
  > = {};
  const latestEffectiveByCountry: Partial<
    Record<
      Valid2DigitCountryCodesWithoutUSA,
      Omit<FlattenedTariffDataEntry, "type">
    >
  > = {};
  const flattenedData: FlattenedTariffDataEntry[] = [];

  function handleNewEntry(tariff: TariffDataEntryNonGlobal) {
    const { toCountry, percentValue, announcedDate, effectiveDate } = tariff;
    const approximateValueOfImportsImpacted =
      (COUNTRY_TRADE_DATA[toCountry] ?? 0) * (percentValue / 100);
    if (
      latestAnnouncedByCountry[toCountry] &&
      latestAnnouncedByCountry[toCountry].date.isBefore(announcedDate)
    ) {
      // If the new announced date is later, add a new entry to the flattened data
      flattenedData.push({
        ...latestAnnouncedByCountry[toCountry],
        type: "announced",
      });
    }
    latestAnnouncedByCountry[toCountry] = {
      id: toCountry,
      percentValue,
      approximateValueOfImportsImpacted,
      date: announcedDate,
    };
    if (effectiveDate) {
      if (
        latestEffectiveByCountry[toCountry] &&
        latestEffectiveByCountry[toCountry].date.isBefore(effectiveDate)
      ) {
        // If the new effective date is later, add a new entry to the flattened data
        flattenedData.push({
          ...latestEffectiveByCountry[toCountry],
          type: "effective",
        });
      }
      latestEffectiveByCountry[toCountry] = {
        id: toCountry,
        percentValue,
        approximateValueOfImportsImpacted,
        date: effectiveDate,
      };
    }
  }

  for (const tariff of TARIFF_DATA) {
    const { toCountry } = tariff;
    if (toCountry === "GLOBAL") {
      const { excludeCountries } = tariff;
      for (const country of valid2DigitCountryCodes) {
        if (country !== "US" && !(excludeCountries ?? []).includes(country)) {
          handleNewEntry({
            ...tariff,
            toCountry: country,
          });
        }
      }
    } else {
      handleNewEntry(tariff);
    }
  }

  Object.values(latestAnnouncedByCountry).forEach((entry) => {
    if (entry) {
      flattenedData.push({ ...entry, type: "announced" });
    }
  });
  Object.values(latestEffectiveByCountry).forEach((entry) => {
    if (entry) {
      flattenedData.push({ ...entry, type: "effective" });
    }
  });

  // Sort by date
  flattenedData.sort((a, b) => a.date.diff(b.date));

  const flattened = Map.groupBy(flattenedData, (item) => item.date.valueOf());
  const keys = Array.from(flattened.keys());
  keys.sort((a, b) => a - b);
  for (let i = 1; i < keys.length; i++) {
    // This adds in everything from the previous date to the current date, and then later we keep the most recent entry
    // Basically, if China gets tariffs on one day and then another country gets tariffs on another day but not china this ensures the China tariffs come through
    flattened.set(keys[i], [
      ...flattened.get(keys[i - 1])!,
      ...flattened.get(keys[i])!,
    ]);
  }
  const ret = new Map<Dayjs, FlattenedTariffDataEntry[]>();
  flattened.forEach((value, key) => {
    ret.set(
      dayjs(key),
      keepOnlyUnique(
        value.toReversed(),
        // We do this since there are different effective/announced tariffs for the same country on the same day
        (item): `${Valid2DigitCountryCodesWithoutUSA}${TariffType}` =>
          `${item.id}${item.type}`
      ).reverse()
    );
  });
  return ret;
}

export const FLATTENED_TARIFF_DATA = flattenData();

export const POP_PER_STATE_2020_CENSUS: Record<ValidStateCodes, number> = {
  AL: 5024279,
  AK: 733391,
  AZ: 7151502,
  AR: 3011524,
  CA: 39538223,
  CO: 5773714,
  CT: 3605944,
  DE: 989948,
  DC: 689545,
  FL: 21538187,
  GA: 10711908,
  HI: 1455271,
  ID: 1839106,
  IL: 12812508,
  IN: 6785528,
  IA: 3190369,
  KS: 2937880,
  KY: 4505836,
  LA: 4657757,
  ME: 1362359,
  MD: 6177224,
  MA: 7029917,
  MI: 10077331,
  MN: 5706494,
  MS: 2961279,
  MO: 6154913,
  MT: 1084225,
  NE: 1961504,
  NV: 3104614,
  NH: 1377529,
  NJ: 9288994,
  NM: 2117522,
  NY: 20201249,
  NC: 10439388,
  ND: 779094,
  OH: 11799448,
  OK: 3959353,
  OR: 4237256,
  PA: 13002700,
  RI: 1097379,
  SC: 5118425,
  SD: 886667,
  TN: 6910840,
  TX: 29145505,
  UT: 3271616,
  VT: 643077,
  VA: 8631393,
  WA: 7705281,
  WV: 1793716,
  WI: 5893718,
  WY: 576851,
};

export const GDP_PER_STATE_MILLIONS: Record<ValidStateCodes, number> = {
  AL: 321238,
  AK: 69969,
  AZ: 552167,
  AR: 188723,
  CA: 4103124,
  CO: 553323,
  CT: 365723,
  DE: 103253,
  DC: 186165,
  FL: 1705565,
  GA: 882535,
  HI: 115627,
  ID: 128132,
  IL: 1137244,
  IN: 527381,
  IA: 257021,
  KS: 234673,
  KY: 293021,
  LA: 327782,
  ME: 98606,
  MD: 542766,
  MA: 780666,
  MI: 706616,
  MN: 500851,
  MS: 157491,
  MO: 451201,
  MT: 75999,
  NE: 185411,
  NV: 260728,
  NH: 121189,
  NJ: 846587,
  NM: 140542,
  NY: 2297028,
  NC: 839122,
  ND: 75399,
  OH: 927740,
  OK: 265779,
  OR: 331029,
  PA: 1024206,
  RI: 82493,
  SC: 349965,
  SD: 75179,
  TN: 549709,
  TX: 2709393,
  UT: 300904,
  VT: 45707,
  VA: 764475,
  WA: 854683,
  WV: 107660,
  WI: 451285,
  WY: 52946,
};
