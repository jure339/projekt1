import postgres from 'postgres';

const sql = postgres({
  ssl: 'require'
});

export default sql;
