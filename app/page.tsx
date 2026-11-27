'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

const MAX_MESSAGE_LENGTH = 500;
const DEMO_LIMIT_MESSAGE = 'Demo usage limit reached. Please try again later.';

const SAMPLE_PROMPTS = [
	'Total delivered orders ki amount kitni hai?',
	'Lahore ke customers kaun kaun hain?',
	'Sabse mehnga product kaunsa order hua hai?',
];

export default function Home() {
	const { messages, sendMessage, status, error, clearError } = useChat();
	const [input, setInput] = useState('');

	const isBusy = status === 'streaming' || status === 'submitted';

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isBusy) return;
		sendMessage({ text: input });
		setInput('');
	};

	const errorMessage = error
		? /429|rate.?limit|quota|usage limit|too many/i.test(error.message)
			? DEMO_LIMIT_MESSAGE
			: 'Something went wrong. Please try again.'
		: null;

	return (
		<main className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-6'>
			<div className='w-full max-w-2xl flex flex-col flex-1 border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden'>
				<header className='p-4 border-b border-zinc-800'>
					<div className='flex items-center justify-between gap-3'>
						<h1 className='text-lg font-semibold'>
							SQL AI Agent (Turso + Gemini)
						</h1>
						<span className='shrink-0 text-[11px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30'>
							Recruiter Live Demo • 5 free messages per hour
						</span>
					</div>
					<p className='text-xs text-zinc-400 mt-1'>
						Apne database se natural language mein sawal poochein
					</p>
				</header>

				<div className='flex-1 p-4 space-y-4 overflow-y-auto max-h-[65vh]'>
					{messages.length === 0 && (
						<div className='text-sm text-zinc-400 space-y-2'>
							<p>Try asking:</p>
							<div className='flex flex-wrap gap-2'>
								{SAMPLE_PROMPTS.map((prompt) => (
									<button
										key={prompt}
										type='button'
										onClick={() =>
											sendMessage({ text: prompt })
										}
										disabled={isBusy}
										className='text-left text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors disabled:opacity-50'
									>
										{prompt}
									</button>
								))}
							</div>
						</div>
					)}

					{errorMessage && (
						<div className='flex items-center justify-between gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300'>
							<span>{errorMessage}</span>
							<button
								type='button'
								onClick={clearError}
								className='text-red-300/70 hover:text-red-200 text-xs shrink-0'
							>
								Dismiss
							</button>
						</div>
					)}

					{messages.map((m) => (
						<div
							key={m.id}
							className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
								m.role === 'user'
									? 'bg-blue-600 text-white ml-auto max-w-[80%]'
									: 'bg-zinc-800 text-zinc-100 mr-auto max-w-[85%]'
							}`}
						>
							{m.parts.map((part, idx) =>
								part.type === 'text' ? (
									<span key={idx}>{part.text}</span>
								) : null,
							)}
						</div>
					))}
				</div>

				<form
					onSubmit={handleSubmit}
					className='p-3 border-t border-zinc-800'
				>
					<div className='flex gap-2'>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder='Apna sawal likhein...'
							maxLength={MAX_MESSAGE_LENGTH}
							className='flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
						/>
						<button
							type='submit'
							disabled={isBusy || !input.trim()}
							className='bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium'
						>
							Send
						</button>
					</div>
					<div className='flex justify-end mt-1'>
						<span
							className={`text-[11px] ${
								input.length >= MAX_MESSAGE_LENGTH
									? 'text-red-400'
									: 'text-zinc-500'
							}`}
						>
							{input.length}/{MAX_MESSAGE_LENGTH}
						</span>
					</div>
				</form>
			</div>
		</main>
	);
}
