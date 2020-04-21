import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    comp_id: Number,
    news_id: String,
    title: String,
    author: String,
    created_at: String,
    publisher: String,
    category1: String,
    category2: String,
    category3: String,
    people: Array,
    location: String,
    organization: Array,
    keywords: Array,
    prop_extraction: Array,
    content: String,
    url: String,
  },
  { collection: 'articles' },
);

export const Article = mongoose.model('article', ArticleSchema, 'articles');
