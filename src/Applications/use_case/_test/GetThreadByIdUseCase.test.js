const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('GetThreadByIdUseCase', () => {
    it('should return thread with comments correctly', async () => {
        // Arrange
        const threadId = 'thread-123';
        const expectedThread = {
            id: threadId,
            title: 'sebuah thread',
            body: 'sebuah body thread',
            date: '2021-08-08T07:19:09.775Z',
            username: 'dicoding',
        };

        const expectedComments = [
            {
                id: 'comment-123',
                username: 'johndoe',
                date: '2021-08-08T07:22:33.555Z',
                content: 'sebuah comment',
                is_deleted: false,
            },
            {
                id: 'comment-456',
                username: 'dicoding',
                date: '2021-08-08T07:26:21.338Z',
                content: 'ini seharusnya terhapus',
                is_deleted: true, // Harus ditampilkan sebagai "**komentar telah dihapus**"
            },
        ];

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        // Mocking method
        mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(expectedThread));
        mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(expectedComments));

        // Create use case instance
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
            comments: [
                {
                    id: 'comment-123',
                    username: 'johndoe',
                    date: '2021-08-08T07:22:33.555Z',
                    content: 'sebuah comment',
                },
                {
                    id: 'comment-456',
                    username: 'dicoding',
                    date: '2021-08-08T07:26:21.338Z',
                    content: '**komentar telah dihapus**',
                },
            ],
        });
    });

    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadId = 'thread-999';
  
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
  
      // Mocking method untuk thread yang tidak ditemukan
      mockThreadRepository.getThreadById = jest.fn(() => {
          throw new NotFoundError('Thread tidak ditemukan');
      });
  
      // Pastikan fungsi `getCommentsByThreadId` tetap dimock agar `toBeCalled` dapat diuji
      mockCommentRepository.getCommentsByThreadId = jest.fn();
  
      // Create use case instance
      const getThreadByIdUseCase = new GetThreadByIdUseCase({
          threadRepository: mockThreadRepository,
          commentRepository: mockCommentRepository,
      });
  
      // Action & Assert
      await expect(getThreadByIdUseCase.execute(threadId)).rejects.toThrowError('Thread tidak ditemukan');
      expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
      expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled(); // ✅ Sekarang tidak error
  });
  
});
