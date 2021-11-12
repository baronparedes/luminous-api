import {Op, Sequelize} from 'sequelize';

export function iLike(column: string, searchCriteria?: string) {
  return Sequelize.where(Sequelize.fn('lower', Sequelize.col(column)), {
    [Op.like]: `%${searchCriteria?.toLowerCase()}%`,
  });
}

export function byYear(column: string, year: number) {
  return Sequelize.literal(`SUBSTR(CAST(${column} AS text), 1, 4) = '${year}'`);
}
