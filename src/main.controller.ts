import { Application } from 'express';
import { ArticleService } from './services/article.service';

export class Controller {
  private articleService: ArticleService;

  constructor(private app: Application) {
    this.articleService = new ArticleService();
    this.routes();
  }

  public routes() {
    this.app.route('/').get(this.articleService.welcomeMessage);
    this.app.route("/articles").get(this.articleService.getAllArticle);
    this.app.route("/article").post(this.articleService.addNewArticle);
  }
}