import {Op, Sequelize} from 'sequelize';

export function iLike(column: string, searchCriteria?: string) {
  return Sequelize.where(Sequelize.fn('lower', Sequelize.col(column)), {
    [Op.like]: `%${searchCriteria?.toLowerCase()}%`,
  });
}
