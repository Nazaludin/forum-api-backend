const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload, threadId, owner) {
    const newComment = new NewComment(payload);
    await this._threadRepository.verifyThreadExist(threadId);
    return this._commentRepository.addComment(newComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;
