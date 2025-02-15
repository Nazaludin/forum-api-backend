const routes = (handler) => ([
    {
      method: 'POST',
      path: '/threads',
      handler: handler.postThreadHandler,
      options: {
        auth: 'forumapp_jwt',
      },
    },
    // {
    //   method: 'GET',
    //   path: '/threads',
    //   handler: handler.getThreadsHandler,
    // },
    {
      method: 'GET',
      path: '/threads/{id}',
      handler: handler.getThreadByIdHandler,
    },
    {
      method: 'POST',
      path: '/threads/{threadId}/comments',
      handler: handler.postCommentHandler,
      options: {
        auth: 'forumapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/threads/{threadId}/comments/{commentId}',
      handler: handler.deleteCommentHandler,
      options: {
        auth: 'forumapp_jwt',
      },
    },
  ]);
  
  module.exports = routes;
  