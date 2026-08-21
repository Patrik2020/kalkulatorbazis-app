export const formatMoney = (value) =>
  `${new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 }).format(value)} Ft`;

export const formatNumber = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("hu-HU", { maximumFractionDigits }).format(value);
