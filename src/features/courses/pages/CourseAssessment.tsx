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
} from "lucide-react";
import AchievementModal from "../../../components/AchievementModal";
import { fetchCourseQuizzes } from "../services/courseService";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type UserAnswer = {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
};


interface CourseAssessmentProps {
  allLessonsCompleted: boolean;
  onBack: () => void;
  courseSlug: string;
  variant?: "page" | "inline";
}

const CourseAssessment: React.FC<CourseAssessmentProps> = ({
  allLessonsCompleted,
  onBack,
  courseSlug,
  variant = "page"
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  useEffect(() => {
    const mapSupabaseQuiz = (quiz: any, idx: number): QuizQuestion => {
      const opts = (quiz.options || []).map((opt: any, index: number) => {
        if (typeof opt === "string") return opt;
        if (typeof opt === "object" && opt !== null) {
          return opt.text ?? opt.label ?? opt.id ?? `Option ${index + 1}`;
        }
        return `Option ${index + 1}`;
      });

      const numericCorrect =
        typeof quiz.correctAnswer === "number"
          ? quiz.correctAnswer
          : Number.isFinite(Number(quiz.correctAnswer))
            ? Number(quiz.correctAnswer)
            : -1;

      const correctIndexById = (quiz.options || []).findIndex((opt: any) => {
        const val =
          typeof opt === "string"
            ? opt
            : opt?.id ?? opt?.text ?? opt?.label;
        return val !== undefined && String(val) === String(quiz.correctAnswer);
      });

      const finalCorrectIndex =
        numericCorrect >= 0 && numericCorrect < opts.length
          ? numericCorrect
          : correctIndexById >= 0
            ? correctIndexById
            : 0;

      return {
        id: String(quiz.id ?? idx),
        question: quiz.question ?? `Question ${idx + 1}`,
        options: opts.length > 0 ? opts : ["Option 1", "Option 2"],
        correctAnswer: finalCorrectIndex,
        explanation: quiz.explanation,
      };
    };

    const loadQuizzesForSlug = async (slug: string) => {
      const quizzes = await fetchCourseQuizzes(slug);
      if (!quizzes || quizzes.length === 0) return null;

      const normalized = quizzes
        .slice()
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map(mapSupabaseQuiz);

      return normalized.length > 0 ? normalized : null;
    };

    const loadQuizzes = async () => {
      try {
        setLoading(true);

        const slugCandidates = Array.from(
          new Set([courseSlug, "plt-course-01"])
        );

        let normalized: QuizQuestion[] | null = null;
        for (const slug of slugCandidates) {
          normalized = await loadQuizzesForSlug(slug);
          if (normalized) break;
        }

        setQuestions(normalized ?? []);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
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
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  const isInline = variant === "inline";
  const containerClass = isInline ? "w-full" : "min-h-screen bg-gray-50 p-4";
  const wrapperClass = isInline ? "w-full" : "max-w-3xl mx-auto";
  const headerCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-sm"} p-6 mb-6`;
  const questionCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-sm"} p-8`;
  const summaryCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-lg"} p-8 text-center`;
  const summaryStatsClass = `bg-gray-50 rounded-xl p-6 mb-6 ${isInline ? "border border-gray-200" : ""}`;
  const lockedCardClass = `bg-white rounded-2xl ${isInline ? "border border-gray-200" : "shadow-lg"} p-8 max-w-md w-full text-center`;


  const handleAnswerSelect = (answerIndex: number) => {
    if (!showFeedback) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    };

    // Update or add the answer
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
      // Check if user passed (70% or higher) to show achievement modal
      const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
      if (finalScore >= 70) {
        setShowAchievementModal(true);
      } else {
        setShowSummary(true);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
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
      setSelectedAnswer(previousAnswer.selectedAnswer);
      setShowFeedback(true);
    }
  }, [currentQuestionIndex, userAnswers, currentQuestion?.id]);

  // Temporarily disabled - always allow access to see the quiz interface
  if (false && !allLessonsCompleted) {
    return (
      <div className={containerClass + " flex items-center justify-center"}>
        <div className={lockedCardClass}>
          <div className="mb-6">
            <Lock size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Course Assessment Locked
            </h2>
            <p className="text-gray-600">
              Complete all lesson videos to unlock the final assessment.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={20} />
              <span className="font-medium">Almost there!</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Watch all videos until you're within 1 minute of the end to unlock this assessment.
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={containerClass + " flex items-center justify-center"}>
        <div className={lockedCardClass}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No quiz available</h2>
          <p className="text-gray-600 mb-4">We couldn't load the quiz for this course.</p>
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Show summary screen
  if (showSummary) {
    const passed = scorePercentage >= 70;

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
                  <div className="text-2xl font-bold text-red-500">{totalQuestions - correctAnswers}</div>
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
                <a
                  href="https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/resources/25.01_DQ%20DTMB_WP_Perfect_Life_Transactions_The_Cornerstone_of_Economy_4.0.pdf"
                  download="25.01_DQ DTMB_WP_Perfect_Life_Transactions_The_Cornerstone_of_Economy_4.0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition flex items-center justify-center gap-2 text-center"
                >
                  <BookOpen size={16} />
                  View Resources
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
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
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${selectedAnswer === index
                  ? showFeedback
                    ? index === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-[#1839AD] bg-[#1839AD]/5"
                  : "border-gray-200 hover:border-gray-300"
                  } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                    ? showFeedback
                      ? index === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-500"
                        : "border-red-500 bg-red-500"
                      : "border-[#1839AD] bg-[#1839AD]"
                    : "border-gray-300"
                    }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                  {showFeedback && selectedAnswer === index && (
                    <div className="ml-auto">
                      {index === currentQuestion.correctAnswer ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${selectedAnswer === currentQuestion.correctAnswer
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
              }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span className={`font-medium ${selectedAnswer === currentQuestion.correctAnswer
                  ? "text-green-800"
                  : "text-red-800"
                  }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                </span>
              </div>
              {currentQuestion.explanation && (
                <p className={`text-sm ${selectedAnswer === currentQuestion.correctAnswer
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
                  disabled={selectedAnswer === null}
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
