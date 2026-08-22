import { Body, Controller, Get, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import type { PublicQuestionDto } from './dto/public-question.dto';
import type { SubmitAnswerDto } from './dto/submit-answer.dto';
import type { SubmitAnswerResultDto } from './dto/submit-answer-result.dto';

@Controller('api')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('question')
  getQuestion(): PublicQuestionDto {
    return this.quizService.getFirstQuestion();
  }

  @Get('questions')
  getQuestions(): PublicQuestionDto[] {
    return this.quizService.getAllQuestions();
  }

  @Post('submit')
  submit(@Body() body: SubmitAnswerDto): SubmitAnswerResultDto {
    return this.quizService.submit(body);
  }
}
