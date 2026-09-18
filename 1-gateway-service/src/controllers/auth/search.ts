import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Search {
  public async gigById(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.getGig(req.params.gigId);
    res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
  }

  public async gigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    console.log('Query before', req.query);
    let query = '';
    const objList = Object.entries(req.query);
    const lastItemIndex = objList.length - 1;
    objList.forEach(([key, value], index) => {
      query += `${key}=${value}${index !== lastItemIndex ? '&' : ''}`;
    });
    console.log('Query after', query);
    const response: AxiosResponse = await authService.getGigs(`${query}`, from, size, type);
    res.status(StatusCodes.OK).json({ message: response.data.message, total: response.data.total, gigs: response.data.gigs });
  }
}

// /auth/search/gig/0/10/forward?query=programming&delivery_time=3&minPrice=5&maxPrice=20
