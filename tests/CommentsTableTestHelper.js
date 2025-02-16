/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({ id = 'comment-123', content = 'Dicoding', threadId='thread-123', owner = 'user-123',  date = null, 
      is_deleted = false, }) {
      const query = {
        text: `INSERT INTO comments (id, content, thread_id, owner, date, is_deleted) 
                VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP), $6)`,
        values: [id, content, threadId, owner, date, is_deleted],
      };
      await pool.query(query);
    },
  
    async findCommentById(id) {
      const query = {
        text: 'SELECT * FROM comments WHERE id = $1',
        values: [id],
      };
      const result = await pool.query(query);
      return result.rows;
    },

    async softDeleteComment(id) {
        const query = {
            text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
            values: [id],
        };
        await pool.query(query);
    },
  
    async cleanTable() {
      await pool.query('DELETE FROM comments WHERE 1=1');
    },
  };
  
  module.exports = CommentsTableTestHelper;