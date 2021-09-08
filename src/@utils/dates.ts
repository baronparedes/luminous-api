import moment from 'moment';

import {Month} from '../@types/models';

export function toMonthValue(value: Month) {
  return Number(moment().month(value).format('M'));
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
