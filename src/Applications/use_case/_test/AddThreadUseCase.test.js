const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Thread Title',
      body: 'Thread Body',
    };
    const owner = 'user-123';

    const expectedAddedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    };

    // Mocking repository
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn().mockResolvedValue(expectedAddedThread);

    // Create use case instance
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Act
    const addedThread = await addThreadUseCase.execute(useCasePayload, owner);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread(useCasePayload), owner);
  });

  it('should throw error when payload does not contain needed properties', async () => {
    // Arrange
    const useCasePayload = { title: 'Thread Title' }; // body missing
    const owner = 'user-123';

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload, owner))
      .rejects
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when title exceeds character limit', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a'.repeat(121),
      body: 'Thread Body',
    };
    const owner = 'user-123';

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload, owner))
      .rejects
      .toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should throw error when title or body is not a string', async () => {
    // Arrange
    const useCasePayload = {
      title: 123, // Not a string
      body: true, // Not a string
    };
    const owner = 'user-123';

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload, owner))
      .rejects
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
