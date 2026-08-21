import { formatMoney, formatNumber } from "../../utils/format.js";

const finite = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`${label}: érvénytelen szám.`);
  return value;
};

const positive = (value, label) => {
  finite(value, label);
  if (value <= 0) throw new Error(`${label}: nullánál nagyobb érték szükséges.`);
  return value;
};

export const localEngines = {
  percent(values) {
    const base = finite(values.base, "Alapérték");
    const percent = finite(values.percent, "Százalék");
    return {
      main: formatNumber((base * percent) / 100),
      sub: `${formatNumber(percent)}% ennyi a(z) ${formatNumber(base)} értékből.`
    };
  },

  vat(values) {
    const net = finite(values.net, "Nettó összeg");
    const rate = finite(values.rate, "ÁFA kulcs");
    const vat = (net * rate) / 100;
    return {
      main: formatMoney(net + vat),
      sub: `ÁFA: ${formatMoney(vat)} · Nettó: ${formatMoney(net)}`
    };
  },

  bmi(values) {
    const weight = positive(values.weight, "Testsúly");
    const height = positive(values.height, "Magasság") / 100;
    const bmi = weight / height ** 2;
    const category = bmi < 18.5 ? "sovány" : bmi < 25 ? "normál tartomány" : bmi < 30 ? "túlsúlyos tartomány" : "elhízás tartománya";
    return { main: formatNumber(bmi, 1), sub: `Besorolás: ${category}.` };
  },

  fuel(values) {
    const distance = finite(values.distance, "Távolság");
    const consumption = finite(values.consumption, "Fogyasztás");
    const price = finite(values.price, "Üzemanyagár");
    const liters = (distance * consumption) / 100;
    return {
      main: formatMoney(liters * price),
      sub: `Szükséges üzemanyag: ${formatNumber(liters)} liter.`
    };
  },

  compound(values) {
    const capital = finite(values.capital, "Kezdőtőke");
    const monthly = finite(values.monthly, "Havi befizetés");
    const rate = finite(values.rate, "Éves hozam");
    const years = positive(values.years, "Időtáv");
    if (rate <= -100) throw new Error("Az éves hozam nem lehet -100% vagy kisebb.");
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const growth = (1 + monthlyRate) ** months;
    const futureValue = capital * growth + (monthlyRate ? monthly * ((growth - 1) / monthlyRate) : monthly * months);
    return {
      main: formatMoney(futureValue),
      sub: `Befizetett összeg: ${formatMoney(capital + monthly * months)}.`
    };
  },

  loan(values) {
    const amount = finite(values.amount, "Hitelösszeg");
    const rate = finite(values.rate, "Éves kamat");
    const years = positive(values.years, "Futamidő");
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const payment = monthlyRate
      ? (amount * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1)
      : amount / months;
    return {
      main: `${formatMoney(payment)} / hó`,
      sub: `Teljes visszafizetés kb. ${formatMoney(payment * months)}.`
    };
  },

  discount(values) {
    const price = finite(values.price, "Eredeti ár");
    const discount = finite(values.discount, "Kedvezmény");
    if (discount < 0 || discount > 100) throw new Error("A kedvezmény 0 és 100% közötti lehet.");
    const saving = (price * discount) / 100;
    return { main: formatMoney(price - saving), sub: `Megtakarítás: ${formatMoney(saving)}.` };
  },

  pace(values) {
    const distance = positive(values.distance, "Távolság");
    const minutes = positive(values.minutes, "Idő");
    const pace = minutes / distance;
    let minutePart = Math.floor(pace);
    let secondPart = Math.round((pace - minutePart) * 60);
    if (secondPart === 60) {
      minutePart += 1;
      secondPart = 0;
    }
    return {
      main: `${minutePart}:${String(secondPart).padStart(2, "0")} perc/km`,
      sub: `Átlagsebesség: ${formatNumber(60 / pace, 1)} km/h.`
    };
  },

  area(values) {
    const sqm = finite(values.sqm, "Terület");
    return {
      main: `${formatNumber(sqm / 10000, 4)} hektár`,
      sub: `${formatNumber(sqm * 10.7639)} négyzetláb · ${formatNumber(sqm / 100)} ár`
    };
  }
};
