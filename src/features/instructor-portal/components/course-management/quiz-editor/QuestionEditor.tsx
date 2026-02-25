import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types/dtma-lms';
import { XIcon, PlusIcon, TrashIcon, CheckCircleIcon } from 'lucide-react';

interface QuestionEditorProps {
    question?: QuizQuestion;
    onSave: (question: QuizQuestion) => void;
    onCancel: () => void;
}

export function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
    const [formData, setFormData] = useState<Partial<QuizQuestion>>({
        question: '',
        type: 'single_select',
        options: [
            { id: '1', text: '' },
            { id: '2', text: '' }
        ],
        correctAnswer: '',
        explanation: '',
        orderIndex: 0
    });

    useEffect(() => {
        if (question) {
            setFormData({ ...question });
        }
    }, [question]);

    const handleOptionChange = (id: string, text: string) => {
        const newOptions = formData.options?.map(opt =>
            opt.id === id ? { ...opt, text } : opt
        ) || [];
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        const newId = String((formData.options?.length || 0) + 1);
        setFormData({
            ...formData,
            options: [...(formData.options || []), { id: crypto.randomUUID(), text: '' }]
        });
    };

    const removeOption = (id: string) => {
        setFormData({
            ...formData,
            options: formData.options?.filter(opt => opt.id !== id) || []
        });
    };

    const toggleCorrectAnswer = (optionId: string) => {
        if (formData.type === 'single_select' || formData.type === 'true_false') {
            setFormData({ ...formData, correctAnswer: optionId });
        } else if (formData.type === 'multi_select') {
            const current = Array.isArray(formData.correctAnswer) ? formData.correctAnswer : [];
            const newAnswers = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];
            setFormData({ ...formData, correctAnswer: newAnswers });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation could go here
        onSave(formData as QuizQuestion);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                    {question ? 'Edit Question' : 'New Question'}
                </h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <XIcon className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                        >
                            <option value="single_select">Single Choice</option>
                            <option value="multi_select">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                            <option value="text">Text Input (Manual Grading)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                            placeholder="Enter your question here..."
                        />
                    </div>

                    {/* Options Editor */}
                    {(formData.type === 'single_select' || formData.type === 'multi_select') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Answer Options
                            </label>
                            <div className="space-y-3">
                                {formData.options?.map((option, index) => {
                                    const isCorrect = Array.isArray(formData.correctAnswer)
                                        ? formData.correctAnswer.includes(option.id)
                                        : formData.correctAnswer === option.id;

                                    return (
                                        <div key={option.id} className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleCorrectAnswer(option.id)}
                                                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isCorrect
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 text-transparent hover:border-gray-400'
                                                    }`}
                                                title="Mark as correct answer"
                                            >
                                                <CheckCircleIcon className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)] ${isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                                    }`}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(option.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={addOption}
                                className="mt-3 flex items-center text-sm text-[var(--md-primary)] hover:text-[var(--md-primary-dark)] font-medium"
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Option
                            </button>
                        </div>
                    )}

                    {formData.type === 'true_false' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correct Answer
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${formData.correctAnswer === 'true' ? 'bg-green-50 border-green-200 ring-1 ring-green-500' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="tf_answer"
                                        checked={formData.correctAnswer === 'true'}
                                        onChange={() => setFormData({ ...formData, correctAnswer: 'true' })}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="font-medium text-gray-700">True</span>
                                </label>
                                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${formData.correctAnswer === 'false' ? 'bg-green-50 border-green-200 ring-1 ring-green-500' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="tf_answer"
                                        checked={formData.correctAnswer === 'false'}
                                        onChange={() => setFormData({ ...formData, correctAnswer: 'false' })}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="font-medium text-gray-700">False</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={formData.explanation || ''}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                            placeholder="Explain why the correct answer is correct..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)] font-medium"
                    >
                        {question ? 'Update Question' : 'Add Question'}
                    </button>
                </div>
            </form>
        </div>
    );
}

