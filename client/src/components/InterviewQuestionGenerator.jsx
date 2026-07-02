import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiterService';
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Code,
  Users,
  Cpu,
  RefreshCw,
  Edit3,
} from 'lucide-react';

export function InterviewQuestionGenerator({ candidateName, jobTitle, resumeText, jobDescription, roundId }) {
  const [activeCategory, setActiveCategory] = useState('technical'); // technical | behavioral | coding

  const [questionsKit, setQuestionsKit] = useState({
    technical: [
      { id: 't1', question: `Explain your architectural approach to scaling backend microservices for ${jobTitle || 'this role'}.`, difficulty: 'MEDIUM', expectedAnswer: 'Focus on database partitioning, caching, and async messaging queues.' },
      { id: 't2', question: 'How do you structure API error handling and validation middleware in Node.js?', difficulty: 'EASY', expectedAnswer: 'Zod/Joi validation, centralized error handler, custom HTTP error classes.' },
    ],
    behavioral: [
      { id: 'b1', question: 'Describe a situation where you had to resolve a high-priority production outage under pressure.', difficulty: 'MEDIUM', expectedAnswer: 'STAR response: Situation, Task, Action, Result.' },
      { id: 'b2', question: 'How do you handle technical disagreements with senior architects on project direction?', difficulty: 'EASY', expectedAnswer: 'Focus on data-driven benchmarks and constructive compromise.' },
    ],
    coding: [
      { id: 'c1', question: 'Implement a function to find the maximum subarray sum (Kadane Algorithm) with O(n) runtime.', difficulty: 'HARD', expectedAnswer: 'Dynamic programming / greedy tracking.' },
      { id: 'c2', question: 'Write a utility to deep clone a nested JavaScript object handling circular references.', difficulty: 'MEDIUM', expectedAnswer: 'WeakMap or structuredClone recursion.' },
    ],
  });

  // Generate AI Questions Mutation
  const generateMut = useMutation({
    mutationFn: () =>
      recruiterService.generateInterviewQuestions({
        candidateName,
        jobTitle,
        resumeText,
        jobDescription,
      }),
    onSuccess: (res) => {
      if (res.data) {
        setQuestionsKit(res.data);
      }
    },
  });

  // Save Questions Kit Mutation
  const saveMut = useMutation({
    mutationFn: () => recruiterService.saveInterviewQuestions(roundId || 'demo_round_1', questionsKit),
    onSuccess: () => alert('Interview Question Kit saved to database successfully!'),
  });

  // Category items helper
  const categoryQuestions = questionsKit[activeCategory] || [];

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...categoryQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestionsKit({ ...questionsKit, [activeCategory]: updated });
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      question: 'New custom interview question...',
      difficulty: 'MEDIUM',
      expectedAnswer: 'Key points to evaluate candidate answer...',
    };
    setQuestionsKit({
      ...questionsKit,
      [activeCategory]: [...categoryQuestions, newQ],
    });
  };

  const handleDeleteQuestion = (index) => {
    const updated = categoryQuestions.filter((_, i) => i !== index);
    setQuestionsKit({ ...questionsKit, [activeCategory]: updated });
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Interview Prep Assistant
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Custom Interview Question Kit</h3>
          <p className="text-xs text-slate-500">
            Tailored questions generated for <span className="font-bold text-slate-800">{candidateName || 'Candidate'}</span> ({jobTitle || 'Job Role'}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => generateMut.mutate()}
            disabled={generateMut.isPending}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {generateMut.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Regenerate with AI
              </>
            )}
          </button>

          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saveMut.isPending ? 'Saving...' : 'Save Question Kit'}
          </button>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 font-bold">
          {[
            { id: 'technical', label: `Technical (${questionsKit.technical?.length || 0})`, icon: Cpu },
            { id: 'behavioral', label: `Behavioral (${questionsKit.behavioral?.length || 0})`, icon: Users },
            { id: 'coding', label: `Coding & Algorithms (${questionsKit.coding?.length || 0})`, icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  activeCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAddQuestion}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center gap-1 hover:bg-indigo-100 transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Questions Editable Cards List */}
      <div className="space-y-4">
        {categoryQuestions.length === 0 ? (
          <p className="text-slate-400 py-6 text-center">No questions added in this category yet.</p>
        ) : (
          categoryQuestions.map((q, idx) => (
            <div key={q.id || idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              {/* Question Header & Difficulty Tag */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Question #{idx + 1}
                </span>

                <div className="flex items-center gap-3">
                  {/* Difficulty Badge Selector */}
                  <select
                    value={q.difficulty}
                    onChange={(e) => handleUpdateQuestion(idx, 'difficulty', e.target.value)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border focus:outline-none ${
                      q.difficulty === 'EASY'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : q.difficulty === 'HARD'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>

                  <button
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editable Question Text */}
              <textarea
                rows={2}
                value={q.question}
                onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                placeholder="Interview Question Prompt..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 transition"
              />

              {/* Editable Expected Answer Guide */}
              <div>
                <label className="font-bold text-slate-500 text-[10px] block mb-1">Expected Answer & Evaluation Key</label>
                <input
                  type="text"
                  value={q.expectedAnswer || ''}
                  onChange={(e) => handleUpdateQuestion(idx, 'expectedAnswer', e.target.value)}
                  placeholder="Key concepts to look for in candidate response..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-600 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InterviewQuestionGenerator;
