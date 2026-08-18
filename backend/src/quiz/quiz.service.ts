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
    const { correctOptionId, ...pub } = getFirstQuestion();
    return pub;
  }

  submit(dto: SubmitAnswerDto): SubmitAnswerResultDto {
    const question = findQuestion(dto.questionId);
    if (!question) {
      throw new NotFoundException(`Unknown question: ${dto.questionId}`);
    }

    return {
      correct: dto.selectedOptionId === question.correctOptionId,
      correctOptionId: question.correctOptionId,
      selectedOptionId: dto.selectedOptionId,
      secondChoiceWasCorrect:
        dto.secondChoiceOptionId === question.correctOptionId,
    };
  }
}
