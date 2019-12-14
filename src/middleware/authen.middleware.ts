import * as jwt from 'jsonwebtoken';
import express from 'express';

export class AuthenMiddleware {
  static checkAuth = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.method === 'OPTIONS') res.send();
    else {
      const authHeader = req.get('Authorization');
      if (!authHeader) {
        res.status(401).json('Not authenticated.');
      }
      let decodedToken;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          decodedToken = jwt.verify(token, 'secret_this_should_be_longer');
        } catch (err) {
          res.status(500).json(err);
        }
        if (!decodedToken) {
          res.status(401).json('Not authenticated.');
        }
      }
      next();
    }
  };
}
