'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Home() {
	const { messages, sendMessage, status } = useChat();
	const [input, setInput] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || status === 'streaming' || status === 'submitted')
			return;
		sendMessage({ text: input });
		setInput('');
	};

	return (
		<main className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-6'>
			<div className='w-full max-w-2xl flex flex-col flex-1 border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden'>
				<header className='p-4 border-b border-zinc-800'>
					<h1 className='text-lg font-semibold'>
						SQL AI Agent (Turso + Gemini)
					</h1>
					<p className='text-xs text-zinc-400'>
						Apne database se natural language mein sawal poochein
					</p>
				</header>

				<div className='flex-1 p-4 space-y-4 overflow-y-auto max-h-[65vh]'>
					{messages.length === 0 && (
						<div className='text-sm text-zinc-400 space-y-1'>
							<p>Try asking:</p>
							<ul className='list-disc list-inside text-zinc-300'>
								<li>
									Total delivered orders ki amount kitni hai?
								</li>
								<li>Lahore ke customers kaun kaun hain?</li>
								<li>
									Sabse mehnga product kaunsa order hua hai?
								</li>
							</ul>
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
					className='p-3 border-t border-zinc-800 flex gap-2'
				>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder='Apna sawal likhein...'
						className='flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
					/>
					<button
						type='submit'
						disabled={
							status === 'streaming' || status === 'submitted'
						}
						className='bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium'
					>
						Send
					</button>
				</form>
			</div>
		</main>
	);
}
