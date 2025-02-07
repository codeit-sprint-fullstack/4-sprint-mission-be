const prisma = require("../../db/prisma/client");

async function updateCommnet(req, res, next) {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;
    const commentForfindUser = await prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    if (commentForfindUser.writerId !== userId)
      throw new Error("401/Unathorized");
    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    res.status(200).send(comment);
  } catch (e) {
    next(e);
  }
}

async function deleteCommnet(req, res, next) {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;
    const commentForfindUser = prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    if (commentForfindUser.writerId !== userId)
      throw new Error("401/Unathorized");
    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}

const commentService = {
  updateCommnet,
  deleteCommnet,
};

module.exports = commentService;
