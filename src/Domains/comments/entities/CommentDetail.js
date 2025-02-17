class CommentDetail {
    constructor(payload) {
        this._verifyPayload(payload);

        this.id = payload.id;
        this.username = payload.username;
        this.date = payload.date;
        this.content = payload.is_deleted ? '**komentar telah dihapus**' : payload.content;
    }

    _verifyPayload({ id, username, date, content, is_deleted = false}) {
        if (!id || !username || !date || content === undefined ) {
            throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof content !== 'string' || typeof is_deleted !== 'boolean') {
            throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = CommentDetail;
