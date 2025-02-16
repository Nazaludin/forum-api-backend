const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment, threadId, owner) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
        text: 'INSERT INTO comments (id, content, thread_id, owner) VALUES ($1, $2, $3, $4) RETURNING id, content, thread_id, owner',
        values: [id, content, threadId, owner], 
      };
      

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
        text: 'SELECT owner FROM comments WHERE id = $1',
        values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
        throw new NotFoundError('Komentar tidak ditemukan');
    }

    if (result.rows[0].owner !== userId) {
        throw new AuthorizationError('Anda tidak memiliki akses untuk menghapus komentar ini');
    }
}

async softDeleteComment(commentId) {
    const query = {
        text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
        values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
        throw new NotFoundError('Komentar tidak ditemukan');
    }
}

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT id, content, thread_id, owner FROM comments WHERE id = $1',
      values: [commentId],
    };
  
    const result = await this._pool.query(query);
  
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  
    return new AddedComment(result.rows[0]);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
        text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_deleted 
               FROM comments
               JOIN users ON comments.owner = users.id
               WHERE comments.thread_id = $1
               ORDER BY comments.date ASC`,
        values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => new CommentDetail({
        ...row,
        date: row.date.toISOString(),
      }));
      
}

  
}

module.exports = CommentRepositoryPostgres;
