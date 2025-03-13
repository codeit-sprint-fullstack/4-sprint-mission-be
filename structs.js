import isUuid from 'is-uuid';
import * as s from 'superstruct';

const Uuid = s.define('Uuid', (value) => isUuid.v4(value));

export const CreateProduct = s.object({
  writer: s.size(s.string(), 1, 30),
  name: s.size(s.string(), 1, 20),
  description: s.size(s.string(), 10, 100),
  price: s.min(s.integer(), 1),
  tags: s.size(s.array(s.size(s.string(), 1, 5)), 1, Infinity), // 배열의 길이가 1이상 infinity
  imgUrls: s.size(s.array(s.size(s.string(), 1, 100)), 1, 3), // 배열의 길이가 1이상 3개까지
});

export const PatchProduct = s.partial(CreateProduct);

export const CreateArticle = s.object({
  title: s.size(s.string(), 1, 30),
  writer: s.size(s.string(), 1, 30),
  content: s.size(s.string(), 10, 500),
});

export const PatchArticle = s.partial(CreateArticle);

export const CreateComment = s.object({
  writer: s.size(s.string(), 1, 30),
  content: s.size(s.string(), 1, 200),
});

export const PatchComment = s.partial(CreateComment);
