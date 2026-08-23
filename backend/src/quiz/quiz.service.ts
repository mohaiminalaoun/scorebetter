import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Question } from '../questions/question.model';
import {
  findQuestion,
  getAllQuestions as getAllQuestionsFromRepo,
  getFirstQuestion,
} from '../questions/questions.repository';
import {
  buildDiagnosticExplanation,
  classifyMarks,
  getAvailableComparisons,
  getComparisonSide,
  getOptionAnalysisFor,
} from './diagnostic-classifier';
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

  getAllQuestions(): PublicQuestionDto[] {
    return getAllQuestionsFromRepo().map((question) => {
      const { optionRanking, optionAnalysis, source, ...pub } = question;
      return pub;
    });
  }

  submit(dto: SubmitAnswerDto): SubmitAnswerResultDto {
    const question = findQuestion(dto.questionId);
    if (!question) {
      throw new NotFoundException(`Unknown question: ${dto.questionId}`);
    }

    this.validateMarks(dto, question);

    const correctOptionId = question.optionRanking[0];
    const trapOptionId = question.optionRanking[1];
    const label = classifyMarks(dto, question.optionRanking);
    const trapAnalysis = getOptionAnalysisFor(question, trapOptionId);

    return {
      correct: dto.selectedOptionId === correctOptionId,
      correctOptionId,
      trapOptionId,
      selectedOptionId: dto.selectedOptionId,
      secondChoiceWasCorrect: dto.secondChoiceOptionId === correctOptionId,
      label,
      explanation: buildDiagnosticExplanation(label, question, dto),
      trapExplanation: {
        optionId: trapOptionId,
        whyTempting: trapAnalysis.likelyReasoning,
        whyWrong: trapAnalysis.rationale,
      },
      optionAnalyses: question.options.map((option) =>
        getComparisonSide(question, dto, option.id),
      ),
      availableComparisons: getAvailableComparisons(label, question, dto),
    };
  }

  private validateMarks(dto: SubmitAnswerDto, question: Question): void {
    if (typeof dto.selectedOptionId !== 'string') {
      throw new BadRequestException('selectedOptionId must be a string');
    }

    if (
      dto.secondChoiceOptionId != null &&
      typeof dto.secondChoiceOptionId !== 'string'
    ) {
      throw new BadRequestException(
        'secondChoiceOptionId must be a string or null',
      );
    }

    if (
      dto.eliminatedOptionIds !== undefined &&
      (!Array.isArray(dto.eliminatedOptionIds) ||
        dto.eliminatedOptionIds.some(
          (optionId) => typeof optionId !== 'string',
        ))
    ) {
      throw new BadRequestException(
        'eliminatedOptionIds must be an array of strings',
      );
    }

    const validOptionIds = new Set(question.options.map((option) => option.id));
    const eliminatedOptionIds = dto.eliminatedOptionIds ?? [];

    const suppliedOptionIds = [
      dto.selectedOptionId,
      ...(dto.secondChoiceOptionId != null
        ? [dto.secondChoiceOptionId]
        : []),
      ...eliminatedOptionIds,
    ];

    const invalidOptionId = suppliedOptionIds.find(
      (optionId) => !validOptionIds.has(optionId),
    );
    if (invalidOptionId) {
      throw new BadRequestException(
        `Option ${invalidOptionId} does not belong to question ${question.id}`,
      );
    }

    if (new Set(eliminatedOptionIds).size !== eliminatedOptionIds.length) {
      throw new BadRequestException('eliminatedOptionIds contains duplicates');
    }

    if (dto.selectedOptionId === dto.secondChoiceOptionId) {
      throw new BadRequestException(
        'Answer and second choice must be different options',
      );
    }

    if (eliminatedOptionIds.includes(dto.selectedOptionId)) {
      throw new BadRequestException('The selected answer cannot be eliminated');
    }

    if (
      dto.secondChoiceOptionId != null &&
      eliminatedOptionIds.includes(dto.secondChoiceOptionId)
    ) {
      throw new BadRequestException('The second choice cannot be eliminated');
    }
  }
}
