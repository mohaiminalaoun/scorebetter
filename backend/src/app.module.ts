import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuizController } from './quiz/quiz.controller';
import { QuizService } from './quiz/quiz.service';

@Module({
  imports: [AuthModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class AppModule { }
