import React, { useState } from 'react';
const QuestionCard = ({ item }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-3">{item.question}</h3>
            
            {item.options && (
                <div className="space-y-2 mb-4">
                    {item.options.map((opt, i) => (
                        <div key={i} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-700">
                            {opt}
                        </div>
                    ))}
                </div>
            )}
            
            {item.starterCode && (
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Starter Code ({item.language}):</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{item.starterCode}</code>
                    </pre>
                </div>
            )}

            <button 
                onClick={() => setShowAnswer(!showAnswer)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors mt-2"
            >
                {showAnswer ? 'Hide Answer' : 'View Answer'}
            </button>

            {showAnswer && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in duration-200">
                    <p className="font-semibold text-blue-900 mb-1">Answer:</p>
                    {item.type === 'coding' ? (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                            <code>{item.answer}</code>
                        </pre>
                    ) : (
                        <p className="text-blue-800">{item.answer}</p>
                    )}
                    
                    {item.explanation && (
                        <div className="mt-3">
                            <p className="font-semibold text-blue-900 mb-1">Explanation:</p>
                            <p className="text-blue-800 text-sm">{item.explanation}</p>
                        </div>
                    )}
                    
                    {item.tips && (
                        <div className="mt-3">
                            <p className="font-semibold text-blue-900 mb-1">Tips:</p>
                            <ul className="list-disc pl-5 text-blue-800 text-sm space-y-1">
                                {item.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SectionLayout = ({ title, sectionKey }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        import('../../../core/services/api').then(({ api }) => {
            api.getPrepTopics(sectionKey)
                .then(res => {
                    const formatted = res.data.map(topic => ({
                        id: topic.id,
                        question: topic.title,
                        explanation: topic.subtitle,
                        answer: topic.content || "Read the resources to learn more about this topic.",
                        difficulty: topic.difficulty,
                        tag: topic.tag
                    }));
                    setData(formatted);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        });
    }, [sectionKey]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">{title}</h1>
            {isLoading ? (
                <div className="text-center text-gray-500 p-8">Loading questions...</div>
            ) : error ? (
                <div className="text-center text-red-500 p-8">Error: {error}</div>
            ) : data && data.length > 0 ? (
                data.map(item => <QuestionCard key={item.id} item={item} />)
            ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    No questions available for this section yet.
                </div>
            )}
        </div>
    );
};

const CompanySectionLayout = ({ title, sectionKey }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        import('../../../core/services/api').then(({ api }) => {
            api.getPrepTopics(sectionKey)
                .then(res => {
                    const formatted = res.data.map(topic => ({
                        id: topic.id,
                        companyName: topic.tag || "General",
                        questions: [
                            {
                                id: topic.id,
                                question: topic.title,
                                explanation: topic.subtitle,
                                answer: topic.content || "Read the resources to learn more about this topic."
                            }
                        ]
                    }));
                    setData(formatted);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        });
    }, [sectionKey]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">{title}</h1>
            {isLoading ? (
                <div className="text-center text-gray-500 p-8">Loading questions...</div>
            ) : error ? (
                <div className="text-center text-red-500 p-8">Error: {error}</div>
            ) : data && data.length > 0 ? (
                data.map((company, index) => (
                    <div key={index} className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-700 border-b border-gray-200 pb-2">{company.companyName}</h2>
                        {company.questions.map(item => <QuestionCard key={item.id} item={item} />)}
                    </div>
                ))
            ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    No questions available for this section yet.
                </div>
            )}
        </div>
    );
};

export const AptitudePage = () => <SectionLayout title="Aptitude Preparation" sectionKey="aptitude" />;
export const TechnicalPage = () => <SectionLayout title="Technical Preparation" sectionKey="technical" />;
export const CodingPage = () => <SectionLayout title="Coding Practice" sectionKey="coding" />;
export const HRPage = () => <SectionLayout title="HR Questions" sectionKey="hr" />;
export const MockTestPage = () => <SectionLayout title="Mock Tests" sectionKey="mock" />;
export const CompanyPage = () => <CompanySectionLayout title="Company Wise Preparation" sectionKey="company" />;
export const ProgressPage = () => (
    <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Progress</h1>
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            This section is currently under development. Check back later!
        </div>
    </div>
);
