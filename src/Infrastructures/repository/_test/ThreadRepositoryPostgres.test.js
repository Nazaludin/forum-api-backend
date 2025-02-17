const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, 'user-123');

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Dicoding',
        owner: 'user-123',
      }));

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);

      // Verifikasi semua field di database
      const threadInDb = threads[0];
      expect(threadInDb.title).toBe('Dicoding');
      expect(threadInDb.body).toBe('Dicoding Indonesia');
      expect(threadInDb.owner).toBe('user-123');
      expect(threadInDb.date).toBeDefined();
      expect(new Date(threadInDb.date)).toBeInstanceOf(Date);
    });
  });

  describe('verifyThreadExist function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread details correctly when thread exists', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: newThread.title,
        body: newThread.body,
        owner: 'user-123',
        date: '2024-02-15T10:00:00.000Z',
      });

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toMatchObject({
        id: 'thread-123',
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
        username: 'dicoding',
      });

      expect(typeof thread.date).toBe('string');
      expect(new Date(thread.date).toISOString()).toBe(thread.date);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('non-existent-id'))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
