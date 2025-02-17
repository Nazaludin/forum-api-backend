const Jwt = require('@hapi/jwt');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and persist thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding',
        body: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // Buat user terlebih dahulu
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

      // Pastikan user sudah ada di database
      const user = await UsersTableTestHelper.findUsersById('user-123');

      // Generate JWT token
      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(201);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should respond 400 when request payload is missing required properties', async () => {
      // Arrange
      const requestPayload = { body: 'Dicoding Indonesia' };
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 when request payload has invalid data types', async () => {
      // Arrange
      const requestPayload = { title: 123, body: 'Dicoding Indonesia' };
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persist comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Ini adalah komentar',
      };
      const server = await createServer(container);

      // Buat user terlebih dahulu
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Test', owner: 'user-123' });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(201);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond 400 when request payload is missing required properties', async () => {
      // Arrange
      const requestPayload = {}; // Tidak ada 'content'
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Test', owner: 'user-123' });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 when request payload has invalid data types', async () => {
      // Arrange
      const requestPayload = { content: 123 }; // Content seharusnya string
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Test', owner: 'user-123' });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });
  });

  // DELETE COMMENT
  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and soft delete the comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Buat user & thread
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', title: 'Thread Dicoding', body: 'Isi Thread Dicoding', owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Komentar Dicoding',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      // Generate JWT token
      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(200);

      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      // Pastikan komentar masih ada tetapi dalam kondisi soft delete
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true); // Harus true karena soft delete
    });

    it('should respond 404 when comment does not exist', async () => {
      // Arrange
      const server = await createServer(container);
      // await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      // Buat user & thread
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', title: 'Thread Dicoding', body: 'Isi Thread Dicoding', owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Komentar Dicoding',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const accessToken = Jwt.token.generate(
        { id: 'user-123' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-999', // ID tidak ada
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should respond 403 when user is not the comment owner', async () => {
      // Arrange
      const server = await createServer(container);

      // Buat 2 user
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'anotheruser' });

      // Buat thread & komentar milik user-123
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', title: 'Thread Dicoding', body: 'Isi thread dicoding', owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Komentar Dicoding',
        threadId: 'thread-123',
        owner: 'user-123',
        is_deleted: false,
      });

      // Generate token untuk user-456 (bukan pemilik komentar)
      const accessToken = Jwt.token.generate(
        { id: 'user-456' },
        process.env.ACCESS_TOKEN_KEY,
      );

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses untuk menghapus komentar ini');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread details', async () => {
    // Arrange
      const server = await createServer(container);

      // Tambahkan user dan thread ke dalam database
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread Dicoding',
        body: 'Isi Thread Dicoding',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Komentar Dicoding',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      expect(response.statusCode).toEqual(200);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-123');
      expect(responseJson.data.thread.title).toEqual('Thread Dicoding');
      expect(responseJson.data.thread.body).toEqual('Isi Thread Dicoding');
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toEqual('comment-123');
      expect(responseJson.data.thread.comments[0].content).toEqual('Komentar Dicoding');
    });

    it('should respond 404 when thread does not exist', async () => {
    // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-999', // ID thread tidak ada
      });

      // Assert
      expect(response.statusCode).toEqual(404);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
