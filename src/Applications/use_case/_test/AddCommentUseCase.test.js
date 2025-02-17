const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Comment Content',
    };
    const owner = 'user-123';
    const threadId = 'thread-123';

    // Mocking repositories
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn().mockResolvedValue(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner,
      }),
    );

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act
    const addedComment = await addCommentUseCase.execute(useCasePayload, threadId, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.addComment)
      .toHaveBeenCalledWith(expect.any(NewComment), threadId, owner);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner,
    }));
  });

  it('should throw error when payload does not contain needed properties', async () => {
    // Arrange
    const useCasePayload = {};
    const owner = 'user-123';
    const threadId = 'thread-123';

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: { verifyThreadExist: jest.fn() },
      commentRepository: { addComment: jest.fn() },
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload, threadId, owner))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when content is not a string', async () => {
    // Arrange
    const useCasePayload = {
      content: 123, // Not a string
    };
    const owner = 'user-123';
    const threadId = 'thread-123';

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: { verifyThreadExist: jest.fn() },
      commentRepository: { addComment: jest.fn() },
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload, threadId, owner))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
