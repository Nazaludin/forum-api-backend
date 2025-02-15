const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload, owner) {
    const newThread = new NewThread(payload);
    return this._threadRepository.addThread(newThread, owner);
  }
}

module.exports = AddThreadUseCase;
