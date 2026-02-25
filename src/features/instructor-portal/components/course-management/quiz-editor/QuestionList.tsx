import React, { useState, useCallback } from 'react';
import { QuizQuestion } from '@/types/dtma-lms';
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    GripVerticalIcon,
    CopyIcon,
    MoreVerticalIcon,
    CheckCircleIcon,
    ListIcon,
    ToggleLeftIcon,
    TypeIcon,
} from 'lucide-react';

// dnd-kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ─── Types ──────────────────────────────────────── */

interface QuestionListProps {
    questions: QuizQuestion[];
    onAdd: () => void;
    onEdit: (question: QuizQuestion) => void;
    onDelete: (questionId: string) => void;
    onDuplicate?: (question: QuizQuestion) => void;
    onReorder?: (reorderedQuestions: QuizQuestion[]) => void;
}

/* ─── Helper: question type badge ────────────────── */

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    single_select: {
        label: 'Single Choice',
        icon: <CheckCircleIcon className="h-3 w-3" />,
        color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    multi_select: {
        label: 'Multi Choice',
        icon: <ListIcon className="h-3 w-3" />,
        color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    true_false: {
        label: 'True / False',
        icon: <ToggleLeftIcon className="h-3 w-3" />,
        color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    text: {
        label: 'Text Input',
        icon: <TypeIcon className="h-3 w-3" />,
        color: 'bg-teal-50 text-teal-700 border-teal-100',
    },
};

/** Get a short preview of the correct answer(s) */
function getCorrectAnswerPreview(question: QuizQuestion): string {
    if (question.type === 'true_false') {
        return question.correctAnswer === 'true' ? '✓ True' : '✗ False';
    }
    if (question.type === 'text') {
        return String(question.correctAnswer || '—');
    }

    // For single_select / multi_select, resolve option text
    const correctIds = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
    const options = question.options || [];
    const matched = options.filter((o) => correctIds.includes(o.id)).map((o) => o.text);

    if (matched.length === 0) return '(no correct answer set)';
    if (matched.length === 1) return `✓ ${matched[0]}`;
    return `✓ ${matched.join(', ')}`;
}

/* ─── Sortable Item ──────────────────────────────── */

interface SortableQuestionProps {
    question: QuizQuestion;
    index: number;
    onEdit: (question: QuizQuestion) => void;
    onDelete: (questionId: string) => void;
    onDuplicate?: (question: QuizQuestion) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({ question, index, onEdit, onDelete, onDuplicate }) => {
    const [showMenu, setShowMenu] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    } as React.CSSProperties;

    const cfg = typeConfig[question.type] || typeConfig.single_select;
    const options = question.options || [];
    const answerPreview = getCorrectAnswerPreview(question);

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-lg shadow-sm transition-all ${isDragging
                ? 'border-[var(--md-primary)] shadow-lg ring-2 ring-[var(--md-primary)]/20'
                : 'border-gray-200 hover:border-[var(--md-primary)]/40'
                }`}
        >
            <div className="px-4 py-3.5 flex items-start gap-3">
                {/* drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 focus:outline-none"
                    tabIndex={-1}
                    aria-label="Drag to reorder"
                >
                    <GripVerticalIcon className="h-5 w-5" />
                </button>

                {/* question number */}
                <div className="w-7 h-7 rounded-full bg-[var(--md-primary)]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--md-primary)]">
                    {index + 1}
                </div>

                {/* content */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{question.question}</p>

                    {/* metadata row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* type badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                        </span>

                        {/* option count */}
                        {(question.type === 'single_select' || question.type === 'multi_select') && options.length > 0 && (
                            <span className="text-[11px] text-gray-400">
                                {options.length} option{options.length !== 1 ? 's' : ''}
                            </span>
                        )}

                        {/* correct answer preview */}
                        <span className="text-[11px] text-green-600 truncate max-w-[220px]" title={answerPreview}>
                            {answerPreview}
                        </span>
                    </div>
                </div>

                {/* actions: kebab menu */}
                <div className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowMenu((v) => !v)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="More actions"
                    >
                        <MoreVerticalIcon className="h-4 w-4" />
                    </button>

                    {showMenu && (
                        <>
                            {/* backdrop */}
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            {/* menu */}
                            <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-1">
                                <button
                                    onClick={() => { onEdit(question); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <EditIcon className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                                {onDuplicate && (
                                    <button
                                        onClick={() => { onDuplicate(question); setShowMenu(false); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <CopyIcon className="h-3.5 w-3.5" />
                                        Duplicate
                                    </button>
                                )}
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                    onClick={() => { onDelete(question.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
};

/* ─── Main Component ─────────────────────────────── */

export function QuestionList({ questions, onAdd, onEdit, onDelete, onDuplicate, onReorder }: QuestionListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
                ...q,
                orderIndex: i,
            }));

            onReorder?.(reordered);
        },
        [questions, onReorder],
    );

    // Empty state
    if (!questions || questions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <PlusIcon className="h-full w-full" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new question.</p>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--md-primary)]"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Question
                    </button>
                </div>
            </div>
        );
    }

    const questionIds = questions.map((q) => q.id);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    Questions ({questions.length})
                </h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark)]"
                >
                    <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Add Question
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-3">
                        {questions.map((question, index) => (
                            <SortableQuestion
                                key={question.id || `temp-${index}`}
                                question={question}
                                index={index}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onDuplicate={onDuplicate}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>

            <p className="text-xs text-gray-400 text-center pt-2">
                <GripVerticalIcon className="h-3 w-3 inline-block mr-1" />
                Drag questions to reorder
            </p>
        </div>
    );
}
