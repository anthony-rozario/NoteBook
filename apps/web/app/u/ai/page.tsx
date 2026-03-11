import React from 'react';
import { FiFileText, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function AIHubPage() {
  // Mock data matching your screenshot
  const recentSummaries = [
    {
      id: 1,
      title: 'Physics Chapter 1 Summary',
      excerpt: 'The chapter discusses the fundamental forces of nature, focusing heavily on electromagnetism and its relation to...',
    },
    {
      id: 2,
      title: 'Physics Chapter 2 Summary',
      excerpt: 'The chapter discusses the fundamental forces of nature, focusing heavily on electromagnetism and its relation to...',
    }
  ];

  const generatedQuizzes = [
    {
      id: 1,
      title: 'History - WWII Events',
      questionCount: 10,
      context: "Generated 2 days ago from 'European History Draft'",
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      
      {/* Hero Banner */}
      <div className="bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] rounded-2xl p-8 md:p-12 border border-purple-100 relative overflow-hidden">
        
        {/* Background Decorative Star Watermark */}
        <div className="absolute -right-10 -top-10 text-purple-200/40 pointer-events-none hidden md:block">
          <BsStars size={300} />
        </div>

        <div className="relative z-10">
          {/* AI Icon Container */}
          <div className="w-12 h-12 bg-purple-200/50 text-purple-700 rounded-xl flex items-center justify-center mb-6 border border-purple-200/50">
            <BsStars size={24} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            NoteBook AI Hub
          </h1>
          <p className="text-gray-600 max-w-2xl text-base md:text-lg leading-relaxed">
            Your intelligent research assistant. Review generated summaries, quizzes, and extracted knowledge from your notebooks.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Recent Summaries */}
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiFileText className="text-blue-500" /> Recent Summaries
            </h2>
            <p className="text-sm text-gray-500 mt-1">AI-generated condensations of your long notes.</p>
          </div>

          <div className="space-y-4">
            {recentSummaries.map((summary) => (
              <div key={summary.id} className="bg-white border border-gray-100 p-5 rounded-xl hover:shadow-md transition-shadow group flex flex-col h-full">
                <h3 className="font-bold text-gray-900 mb-2">{summary.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {summary.excerpt}
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 w-max transition-colors">
                  Read full summary <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Generated Quizzes */}
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiBookOpen className="text-purple-500" /> Generated Quizzes
            </h2>
            <p className="text-sm text-gray-500 mt-1">Test your knowledge based on your notes.</p>
          </div>

          <div className="space-y-4">
            {generatedQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white border border-gray-100 p-5 rounded-xl hover:shadow-md transition-shadow">
                
                <div className="flex items-start justify-between mb-2 gap-4">
                  <h3 className="font-bold text-gray-900">{quiz.title}</h3>
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md shrink-0">
                    {quiz.questionCount} Questions
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-5">
                  {quiz.context}
                </p>
                
                <button className="w-full bg-[#8b5cf6] hover:bg-purple-600 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm active:scale-[0.98]">
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}