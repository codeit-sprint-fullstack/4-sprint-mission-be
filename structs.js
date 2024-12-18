import * as s from "superstruct";

export const CreateProduct = s.object({
  name: s.size(s.string(), 1, 10),
  description: s.size(s.string(), 10, 100),
  price: s.min(s.number(), 0),
  tags: s.array(s.size(s.string(), 1, 5)),
  favoriteCount: s.optional(s.min(s.number(), 0)),
  images: s.optional(s.array(s.string())),
});

export const PatchProdcut = s.partial(CreateProduct);

export const CreateArticle = s.object({
  title: s.string(),
  content: s.string(),
});

export const PatchArticle = s.partial(CreateArticle);

export const CreateComment = s.object({
  content: s.string(),
});

export const PatchComment = s.partial(CreateComment);
