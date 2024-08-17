import { Controller, Get, Query, Req, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getReq(
    @Req() req: Request
    
  ){
    return await this.appService.getReq(req)
  }

  @Post()
  async postReq(
    @Req() req: Request,
    @Query("amount") amount: number
  ){
    return await this.appService.postReq(amount, req)
  }

  
}
