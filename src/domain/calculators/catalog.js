const numberField = (key, label, options = {}) => ({
  key,
  label,
  type: "number",
  step: options.step ?? "any",
  defaultValue: options.defaultValue ?? "",
  min: options.min,
  max: options.max,
  required: options.required !== false
});

export const calculators = [
  {
    id: "percent",
    title: "Százalékkalkulátor",
    category: "Mindennapok",
    icon: "%",
    description: "Mennyi egy szám adott százaléka?",
    fields: [
      numberField("base", "Alapérték"),
      numberField("percent", "Százalék (%)")
    ],
    api: null
  },
  {
    id: "vat",
    title: "ÁFA-kalkulátor",
    category: "Pénzügy",
    icon: "🧾",
    description: "Nettó, ÁFA és bruttó összeg számítása.",
    fields: [
      numberField("net", "Nettó összeg (Ft)", { min: 0 }),
      numberField("rate", "ÁFA kulcs (%)", { min: 0, max: 100, defaultValue: 27 })
    ],
    api: null
  },
  {
    id: "bmi",
    title: "BMI-kalkulátor",
    category: "Egészség & sport",
    icon: "⚖️",
    description: "Testtömegindex gyors kiszámítása.",
    fields: [
      numberField("weight", "Testsúly (kg)", { min: 1 }),
      numberField("height", "Magasság (cm)", { min: 1 })
    ],
    api: null
  },
  {
    id: "fuel",
    title: "Üzemanyagköltség",
    category: "Autó & közlekedés",
    icon: "⛽",
    description: "Út költsége fogyasztás alapján.",
    fields: [
      numberField("distance", "Távolság (km)", { min: 0 }),
      numberField("consumption", "Fogyasztás (l/100 km)", { min: 0 }),
      numberField("price", "Üzemanyagár (Ft/l)", { min: 0 })
    ],
    api: null
  },
  {
    id: "compound",
    title: "Kamatos kamat",
    category: "Pénzügy",
    icon: "📈",
    description: "Befektetés jövőértékének becslése.",
    fields: [
      numberField("capital", "Kezdőtőke (Ft)", { min: 0 }),
      numberField("monthly", "Havi befizetés (Ft)", { min: 0, defaultValue: 0 }),
      numberField("rate", "Éves hozam (%)", { min: -99.99 }),
      numberField("years", "Időtáv (év)", { min: 0.01 })
    ],
    api: null
  },
  {
    id: "loan",
    title: "Hiteltörlesztő",
    category: "Pénzügy",
    icon: "🏦",
    description: "Várható havi annuitásos törlesztőrészlet.",
    fields: [
      numberField("amount", "Hitelösszeg (Ft)", { min: 0 }),
      numberField("rate", "Éves kamat (%)", { min: 0 }),
      numberField("years", "Futamidő (év)", { min: 0.01 })
    ],
    api: null
  },
  {
    id: "discount",
    title: "Kedvezménykalkulátor",
    category: "Mindennapok",
    icon: "🏷️",
    description: "Akciós ár és megtakarítás számítása.",
    fields: [
      numberField("price", "Eredeti ár (Ft)", { min: 0 }),
      numberField("discount", "Kedvezmény (%)", { min: 0, max: 100 })
    ],
    api: null
  },
  {
    id: "pace",
    title: "Tempó-kalkulátor",
    category: "Egészség & sport",
    icon: "🏃",
    description: "Futótempó kiszámítása táv és idő alapján.",
    fields: [
      numberField("distance", "Távolság (km)", { min: 0.01 }),
      numberField("minutes", "Idő (perc)", { min: 0.01 })
    ],
    api: null
  },
  {
    id: "area",
    title: "Területátváltó",
    category: "Átváltók",
    icon: "📐",
    description: "Négyzetméter és gyakori területegységek.",
    fields: [numberField("sqm", "Terület (m²)", { min: 0 })],
    api: null
  }
];
