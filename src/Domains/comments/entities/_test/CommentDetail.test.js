const CommentDetail = require('../CommentDetail');

describe('CommentDetail entity', () => {
    it('should create CommentDetail object correctly', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Sebuah komentar',
            is_deleted: false,
        };

        // Action
        const commentDetail = new CommentDetail(payload);

        // Assert
        expect(commentDetail.id).toEqual(payload.id);
        expect(commentDetail.username).toEqual(payload.username);
        expect(commentDetail.date).toEqual(payload.date);
        expect(commentDetail.content).toEqual(payload.content);
    });

    it('should return "**komentar telah dihapus**" if comment is deleted', () => {
        // Arrange
        const payload = {
            id: 'comment-456',
            username: 'dicoding',
            date: '2021-08-08T07:26:21.338Z',
            content: 'Ini komentar yang akan dihapus',
            is_deleted: true,
        };

        // Action
        const commentDetail = new CommentDetail(payload);

        // Assert
        expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    });

    it('should throw an error when payload is missing required properties', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
        };

        // Action & Assert
        expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw an error when payload has incorrect data types', () => {
        // Arrange
        const payload = {
            id: 123, 
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Sebuah komentar',
            is_deleted: 'false',
        };

        // Action & Assert
        expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
});
