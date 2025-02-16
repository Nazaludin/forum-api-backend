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
    const expectedThread = new ThreadDetail({
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    });
  
    const expectedComments = [
      new CommentDetail({
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_deleted: false,
      }),
      new CommentDetail({
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**', 
        is_deleted: true,
      }),
    ];
  
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
  
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(expectedThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(expectedComments);
  
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
  
    // Action
    const result = await getThreadByIdUseCase.execute(threadId);
  
    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    
    expect(result).toEqual({
      ...expectedThread,
      comments: expectedComments, 
    });
  });
  

  it('should throw NotFoundError when thread is not found', async () => {
    // Arrange
    const threadId = 'thread-999';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => {
      throw new NotFoundError('Thread tidak ditemukan');
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn();

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(getThreadByIdUseCase.execute(threadId)).rejects.toThrowError('Thread tidak ditemukan');
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled(); 
  });
  
});
