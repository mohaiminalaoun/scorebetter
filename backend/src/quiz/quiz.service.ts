import { Injectable, NotFoundException } from '@nestjs/common';
import {
  findQuestion,
  getFirstQuestion,
} from '../questions/questions.repository';
import type { PublicQuestionDto } from './dto/public-question.dto';
import type { SubmitAnswerDto } from './dto/submit-answer.dto';
import type { SubmitAnswerResultDto } from './dto/submit-answer-result.dto';

@Injectable()
export class QuizService {
  getFirstQuestion(): PublicQuestionDto {
    const { optionRanking, optionAnalysis, source, ...pub } =
      getFirstQuestion();
    return pub;
  }

  submit(dto: SubmitAnswerDto): SubmitAnswerResultDto {
    const question = findQuestion(dto.questionId);
    if (!question) {
      throw new NotFoundException(`Unknown question: ${dto.questionId}`);
    }

    const correctOptionId = question.optionRanking[0];

    return {
      correct: dto.selectedOptionId === correctOptionId,
      correctOptionId,
      selectedOptionId: dto.selectedOptionId,
      secondChoiceWasCorrect: dto.secondChoiceOptionId === correctOptionId,
    };
  }
}
