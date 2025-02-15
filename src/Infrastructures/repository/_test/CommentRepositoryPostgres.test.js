const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'dicoding', body: 'Dicoding Indonesia' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
        // Arrange
        const newComment = new NewComment({
          content: 'Dicoding',
        });
        const fakeIdGenerator = () => '123'; 
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      
        const addedComment = await commentRepositoryPostgres.addComment(newComment, 'thread-123', 'user-123');
      
        // Assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'Dicoding',
          owner: 'user-123',
        }));
      
        const comments = await CommentsTableTestHelper.findCommentById('comment-123');
        expect(comments).toHaveLength(1);
      });
      
  });

  describe('verifyCommentExist function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error when comment exists', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'dicoding', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123'))
        .resolves
        .not.toThrowError();
    });
  });

  describe('getCommentById function', () => {
    it('should return comment details correctly when comment exists', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Dicoding',
        thread_id: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      // Assert
      expect(comment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'Dicoding',
          owner: 'user-123',
        })
      );
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('non-existent-id'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return list of comments ordered by date in ascending order', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'Komentar pertama',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: '2024-02-15T10:01:00.000Z', 
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'Komentar kedua',
        thread_id: 'thread-123',
        owner: 'user-123',
        date: '2024-02-15T10:02:00.000Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-1'); 
      expect(comments[1].id).toEqual('comment-2');
      expect(new Date(comments[0].date).getTime()).toBeLessThanOrEqual(new Date(comments[1].date).getTime());

    });

    it('should return an empty array when there are no comments', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-999'); // Thread yang tidak ada komentar

      // Assert
      expect(comments).toEqual([]);
    });
  });

});
