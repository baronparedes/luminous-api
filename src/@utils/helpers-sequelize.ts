import {Op, Sequelize} from 'sequelize';

export type OPERATOR = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq';
const OP = {
  eq: '=',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
  neq: '<>',
};

export function iLike(column: string, searchCriteria?: string) {
  return Sequelize.where(Sequelize.fn('lower', Sequelize.col(column)), {
    [Op.like]: `%${searchCriteria?.toLowerCase()}%`,
  });
}

export function byYear(
  column: string,
  year: number,
  operator: OPERATOR = 'eq'
) {
  return Sequelize.literal(
    `CAST(SUBSTR(CAST(${column} AS text), 1, 4) AS int) ${OP[operator]} ${year}`
  );
}
