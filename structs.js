import * as s from 'superstruct';
import isUuid from 'is-uuid';

const Uuid = s.define('Uuid', (value) => isUuid.v4(value));

export const CreateProduct = s.object({
  name: s.size(s.string(), 1, 20),
  description: s.size(s.string(), 10, 100),
  price: s.min(s.integer(), 1),
  tags: s.size(s.array(s.size(s.string(), 1, 5)), 1, Infinity), // 배열의 길이가 1이상 infinity
});

export const PatchProduct = s.partial(CreateProduct);

export const CreateArticle = s.object({
  title: s.size(s.string(), 1, 30),
  content: s.size(s.string(), 10, 500),
});

export const PatchArticle = s.partial(CreateArticle);

export const CreateComment = s.object({
  content: s.size(s.string(), 1, 200),
});

export const PatchComment = s.partial(CreateComment);
