const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should create ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Judul Thread',
      body: 'Isi thread ini',
      date: '2024-02-15T10:00:00.000Z',
      username: 'johndoe',
    };

    // Act
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
  });

  it('should throw error when required properties are missing', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Judul Thread',
      body: 'Isi thread ini',
      date: '2024-02-15T10:00:00.000Z',
    };

    // Act & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when data type does not match the specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Judul Thread',
      body: 'Isi thread ini',
      date: 1700000000000,
      username: true,
    };

    // Act & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
