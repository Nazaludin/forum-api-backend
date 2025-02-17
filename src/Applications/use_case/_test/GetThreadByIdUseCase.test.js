const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');

describe('GetThreadByIdUseCase', () => {
  it('should return thread with comments correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = '2021-08-08T07:19:09.775Z';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mock implementation for thread repository
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(async (id) => new ThreadDetail({
      id,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: fixedDate,
      username: 'dicoding',
    }));

    // Mock implementation for comment repository
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(async (threadId) => [
      new CommentDetail({
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'sebuah comment',
        is_deleted: false,
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'dicoding',
        date: fixedDate,
        content: '**komentar telah dihapus**',
        is_deleted: true,
      }),
    ]);

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadByIdUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);

    // Verify thread properties
    expect(result).toHaveProperty('id', threadId);
    expect(result).toHaveProperty('title', 'sebuah thread');
    expect(result).toHaveProperty('body', 'sebuah body thread');
    expect(result).toHaveProperty('date', fixedDate);
    expect(result).toHaveProperty('username', 'dicoding');

    // Verify comments structure
    expect(result).toHaveProperty('comments');
    expect(Array.isArray(result.comments)).toBe(true);
    expect(result.comments).toHaveLength(2);

    // Verify first comment
    expect(result.comments[0]).toHaveProperty('id', 'comment-123');
    expect(result.comments[0]).toHaveProperty('username', 'johndoe');
    expect(result.comments[0]).toHaveProperty('date', fixedDate);
    expect(result.comments[0]).toHaveProperty('content', 'sebuah comment');

    // Verify second comment (deleted)
    expect(result.comments[1]).toHaveProperty('id', 'comment-456');
    expect(result.comments[1]).toHaveProperty('username', 'dicoding');
    expect(result.comments[1]).toHaveProperty('date', fixedDate);
    expect(result.comments[1]).toHaveProperty('content', '**komentar telah dihapus**');
  });

  it('should throw NotFoundError when thread is not found', async () => {
    // Arrange
    const threadId = 'thread-999';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mock implementation to throw NotFoundError
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => {
      throw new NotFoundError('Thread tidak ditemukan');
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn();

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(getThreadByIdUseCase.execute(threadId)).rejects.toThrowError(NotFoundError);
    await expect(getThreadByIdUseCase.execute(threadId)).rejects.toThrowError('Thread tidak ditemukan');
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
  });
});
