import React, { useState, useMemo, useCallback } from 'react';
import { Quiz, QuizQuestion } from '@/types/dtma-lms';
import {
    CheckCircleIcon,
    XCircleIcon,
    RotateCcwIcon,
    ClockIcon,
    ChevronRightIcon,
    AlertTriangleIcon,
    TrophyIcon,
    EyeIcon,
} from 'lucide-react';

interface QuizPreviewProps {
    quiz: Partial<Quiz>;
}

type PreviewState = 'intro' | 'taking' | 'results';

export function QuizPreview({ quiz }: QuizPreviewProps) {
    const questions = quiz.questions || [];
    const [state, setState] = useState<PreviewState>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [startTime, setStartTime] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    // Potentially shuffle questions for preview
    const orderedQuestions = useMemo(() => {
        if (quiz.shuffleQuestions) {
            return [...questions].sort(() => Math.random() - 0.5);
        }
        return questions;
    }, [questions, quiz.shuffleQuestions, state]); // re-shuffle on restart

    const currentQuestion = orderedQuestions[currentIndex];

    const handleStart = useCallback(() => {
        setAnswers({});
        setCurrentIndex(0);
        setStartTime(Date.now());
        setState('taking');
    }, []);

    const handleSelectAnswer = useCallback((questionId: string, value: string, isMulti: boolean) => {
        setAnswers(prev => {
            if (isMulti) {
                const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
                const updated = current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value];
                return { ...prev, [questionId]: updated };
            }
            return { ...prev, [questionId]: value };
        });
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < orderedQuestions.length - 1) {
            setCurrentIndex(i => i + 1);
        }
    }, [currentIndex, orderedQuestions.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        }
    }, [currentIndex]);

    const handleSubmit = useCallback(() => {
        setElapsed(Math.round((Date.now() - startTime) / 1000));
        setState('results');
    }, [startTime]);

    const handleRestart = useCallback(() => {
        setState('intro');
        setAnswers({});
        setCurrentIndex(0);
        setElapsed(0);
    }, []);

    // Scoring
    const { score, total, percentage, details } = useMemo(() => {
        if (state !== 'results') return { score: 0, total: 0, percentage: 0, details: [] as any[] };

        let correct = 0;
        const det = orderedQuestions.map(q => {
            const userAnswer = answers[q.id];
            let isCorrect = false;

            if (q.type === 'multi_select') {
                const correctIds = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                const userIds = Array.isArray(userAnswer) ? userAnswer : [];
                isCorrect =
                    correctIds.length === userIds.length &&
                    correctIds.every(id => userIds.includes(id));
            } else {
                isCorrect = String(userAnswer || '') === String(q.correctAnswer || '');
            }

            if (isCorrect) correct++;
            return { question: q, userAnswer, isCorrect };
        });

        const pct = orderedQuestions.length > 0 ? Math.round((correct / orderedQuestions.length) * 100) : 0;
        return { score: correct, total: orderedQuestions.length, percentage: pct, details: det };
    }, [state, orderedQuestions, answers]);

    const passed = percentage >= (quiz.passingScore || 80);

    // Format seconds as mm:ss
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    /* ─── Intro screen ──────────────────────────────── */
    if (state === 'intro') {
        return (
            <div className="max-w-xl mx-auto">
                <div className="bg-gradient-to-br from-[var(--md-primary)]/5 to-[var(--md-primary)]/10 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--md-primary)]/15 flex items-center justify-center mx-auto mb-4">
                        <EyeIcon className="h-7 w-7 text-[var(--md-primary)]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{quiz.title || 'Untitled Quiz'}</h2>
                    {quiz.description && (
                        <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{quiz.description}</p>
                    )}

                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mb-6">
                        <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                        {(quiz.timeLimitMinutes || 0) > 0 && (
                            <span className="flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5" />
                                {quiz.timeLimitMinutes} min
                            </span>
                        )}
                        <span>Pass: {quiz.passingScore || 80}%</span>
                    </div>

                    {questions.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700 flex items-start gap-2">
                            <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>Add some questions first to preview this quiz.</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleStart}
                            className="px-6 py-2.5 bg-[var(--md-primary)] text-white rounded-lg font-medium hover:bg-[var(--md-primary-dark)] transition-colors shadow-sm"
                        >
                            Start Preview
                        </button>
                    )}

                    <p className="text-[11px] text-gray-400 mt-4">This is an instructor preview — answers are not recorded.</p>
                </div>
            </div>
        );
    }

    /* ─── Taking the quiz ────────────────────────────── */
    if (state === 'taking' && currentQuestion) {
        const isMulti = currentQuestion.type === 'multi_select';
        const userAnswer = answers[currentQuestion.id];
        const options = currentQuestion.options || [];
        const hasAnswer = isMulti
            ? Array.isArray(userAnswer) && userAnswer.length > 0
            : !!userAnswer;

        return (
            <div className="max-w-2xl mx-auto">
                {/* progress bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                            Question {currentIndex + 1} of {orderedQuestions.length}
                        </span>
                        {(quiz.timeLimitMinutes || 0) > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {quiz.timeLimitMinutes} min limit
                            </span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / orderedQuestions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* question card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <p className="text-base font-medium text-gray-900 mb-1">{currentQuestion.question}</p>
                    <p className="text-xs text-gray-400 mb-5 capitalize">{currentQuestion.type.replace('_', ' ')}</p>

                    {/* Options */}
                    {(currentQuestion.type === 'single_select' || currentQuestion.type === 'multi_select') && (
                        <div className="space-y-2.5">
                            {options.map(opt => {
                                const selected = isMulti
                                    ? (Array.isArray(userAnswer) && userAnswer.includes(opt.id))
                                    : userAnswer === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelectAnswer(currentQuestion.id, opt.id, isMulti)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${selected
                                                ? 'border-[var(--md-primary)] bg-[var(--md-primary)]/5 ring-1 ring-[var(--md-primary)]/30 font-medium'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-${isMulti ? 'md border' : 'full border'} ${selected
                                                    ? 'bg-[var(--md-primary)] border-[var(--md-primary)] text-white'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selected && <CheckCircleIcon className="h-3.5 w-3.5" />}
                                            </div>
                                            <span>{opt.text}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* True/False */}
                    {currentQuestion.type === 'true_false' && (
                        <div className="flex gap-4">
                            {['true', 'false'].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelectAnswer(currentQuestion.id, val, false)}
                                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${userAnswer === val
                                            ? 'border-[var(--md-primary)] bg-[var(--md-primary)]/5 ring-1 ring-[var(--md-primary)]/30'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {val === 'true' ? 'True' : 'False'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Text input */}
                    {currentQuestion.type === 'text' && (
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                            rows={3}
                            value={String(userAnswer || '')}
                            onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value, false)}
                            placeholder="Type your answer..."
                        />
                    )}
                </div>

                {/* navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>

                    {/* dots */}
                    <div className="flex items-center gap-1.5">
                        {orderedQuestions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex
                                        ? 'bg-[var(--md-primary)] scale-125'
                                        : answers[q.id]
                                            ? 'bg-[var(--md-primary)]/40'
                                            : 'bg-gray-300'
                                    }`}
                                title={`Question ${i + 1}`}
                            />
                        ))}
                    </div>

                    {currentIndex < orderedQuestions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 text-sm font-medium text-[var(--md-primary)] hover:text-[var(--md-primary-dark)] transition-colors flex items-center gap-1"
                        >
                            Next <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!hasAnswer}
                            className="px-5 py-2 bg-[var(--md-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--md-primary-dark)] disabled:opacity-40 transition-colors shadow-sm"
                        >
                            Submit Quiz
                        </button>
                    )}
                </div>
            </div>
        );
    }

    /* ─── Results ────────────────────────────────────── */
    if (state === 'results') {
        return (
            <div className="max-w-2xl mx-auto">
                {/* score card */}
                <div className={`rounded-2xl p-6 text-center mb-8 ${passed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                        : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
                    }`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {passed
                            ? <TrophyIcon className="h-7 w-7 text-green-600" />
                            : <XCircleIcon className="h-7 w-7 text-red-500" />
                        }
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
                    </h3>
                    <p className="text-3xl font-black text-gray-900 mb-1">{percentage}%</p>
                    <p className="text-sm text-gray-600">
                        {score} of {total} correct • Time: {formatTime(elapsed)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Passing score: {quiz.passingScore || 80}%
                    </p>
                </div>

                {/* review answers */}
                {!quiz.hideAnswers && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700">Review Answers</h4>
                        {details.map(({ question: q, userAnswer: ua, isCorrect }, i) => {
                            const options = q.options || [];
                            const correctIds = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];

                            return (
                                <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'border-green-200 bg-green-50/40' : 'border-red-200 bg-red-50/40'}`}>
                                    <div className="flex items-start gap-2 mb-2">
                                        {isCorrect
                                            ? <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            : <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        }
                                        <div className="text-sm font-medium text-gray-900">
                                            {i + 1}. {q.question}
                                        </div>
                                    </div>

                                    {/* Show options with correct/wrong highlights */}
                                    {(q.type === 'single_select' || q.type === 'multi_select') && (
                                        <div className="ml-6 space-y-1.5 mt-2">
                                            {options.map(opt => {
                                                const wasCorrect = correctIds.includes(opt.id);
                                                const wasSelected = Array.isArray(ua)
                                                    ? ua.includes(opt.id)
                                                    : ua === opt.id;
                                                return (
                                                    <div key={opt.id} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${wasCorrect
                                                            ? 'bg-green-100 text-green-800 font-medium'
                                                            : wasSelected && !wasCorrect
                                                                ? 'bg-red-100 text-red-700 line-through'
                                                                : 'bg-gray-50 text-gray-500'
                                                        }`}>
                                                        {wasCorrect && <CheckCircleIcon className="h-3 w-3" />}
                                                        {wasSelected && !wasCorrect && <XCircleIcon className="h-3 w-3" />}
                                                        {opt.text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'true_false' && (
                                        <div className="ml-6 text-xs mt-1">
                                            <span className="text-gray-500">Your answer: </span>
                                            <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-600 line-through'}>
                                                {ua === 'true' ? 'True' : ua === 'false' ? 'False' : '(no answer)'}
                                            </span>
                                            {!isCorrect && (
                                                <span className="text-green-700 ml-2 font-medium">
                                                    Correct: {q.correctAnswer === 'true' ? 'True' : 'False'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {q.explanation && (
                                        <p className="ml-6 text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                                            {q.explanation}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {quiz.hideAnswers && (
                    <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <EyeIcon className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                        Detailed answer review is hidden for this quiz.
                    </div>
                )}

                {/* restart */}
                <div className="text-center mt-8">
                    <button
                        onClick={handleRestart}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcwIcon className="h-4 w-4" />
                        Retake Quiz
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
