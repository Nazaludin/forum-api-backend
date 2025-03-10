const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: true,
      body: 'Dicoding Indonesia',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 120 character', () => {
    // Arrange
    const payload = {
      title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesiadicoding',
      body: 'Dicoding Indonesia',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'Dicoding Indonesia',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
