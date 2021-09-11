import {subtractFromYearMonth, toMonthValue} from '../dates';

describe('dates', () => {
  it.each`
    month    | expected
    ${'JAN'} | ${1}
    ${'FEB'} | ${2}
    ${'MAR'} | ${3}
    ${'APR'} | ${4}
    ${'MAY'} | ${5}
    ${'JUN'} | ${6}
    ${'JUL'} | ${7}
    ${'AUG'} | ${8}
    ${'SEP'} | ${9}
    ${'OCT'} | ${10}
    ${'NOV'} | ${11}
    ${'DEC'} | ${12}
  `('should return correct month value for $month', ({month, expected}) => {
    const actual = toMonthValue(month);
    expect(actual).toEqual(expected);
  });

  it.each`
    target   | expectedMonth | expectedYear
    ${'JAN'} | ${'NOV'}      | ${2020}
    ${'FEB'} | ${'DEC'}      | ${2020}
    ${'MAR'} | ${'JAN'}      | ${2021}
    ${'APR'} | ${'FEB'}      | ${2021}
    ${'MAY'} | ${'MAR'}      | ${2021}
    ${'JUN'} | ${'APR'}      | ${2021}
    ${'JUL'} | ${'MAY'}      | ${2021}
    ${'AUG'} | ${'JUN'}      | ${2021}
    ${'SEP'} | ${'JUL'}      | ${2021}
    ${'OCT'} | ${'AUG'}      | ${2021}
    ${'NOV'} | ${'SEP'}      | ${2021}
    ${'DEC'} | ${'OCT'}      | ${2021}
  `(
    'should return correct previous month for $target',
    ({target, expectedMonth, expectedYear}) => {
      const {year, month} = subtractFromYearMonth(2021, target, 2);
      expect(year).toEqual(expectedYear);
      expect(month).toEqual(expectedMonth);
    }
  );
});