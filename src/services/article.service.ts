/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response } from 'express';
import { MongooseDocument } from 'mongoose';
import { Article } from '../models/article.model';
import _ from 'lodash';
import AWS from 'aws-sdk';
import { KeyObject } from 'crypto';
import fs from 'fs';
import neatCsv from 'neat-csv';
import fetchCommentPage from 'youtube-comment-api';
import searchYoutube from 'youtube-api-v3-search';

const parseDate = (created_at) => {
  return (
    created_at.slice(0, 4) +
    '-' +
    created_at.slice(4, 6) +
    '-' +
    created_at.slice(6, 8)
  );
};

export class ArticleService {
  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send('Welcome to Compsight');
  }

  public getAllArticle(req: Request, res: Response) {
    const { createdAt } = req.query;
    let query = {};
    if (createdAt) query = { created_at: createdAt };
    Article.find(query, (error: Error, article: MongooseDocument) => {
      if (error) {
        res.send(error);
      }
      const keywordList = [];
      const peopleList = [];
      const dateList = [];
      const result = JSON.parse(JSON.stringify(article));
      result.map((x) => {
        x.keywords.map((y) => keywordList.push(y));
        x.people.map((y) => peopleList.push(y));
        dateList.push(x.created_at);
      });
      const uniqueList = _.uniq(keywordList);
      const uniquePeople = _.uniq(peopleList);
      const uniqueDateList = _.uniq(dateList);
      const words = uniqueList
        .map((x) => ({
          text: x,
          value: keywordList.filter((y) => y === x).length,
        }))
        .sort((a, b) => (a.value > b.value ? -1 : a.value < b.value ? 1 : 0));

      const dates = uniqueDateList.map((x) => {
        return {
          name: x,
          count: dateList.filter((y) => y === x).length,
        };
      });

      res.json({
        words,
        dates: dates.sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
        ),
        uniquePeople,
        uniqueKeyword: uniqueList,
        articles: result,
      });
    });
  }

  public addNewArticle(req: Request, res: Response) {
    // AWS.config.update({
    //   region: process.env.region,
    //   accessKeyId: process.env.accessKeyId,
    //   secretAccessKey: process.env.secretAccessKey
    //  });
    // const comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});

    fs.readFile('newsResult.csv', async (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const list = await neatCsv(data);
      list.slice(0, 200).forEach((element, index, array) => {
        const obj = {
          comp_id: 0,
          news_id: element.id,
          title: element.title,
          author: element.author,
          created_at: parseDate(element.created_at),
          publisher: element.publisher,
          category1: element.category1,
          category2: element.category2,
          category3: element.category3,
          people: element.people.split(','),
          location: element.location,
          organization: element.organization.split(','),
          keywords: element.keywords.split(','),
          prop_extraction: element.prop_extraction.split(','),
          content: element.content,
          url: element.url,
        };

        // let params = {
        //   LanguageCode: "ko",
        //   TextList: obj.content_slice.map(x => x.text)
        // };

        //  comprehend.batchDetectSentiment(params, function(err, data) {
        //   if (err) console.log(err, err.stack); // an error occurred
        //   else {
        //     for(let i = 0; i<data.ResultList.length; i+=1){
        //       obj.content_slice[i].sentiment = data.ResultList[i]
        //     }
        //   }
        // });

        const newArticle = new Article(obj);
        newArticle.save((error: Error, article: MongooseDocument) => {
          if (error) {
            console.log(error);
          }
        });
      });
      res.json('success');
      // Article.save((error: Error, pokemon: MongooseDocument) => {
      //   if (error) {
      //     res.send(error);
      //   }
      //   res.json(pokemon);
      // });
    });
  }

  public async getYoutubeComments(req: Request, res: Response) {
    const { query } = req.query;
    const options = {
      q: query,
      part: 'snippet',
      type: 'video',
    };
    try {
      const result = await searchYoutube(
        'AIzaSyCeeQOjalALdFWrz1gHJQD9lF3YFHvhH2o',
        options,
      );
      if (result.items.length !== 0) {
        const videoId = result.items[0].id.videoId;
        fetchCommentPage(videoId).then((commentPage) => {
          res.json({
            // videoList: result,
            video: result,
            comments: commentPage.comments,
          });
        });
      } else {
        res.json({
          video: {
            items: [],
          },
          comments: [],
        });
      }
    } catch (error) {
      res.status(406).send('error');
    }
  }
}
