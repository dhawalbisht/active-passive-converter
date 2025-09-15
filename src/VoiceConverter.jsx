import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Command } from 'lucide-react';

export default function VoiceConverter() {
    const [activeText, setActiveText] = useState('');
    const [passiveText, setPassiveText] = useState('');
    const [loading, setLoading] = useState(false);

    const detectVoiceType = (text) => {
        const passiveIndicators = [
            /\bis\s+\w*ed\b/i,
            /\bwas\s+\w*ed\b/i,
            /\bare\s+\w*ed\b/i,
            /\bwere\s+\w*ed\b/i,
            /\bbeen\s+\w*ed\b/i,
            /\bby\s+\w+$/i,
        ];
        return passiveIndicators.some(pattern => pattern.test(text)) ? 'passive' : 'active';
    };

    const convert = async () => {
        const sourceText = activeText.trim() || passiveText.trim();
        if (!sourceText) return;

        const voiceType = detectVoiceType(sourceText);
        const direction = voiceType === 'active' ? 'active_to_passive' : 'passive_to_active';

        setLoading(true);
        try {
            const response = await fetch('https://backend-active.onrender.com/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: sourceText,
                    direction: direction
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                throw new Error('Empty response');
            }

            const data = JSON.parse(text);

            if (direction === 'active_to_passive') {
                setPassiveText(data.converted_text);
            } else {
                setActiveText(data.converted_text);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorText = 'Error converting text. Please try again.';
            if (direction === 'active_to_passive') {
                setPassiveText(errorText);
            } else {
                setActiveText(errorText);
            }
        }
        setLoading(false);
    };

    const clearAll = () => {
        setActiveText('');
        setPassiveText('');
    };

    const hasText = activeText.trim() || passiveText.trim();

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && e.ctrlKey && hasText && !loading) {
                e.preventDefault();
                convert();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [hasText, loading, activeText, passiveText]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-slate-800 mb-3 tracking-tight">
                        Voice Converter
                    </h1>
                    <p className="text-slate-600 text-lg font-light">
                        Transform between active and passive voice
                    </p>
                </div>

                {/* Main Converter */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        {/* Active Voice */}
                        <div className="p-8 border-r border-slate-100/60">
                            <div className="mb-6">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                    Active Voice
                                </div>
                            </div>

                            <textarea
                                value={activeText}
                                onChange={(e) => setActiveText(e.target.value)}
                                placeholder="Enter your sentence in active voice..."
                                className="w-full h-80 p-0 border-0 resize-none focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-lg leading-relaxed bg-transparent"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                            />
                        </div>

                        {/* Passive Voice */}
                        <div className="p-8">
                            <div className="mb-6">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                                    Passive Voice
                                </div>
                            </div>

                            <textarea
                                value={passiveText}
                                onChange={(e) => setPassiveText(e.target.value)}
                                placeholder="Enter your sentence in passive voice..."
                                className="w-full h-80 p-0 border-0 resize-none focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-lg leading-relaxed bg-transparent"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100/60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Command className="w-4 h-4" />
                                <span>⌘ + Enter to convert</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={clearAll}
                                    disabled={!hasText}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:text-slate-400 transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={convert}
                                    disabled={!hasText || loading}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <ArrowRightLeft className="w-4 h-4 animate-spin" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRightLeft className="w-4 h-4" />
                                            Convert
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-slate-500 text-sm">
                    AI-powered voice conversion tool
                </div>
            </div>
        </div>
    );
}