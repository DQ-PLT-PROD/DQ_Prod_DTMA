import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Trophy,
  Lock,
  AlertCircle,
  CheckSquare,
  Square
} from "lucide-react";
import AchievementModal from "../../../components/AchievementModal";
import { useAuth } from "@/lib/auth";
import { fetchCourseQuizzes } from "../services/courseService";
import { recordCourseCompletion, recordQuizAttempt } from "../../portal/services/achievementService";

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswerIds: string[]; // Changed to array
  explanation?: string;
  distractorFeedback?: Record<string, string>;
};

type UserAnswer = {
  questionId: string;
  selectedAnswerIds: string[]; // Changed to array
  isCorrect: boolean;
};


interface CourseAssessmentProps {
  allLessonsCompleted: boolean;
  onBack: () => void;
  courseSlug: string;
  variant?: "page" | "inline";
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper to check array equality (order-independent)
function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}


const CourseAssessment: React.FC<CourseAssessmentProps> = ({
  allLessonsCompleted,
  onBack,
  courseSlug,
  variant = "page"
}) => {
  const { databaseUser } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  // Changed to Set or Array logic for multi-select
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  useEffect(() => {
    const mapSupabaseQuiz = (quiz: any, idx: number): QuizQuestion => {
      // 1. Normalize Options to { id, text }
      let rawOptions: QuizOption[] = [];
      const incomingOptions = quiz.options || [];

      if (incomingOptions.length > 0 && typeof incomingOptions[0] === 'string') {
        rawOptions = incomingOptions.map((opt: string, i: number) => ({
          id: String(i),
          text: opt
        }));
      } else {
        rawOptions = incomingOptions.map((opt: any, i: number) => ({
          id: opt.id ?? String(i),
          text: opt.text ?? opt.label ?? `Option ${i + 1}`
        }));
      }

      // 2. Identify Correct Answer IDs
      // quiz.correctAnswer is now string[] from the service
      let correctIds: string[] = [];
      const dbAnswers = Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer : [quiz.correctAnswer];

      // Map DB answers (which might be "a" or 1) to normalized Option IDs
      correctIds = dbAnswers.map((ans: any) => {
        // If it's a number/index
        if (typeof ans === 'number' || !isNaN(Number(ans)) && typeof ans !== 'string') {
          const idx = Number(ans);
          if (idx >= 0 && idx < rawOptions.length) return rawOptions[idx].id;
        }
        // If it's a string ID
        return String(ans);
      });

      // 3. Shuffle Options
      const shuffledOptions = shuffleArray(rawOptions);

      return {
        id: String(quiz.id ?? idx),
        question: quiz.question ?? `Question ${idx + 1}`,
        options: shuffledOptions,
        correctAnswerIds: correctIds,
        explanation: quiz.explanation,
        distractorFeedback: quiz.distractorFeedback,
      };
    };

    const loadQuizzesForSlug = async (slug: string) => {
      const quizzes = await fetchCourseQuizzes(slug);
      if (!quizzes || quizzes.length === 0) return null;

      const normalized = quizzes.map(mapSupabaseQuiz);
      return shuffleArray(normalized);
    };

    const loadQuizzes = async () => {
      try {
        setLoading(true);

        const slugCandidates = Array.from(
          new Set([courseSlug, "plt-course-01"])
        );

        let finalQuizzes: QuizQuestion[] | null = null;
        for (const slug of slugCandidates) {
          finalQuizzes = await loadQuizzesForSlug(slug);
          if (finalQuizzes) break;
        }

        setQuestions(finalQuizzes ?? []);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedAnswerIds([]);
        setShowFeedback(false);
        setShowSummary(false);
      } catch (err) {
        console.warn("Failed to load quizzes", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [courseSlug]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Render helpers
  const isInline = variant === "inline";
  const containerClass = isInline ? "w-full" : "min-h-screen bg-gray-50 p-4";
  const wrapperClass = isInline ? "w-full" : "max-w-3xl mx-auto";
  const headerCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-sm"} p-6 mb-6`;
  const questionCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-sm"} p-8`;
  const summaryCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-lg"} p-8 text-center`;
  const summaryStatsClass = `bg-gray-50 rounded-xl p-6 mb-6 ${isInline ? "border border-gray-200" : ""}`;
  const lockedCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-lg"} p-8 max-w-md w-full text-center`;


  const handleAnswerToggle = (optionId: string) => {
    if (showFeedback) return;

    // Check if it's already selected
    if (selectedAnswerIds.includes(optionId)) {
      // Deselect
      setSelectedAnswerIds(prev => prev.filter(id => id !== optionId));
    } else {
      // Select logic
      // If question only has 1 correct answer (single select behavior expectation even if technically array)
      // we could implement radio behavior, BUT user asked for multi-support capabilities specifically.
      // It's safer to always allow multi-select, OR restrict if correctAnswerIds.length === 1

      if (currentQuestion.correctAnswerIds.length === 1) {
        // Behaves like Radio
        setSelectedAnswerIds([optionId]);
      } else {
        // Behaves like Checkbox
        setSelectedAnswerIds(prev => [...prev, optionId]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    if (selectedAnswerIds.length === 0) return;

    const isCorrect = arraysEqual(selectedAnswerIds, currentQuestion.correctAnswerIds);

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswerIds,
      isCorrect
    };

    setUserAnswers(prev => {
      const existingIndex = prev.findIndex(answer => answer.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const incorrectCount = totalQuestions - correctAnswers;
      const passed = incorrectCount <= 5;

      if (databaseUser?.id) {
        recordQuizAttempt(databaseUser.id, courseSlug, finalScore, passed);
        if (passed && allLessonsCompleted) {
          recordCourseCompletion(databaseUser.id, courseSlug);
        }
      }

      if (passed) {
        setShowAchievementModal(true);
      } else {
        setShowSummary(true);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIds([]);
      setShowFeedback(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswerIds([]);
      setShowFeedback(false);
    }
  };

  const handleRetakeQuiz = () => {
    const reShuffled = shuffleArray(questions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    })));
    setQuestions(reShuffled);

    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswerIds([]);
    setShowFeedback(false);
    setShowSummary(false);
    setShowAchievementModal(false);
  };

  // Load previous answer when navigating
  useEffect(() => {
    if (!currentQuestion) return;
    const previousAnswer = userAnswers.find(
      answer => answer.questionId === currentQuestion.id
    );
    if (previousAnswer) {
      setSelectedAnswerIds(previousAnswer.selectedAnswerIds);
      setShowFeedback(true);
    }
  }, [currentQuestionIndex, userAnswers, currentQuestion?.id]);

  if (!currentQuestion) {
    return (
      <div className={containerClass + " flex items-center justify-center"}>
        <div className={lockedCardClass}>
          <BookOpen size={48} className="text-[#1839AD] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Quiz...</h2>
        </div>
      </div>
    );
  }

  // Show summary screen
  if (showSummary) {
    const incorrectCount = totalQuestions - correctAnswers;
    const passed = incorrectCount <= 5;

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
                  ? "You've successfully completed the course assessment."
                  : "You're on the right track. Review the materials and try again."
                }
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
                  <div className={`text-2xl font-bold ${passed ? 'text-green-500' : 'text-orange-500'}`}>
                    {scorePercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Course
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
                <button onClick={onBack} className="flex-1 px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2">
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

  // Check if current selection is correct (for dynamic button state if needed, though we use handleSubmit)
  const isCurrentlyCorrect = arraysEqual(selectedAnswerIds, currentQuestion.correctAnswerIds);

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        {/* Header */}
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

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1839AD] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={questionCardClass}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {currentQuestion.question}
          </h2>

          <div className="mb-6 text-sm text-gray-500 font-medium">
            {currentQuestion.correctAnswerIds.length > 1
              ? "Select all that apply"
              : "Select one answer"
            }
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswerIds.includes(option.id);
              const isCorrectAnswer = currentQuestion.correctAnswerIds.includes(option.id);

              const showGreen = showFeedback && isCorrectAnswer && isCurrentlyCorrect; // Only reveal if user passed the question
              const showRed = showFeedback && isSelected && !isCorrectAnswer; // Always warn mistakes

              // Multi-select style Checkbox or Radio?
              // Use Square/CheckSquare logic for generic feel, or circle for single
              const isMulti = currentQuestion.correctAnswerIds.length > 1;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerToggle(option.id)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${isSelected
                    ? showFeedback
                      ? showGreen
                        ? "border-green-500 bg-green-50"
                        : showRed ? "border-red-500 bg-red-50" : "border-[#1839AD] bg-[#1839AD]/5"
                      : "border-[#1839AD] bg-[#1839AD]/5"
                    : "border-gray-200 hover:border-gray-300"
                    } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center ${isSelected
                      ? showFeedback
                        ? showGreen
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-[#1839AD]"
                      : "text-gray-300"
                      }`}>
                      {/* Checkbox Icon Logic */}
                      {isSelected
                        ? (isMulti ? <CheckSquare size={24} className="fill-current" /> : <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-current" /></div>)
                        : (isMulti ? <Square size={24} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />)
                      }
                    </div>

                    <span className="text-gray-800">{option.text}</span>

                    {showFeedback && isSelected && (
                      <div className="ml-auto">
                        {isCorrectAnswer ? (
                          isCurrentlyCorrect ? <CheckCircle2 size={20} className="text-green-500" /> : null
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${isCurrentlyCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
              }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCurrentlyCorrect ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span className={`font-medium ${isCurrentlyCorrect
                  ? "text-green-800"
                  : "text-red-800"
                  }`}>
                  {isCurrentlyCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>

              {/* Distractor Feedback - Iterate through all wrong selections */}
              {!isCurrentlyCorrect && selectedAnswerIds.map(badId => {
                if (currentQuestion.correctAnswerIds.includes(badId)) return null; // Only show for WRONG picks
                const hint = currentQuestion.distractorFeedback?.[badId];
                if (!hint) return null;
                return (
                  <div key={badId} className="mb-2 p-2 bg-white/50 rounded border border-red-100 text-red-800 font-medium text-sm">
                    💡 {hint}
                  </div>
                );
              })}

              {currentQuestion.explanation && (
                <p className={`text-sm ${isCurrentlyCorrect
                  ? "text-green-700"
                  : "text-red-700"
                  }`}>
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
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
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswerIds.length === 0}
                  className="px-6 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
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

      {/* Achievement Modal */}
      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setShowSummary(true);
        }}
        score={scorePercentage}
        courseName="Perfecting Life Transactions: A Digital Builder's Blueprint"
        userName="Digital Builder"
      />
    </div>
  );
};

export default CourseAssessment;
