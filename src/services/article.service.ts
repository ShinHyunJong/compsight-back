import { Request, Response } from "express";
import { MongooseDocument } from 'mongoose';
import { Article } from "../models/article.model";
const fs = require('fs')
const neatCsv = require('neat-csv');

const trimArray = (array) => {
  let trimmed = [];
  array.forEach(element => {
    trimmed.push(element.trim())
  });
  return trimmed;
}

export class ArticleService {
  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("Welcome to Compsight");
  }

  public getAllArticle(req: Request, res: Response) {
    
    Article.find({}, (error: Error, article: MongooseDocument) => {
      console.log(article);
      if (error) {
        res.send(error);
      }
      res.json(article);
    });
  }

  public addNewArticle(req: Request, res:Response) {    
    fs.readFile('newsResult.csv', async (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      const list = await neatCsv(data);
      const test = list.slice(0,5);
      test.forEach((element, index, array) => {
        const obj = {
          news_id: element.id,
          title: element.title,
          author: element.author,
          // created_at: new Date(element.created_at).toISOString(),
          publisher: element.publisher,
          category1: element.category1,
          category2: element.category2,
          category3: element.category3,
          people: element.people.split(','),
          location: element.location,
          organization: element.organization.split(','),
          keyword: element.keywords.split(','),
          prop_extraction: element.prop_extraction.split(','),
          content: trimArray(element.content.replace(/\n/g, '').match( /[^\.!\?]+[\.!\?]+/g )),
          url: element.url,          
        }
        console.log(obj);
        // const newArticle = new Article(obj);
        // newArticle.save((error: Error, article: MongooseDocument) => {
        //   if(error) {
        //     console.log(error);
        //   }
        //   console.log(article)
        // });
      });
      res.json("success");
      // Article.save((error: Error, pokemon: MongooseDocument) => {
      //   if (error) {
      //     res.send(error);
      //   }
      //   res.json(pokemon);
      // }); 
    })
  }

}
