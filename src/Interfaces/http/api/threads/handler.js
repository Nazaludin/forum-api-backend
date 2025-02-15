const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');


class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const addedThread = await addThreadUseCase.execute(request.payload, request.auth.credentials.id);
  
      const response = h.response({
        status: 'success',
        data: { addedThread },
      });
      response.code(201);
      return response;
  }
  async postCommentHandler(request, h) {
      const { threadId } = request.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute(request.payload, threadId, request.auth.credentials.id);
  
      const response = h.response({
        status: 'success',
        data: { addedComment },
      });
      response.code(201);
      return response;
  }
  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      
      await deleteCommentUseCase.execute({ 
        threadId, 
        commentId, 
        userId: request.auth.credentials.id 
      });
      
    return h.response({
        status: 'success',
        message: 'Komentar berhasil dihapus'
    }).code(200);
}

  async getThreadByIdHandler(request, h) {
    const { id } = request.params;
    const getThreadByIdUseCase = this._container.getInstance(GetThreadByIdUseCase.name);
    const thread = await getThreadByIdUseCase.execute(id);

    return {
      status: 'success',
      data: { thread },
    };
  }
}

module.exports = ThreadsHandler;
