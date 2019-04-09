const { Client } = require('pg');

const debug = require('./debug');
const { toPositiveNumberOrDefault } = require('../utils/validation');

let count = 0;
let time = new Date();

function timeFormatter(timeDelta) {
  const sec = timeDelta / 1000;
  if (sec < 180) {
    return `${sec.toFixed(4)} sec`;
  }
  const min = sec / 60;
  if (min < 120) {
    return `${min.toFixed(4)} min`;
  }
  const hours = min / 60;
  return `${hours.toFixed(4)} hours`;
}

function logging(sqlQuery, values) {
  console.info('-------------------------------------------------------------');
  const curtime = new Date();
  const timeDelta = curtime - time;
  console.info(
    'query count:',
    count,
    '  -  ',
    `time since last query: ${timeFormatter(timeDelta)}`,
  );
  time = curtime;
  count += 1;
  console.info('-q-q-q-');
  console.info(sqlQuery);
  console.info('-v-v-v-');
  console.info(values);
  console.info('-+-+-+-');
}

/**
 * Execute an SQL query.
 *
 * @param {string} sqlQuery - SQL query to execute
 * @param {array} [values=[]] - Values for parameterized query
 *
 * @returns {Promise} Promise representing the result of the SQL query
 */
async function query(sqlQuery, values = []) {
  logging(sqlQuery, values);

  const connectionString = process.env.DATABASE_URL;

  const client = new Client({ connectionString });
  await client.connect();

  let result;

  try {
    result = await client.query(sqlQuery, values);
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }

  return result;
}

async function pagedQuery(
  sqlQuery,
  values = [],
  { offset = 0, limit = 10 } = {},
) {
  console.assert(Array.isArray(values), 'values should be an array');

  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);

  return {
    limit: limitAsNumber,
    offset: offsetAsNumber,
    items: result.rows,
  };
}

async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter(i => typeof i === 'string');
  const filteredValues = values.filter(
    i => typeof i === 'string' || typeof i === 'number' || i instanceof Date,
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);

  debug('Conditional update', q, queryValues);

  const result = await query(q, queryValues);

  return result;
}

module.exports = {
  query,
  pagedQuery,
  conditionalUpdate,
};
