import React, { useEffect, useState } from "react";
import { fetchCourses, fetchCourseQuizzes } from "../../courses/services/courseService";

interface AuditQuizItem {
    courseSlug: string;
    id: string;
    orderIndex: number;
    question: string;
    correctAnswer: string[];
    explanation?: string;
    options: any[];
}

export const QuizAuditPage: React.FC = () => {
    const [items, setItems] = useState<AuditQuizItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const courses = await fetchCourses();
                const allQuizzes: AuditQuizItem[] = [];

                for (const course of courses) {
                    const quizzes = await fetchCourseQuizzes(course.slug);
                    quizzes.forEach((q) => {
                        allQuizzes.push({
                            courseSlug: course.slug,
                            id: q.id,
                            orderIndex: q.orderIndex,
                            question: q.question,
                            correctAnswer: Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.map(String)
                                : [String(q.correctAnswer)],
                            explanation: q.explanation,
                            options: q.options,
                        });
                    });
                }
                setItems(allQuizzes);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="p-8">Loading audit data...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Quiz Data Audit</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">Course</th>
                            <th className="p-4">ID / Order</th>
                            <th className="p-4 w-1/3">Question</th>
                            <th className="p-4 w-1/3">Explanation</th>
                            <th className="p-4">Answer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map((item) => (
                            <tr key={`${item.courseSlug}-${item.id}`} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-500">{item.courseSlug}</td>
                                <td className="p-4">
                                    <div>ID: {item.id}</div>
                                    <div className="text-gray-400">Order: {item.orderIndex}</div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-medium mb-2">{item.question}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.options?.map((o: any, i) => {
                                            const optionId = typeof o === "string"
                                                ? String(i)
                                                : String(o?.id ?? o?.value ?? i);
                                            const isCorrect = item.correctAnswer.includes(optionId);
                                            return (
                                                <div key={i} className={isCorrect ? "text-green-600 font-bold" : ""}>
                                                    {optionId}. {typeof o === "string" ? o : o.text || o.label || JSON.stringify(o)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    {item.explanation ? (
                                        <div className={`p-2 rounded ${item.explanation.includes('PLT') && !item.question.includes('PLT') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                            {item.explanation}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">No explanation</span>
                                    )}
                                </td>
                                <td className="p-4">{item.correctAnswer.join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
