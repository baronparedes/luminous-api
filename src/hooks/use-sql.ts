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

export default function useSql<T>(database: Sequelize) {
  async function execute(
    sql: string,
    type: QueryTypes,
    replacements?: BindOrReplacements
  ) {
    const [data, metadata] = await database.query(
      sql,
      getQueryOptions(type, replacements)
    );
    return {
      data: data as T[],
      rows: metadata as number,
    };
  }

  async function query<T>(sql: string, replacements?: BindOrReplacements) {
    const data = await database.query(
      sql,
      getQueryOptions(QueryTypes.SELECT, replacements)
    );
    return data as unknown as T[]; // result set fields should have a 1 to 1 mapping to target type for automapping to work
  }

  return {
    execute,
    query,
  };
}
