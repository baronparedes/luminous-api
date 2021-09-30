import {
  BindOrReplacements,
  QueryOptions,
  QueryTypes,
  Sequelize,
} from 'sequelize';

function getQueryOptions(
  type: QueryTypes,
  replacements?: BindOrReplacements
): QueryOptions {
  const opts: QueryOptions = {
    type: type,
    mapToModel: false,
    raw: true,
    plain: false,
    logging: false,
    replacements,
  };
  return opts;
}

export default function useSql(database: Sequelize) {
  async function execute(
    sql: string,
    type: QueryTypes,
    replacements?: BindOrReplacements
  ) {
    try {
      const [_, metadata] = await database.query(
        sql,
        getQueryOptions(type, replacements)
      );
      return metadata as number; // affected rows
    } catch (err) {
      return 0;
    }
  }

  async function query<T>(sql: string, replacements?: BindOrReplacements) {
    try {
      const data = await database.query(
        sql,
        getQueryOptions(QueryTypes.SELECT, replacements)
      );
      return data as unknown as T[]; // result set fields should have a 1 to 1 mapping to target type for automapping to work
    } catch (err) {
      return [] as T[];
    }
  }

  return {
    execute,
    query,
  };
}
