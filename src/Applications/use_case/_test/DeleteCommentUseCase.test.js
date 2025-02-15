const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('DeleteCommentUseCase', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
        // Arrange
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExist = jest.fn(() => {
            throw new NotFoundError('Thread tidak ditemukan');
        });

        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute({
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        })).rejects.toThrowError(NotFoundError);

        expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    });

    it('should throw NotFoundError when comment does not exist', async () => {
        // Arrange
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExist = jest.fn();
        mockCommentRepository.verifyCommentExist = jest.fn(() => {
            throw new NotFoundError('Komentar tidak ditemukan');
        });

        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute({
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        })).rejects.toThrowError(NotFoundError);

        expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
        expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    });

    it('should throw AuthorizationError when user is not the owner of the comment', async () => {
        // Arrange
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExist = jest.fn();
        mockCommentRepository.verifyCommentExist = jest.fn();
        mockCommentRepository.verifyCommentOwner = jest.fn(() => {
            throw new AuthorizationError('Anda tidak berhak menghapus komentar ini');
        });

        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute({
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        })).rejects.toThrowError(AuthorizationError);

        expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
        expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
        expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    });

    it('should set is_deleted = true instead of deleting comment permanently', async () => {
        // Arrange
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExist = jest.fn();
        mockCommentRepository.verifyCommentExist = jest.fn();
        mockCommentRepository.verifyCommentOwner = jest.fn();
        mockCommentRepository.softDeleteComment = jest.fn();

        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await deleteCommentUseCase.execute({
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        });

        // Assert
        expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
        expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
        expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
        expect(mockCommentRepository.softDeleteComment).toBeCalledWith('comment-123');
    });
});
