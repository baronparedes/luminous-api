import moment from 'moment';

import {Month, Period} from '../@types/models';

export function getCurrentMonthYear(): Period {
  const [year, month] = moment().format('YYYY MMM').split(' ');
  return {
    year: Number(year),
    month: month.toUpperCase() as Month,
  };
}

export function toMonthValue(value: Month) {
  return Number(moment().month(value).format('M'));
}

export function toMonthName(value: number) {
  return moment().month(value).format('MMM').toUpperCase() as Month;
}

export function toTransactionPeriod(year: number, month: Month) {
  const dateString = `${year}-${moment().month(month).format('MM')}-01`;
  return new Date(dateString);
}

export function subtractFromYearMonth(
  year: number,
  month: Month,
  amount: number
) {
  const result = moment().month(month).year(year).subtract(amount, 'month');
  const [x, y] = result.format('YYYY-MMM').split('-');
  return {
    year: Number(x),
    month: y.toUpperCase() as Month,
  };
}
