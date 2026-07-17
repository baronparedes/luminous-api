import {Sequelize} from 'sequelize-typescript';

import sequelize from '../db';

export default abstract class BaseService {
  protected repository: Sequelize;

  constructor(repository?: Sequelize) {
    if (repository) {
      this.repository = repository;
    } else {
      this.repository = sequelize;
    }
  }
}
