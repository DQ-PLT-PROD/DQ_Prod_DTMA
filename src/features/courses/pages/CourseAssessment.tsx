import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import AchievementModal from "../../../components/AchievementModal";
import { useAuth } from "@/lib/auth";
import {
  evaluateLearnerQuizAnswer,
  fetchLearnerQuizSession,
  LearnerQuizSession,
} from "../services/courseService";
import {
  recordCourseCompletion,
  recordQuizAttempt,
} from "../../portal/services/achievementService";

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  quizId: string;
  question: string;
  type: "single_select" | "multi_select" | "true_false" | "text";
  options: QuizOption[];
};

type UserAnswer = {
  questionId: string;
  selectedAnswerIds: string[];
  isCorrect: boolean;
  explanation?: string;
  hideAnswers: boolean;
};

interface CourseAssessmentProps {
  allLessonsCompleted: boolean;
  onBack: () => void;
  courseSlug: string;
  variant?: "page" | "inline";
}

function shuffleArray<T>(array: T[]): T[] {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function prepareQuestionsForAttempt(session: LearnerQuizSession | null): QuizQuestion[] {
  if (!session) return [];

  const questions = session.questions.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));

  return session.shuffleQuestions ? shuffleArray(questions) : questions;
}

const CourseAssessment: React.FC<CourseAssessmentProps> = ({
  allLessonsCompleted,
  onBack,
  courseSlug,
  variant = "page",
}) => {
  const { databaseUser } = useAuth();
  const [quizSession, setQuizSession] = useState<LearnerQuizSession | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<{ definition: any; shareToken?: string } | null>(null);

  useEffect(() => {
    const loadQuizSession = async () => {
      try {
        setLoading(true);

        const session = await fetchLearnerQuizSession(courseSlug);

        setQuizSession(session);
        setQuestions(prepareQuestionsForAttempt(session));
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedAnswerIds([]);
        setShowFeedback(false);
        setShowSummary(false);
        setShowAchievementModal(false);
      } catch (error) {
        console.warn("Failed to load learner quiz session", error);
        setQuizSession(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    void loadQuizSession();
  }, [courseSlug]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion
    ? userAnswers.find((answer) => answer.questionId === currentQuestion.id)
    : undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctAnswers = userAnswers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = questions.length;
  const passingScore = quizSession?.passingScore ?? 80;
  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = totalQuestions > 0 ? scorePercentage >= passingScore : false;

  const isInline = variant === "inline";
  const containerClass = isInline ? "w-full" : "min-h-screen bg-gray-50 p-4";
  const wrapperClass = isInline ? "w-full" : "max-w-3xl mx-auto";
  const headerCardClass = `bg-white rounded-2xl ${
    isInline ? "border border-gray-200" : "shadow-sm"
  } p-6 mb-6`;
  const questionCardClass = `bg-white rounded-2xl ${
    isInline ? "border border-gray-200" : "shadow-sm"
  } p-8`;
  const summaryCardClass = `bg-white rounded-2xl ${
    isInline ? "border border-gray-200" : "shadow-lg"
  } p-8 text-center`;
  const summaryStatsClass = `bg-gray-50 rounded-xl p-6 mb-6 ${
    isInline ? "border border-gray-200" : ""
  }`;
  const emptyCardClass = `bg-white rounded-2xl ${
    isInline ? "border border-gray-200" : "shadow-lg"
  } p-8 max-w-md w-full text-center`;

  const handleAnswerToggle = (optionId: string) => {
    if (!currentQuestion || showFeedback) {
      return;
    }

    const isMultiSelect = currentQuestion.type === "multi_select";
    setSelectedAnswerIds((previous) => {
      if (previous.includes(optionId)) {
        return previous.filter((id) => id !== optionId);
      }

      return isMultiSelect ? [...previous, optionId] : [optionId];
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || selectedAnswerIds.length === 0) {
      return;
    }

    try {
      setSubmittingAnswer(true);
      const evaluation = await evaluateLearnerQuizAnswer(
        currentQuestion.id,
        selectedAnswerIds
      );

      if (!evaluation) {
        return;
      }

      const nextAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswerIds,
        isCorrect: evaluation.isCorrect,
        explanation: evaluation.explanation,
        hideAnswers: evaluation.hideAnswers,
      };

      setUserAnswers((previous) => {
        const existingIndex = previous.findIndex(
          (answer) => answer.questionId === currentQuestion.id
        );

        if (existingIndex >= 0) {
          const updated = [...previous];
          updated[existingIndex] = nextAnswer;
          return updated;
        }

        return [...previous, nextAnswer];
      });

      setShowFeedback(true);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((previous) => previous + 1);
      setSelectedAnswerIds([]);
      setShowFeedback(false);
      return;
    }

    if (databaseUser?.id) {
      const quizBadge = await recordQuizAttempt(
        databaseUser.id,
        courseSlug,
        scorePercentage,
        passed
      );

      if (quizBadge) {
        setEarnedBadge({
          definition: quizBadge.badge,
          shareToken: quizBadge.shareToken,
        });
      }

      if (passed && allLessonsCompleted) {
        const courseBadge = await recordCourseCompletion(databaseUser.id, courseSlug);
        if (courseBadge) {
          setEarnedBadge({
            definition: courseBadge.badge,
            shareToken: courseBadge.shareToken,
          });
        }
      }
    }

    if (passed) {
      setShowAchievementModal(true);
    } else {
      setShowSummary(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex === 0) {
      return;
    }

    setCurrentQuestionIndex((previous) => previous - 1);
    setSelectedAnswerIds([]);
    setShowFeedback(false);
  };

  const handleRetakeQuiz = () => {
    setQuestions(prepareQuestionsForAttempt(quizSession));
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswerIds([]);
    setShowFeedback(false);
    setShowSummary(false);
    setShowAchievementModal(false);
  };

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    if (!currentAnswer) {
      setSelectedAnswerIds([]);
      setShowFeedback(false);
      return;
    }

    setSelectedAnswerIds(currentAnswer.selectedAnswerIds);
    setShowFeedback(true);
  }, [currentAnswer, currentQuestion]);

  const headerCopy = useMemo(() => {
    if (!quizSession) {
      return "Module Assessment";
    }

    return quizSession.title || "Module Assessment";
  }, [quizSession]);

  if (loading) {
    return (
      <div className={`${containerClass} flex items-center justify-center`}>
        <div className={emptyCardClass}>
          <BookOpen size={48} className="text-[#1839AD] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Quiz...</h2>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`${containerClass} flex items-center justify-center`}>
        <div className={emptyCardClass}>
          <BookOpen size={48} className="text-[#1839AD] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No published quiz available yet
          </h2>
          <p className="text-sm text-gray-500">
            Publish a quiz for this module to make the assessment available to learners.
          </p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const incorrectCount = totalQuestions - correctAnswers;

    return (
      <div className={containerClass}>
        <div className={isInline ? wrapperClass : "max-w-2xl mx-auto"}>
          <div className={summaryCardClass}>
            <div className="mb-6">
              {passed ? (
                <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
              ) : (
                <RotateCcw size={64} className="text-orange-500 mx-auto mb-4" />
              )}

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {passed ? "Congratulations!" : "Keep Learning!"}
              </h2>

              <p className="text-gray-600 mb-6">
                {passed
                  ? "You've successfully completed the module assessment."
                  : "Review the module and try again when you're ready."}
              </p>
            </div>

            <div className={summaryStatsClass}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#1839AD]">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{incorrectCount}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      passed ? "text-green-500" : "text-orange-500"
                    }`}
                  >
                    {scorePercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Passing score: {passingScore}%
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Module
              </button>

              {!passed && (
                <button
                  onClick={handleRetakeQuiz}
                  className="flex-1 px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Try Again
                </button>
              )}

              {passed && (
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} />
                  Complete & Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMultiSelect = currentQuestion.type === "multi_select";
  const isCurrentlyCorrect = currentAnswer?.isCorrect ?? false;

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        <div className={headerCardClass}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={20} />
              Back to Course
            </button>

            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-base font-semibold text-gray-900">{headerCopy}</p>
            <p className="text-sm text-gray-500">Passing score: {passingScore}%</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1839AD] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className={questionCardClass}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {currentQuestion.question}
          </h2>

          <div className="mb-6 text-sm text-gray-500 font-medium">
            {isMultiSelect ? "Select all that apply" : "Select one answer"}
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswerIds.includes(option.id);
              const showGreen = showFeedback && isSelected && isCurrentlyCorrect;
              const showRed = showFeedback && isSelected && !isCurrentlyCorrect;
              const inputType = isMultiSelect ? "checkbox" : "radio";
              const accentClass = showFeedback
                ? showGreen
                  ? "accent-green-600"
                  : showRed
                    ? "accent-red-600"
                    : "accent-[#1839AD]"
                : "accent-[#1839AD]";

              return (
                <label
                  key={option.id}
                  className={`w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                    isSelected
                      ? showFeedback
                        ? showGreen
                          ? "border-green-500 bg-green-50"
                          : showRed
                            ? "border-red-500 bg-red-50"
                            : "border-[#1839AD] bg-[#1839AD]/5"
                        : "border-[#1839AD] bg-[#1839AD]/5"
                      : "border-gray-200 hover:border-gray-300"
                  } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
                >
                  <input
                    type={inputType}
                    name={currentQuestion.id}
                    checked={isSelected}
                    onChange={() => handleAnswerToggle(option.id)}
                    disabled={showFeedback}
                    className={`mt-0.5 h-5 w-5 shrink-0 cursor-pointer ${accentClass}`}
                  />

                  <span className="flex-1 text-gray-800">{option.text}</span>

                  {showFeedback && isSelected && (
                    <div className="ml-auto">
                      {isCurrentlyCorrect ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {showFeedback && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                isCurrentlyCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCurrentlyCorrect ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    isCurrentlyCorrect ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isCurrentlyCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>

              {currentAnswer?.explanation ? (
                <p
                  className={`text-sm ${
                    isCurrentlyCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {currentAnswer.explanation}
                </p>
              ) : currentAnswer?.hideAnswers ? (
                <p className="text-sm text-gray-600">
                  Detailed answer review is hidden for this quiz.
                </p>
              ) : null}
            </div>
          )}

          <div className="flex justify-between">
            {currentQuestionIndex > 0 ? (
              <button
                onClick={handlePreviousQuestion}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              {!showFeedback ? (
                <button
                  onClick={() => void handleSubmitAnswer()}
                  disabled={selectedAnswerIds.length === 0 || submittingAnswer}
                  className="px-6 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submittingAnswer ? "Checking..." : "Submit Answer"}
                </button>
              ) : (
                <button
                  onClick={() => void handleNextQuestion()}
                  className="px-6 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center gap-2"
                >
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setShowSummary(true);
        }}
        score={scorePercentage}
        courseName={quizSession?.title || courseSlug}
        userName={databaseUser?.name || "Digital Builder"}
        badge={earnedBadge || undefined}
      />
    </div>
  );
};

export default CourseAssessment;
