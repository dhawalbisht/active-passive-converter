import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function VoiceConverter() {
    const [activeText, setActiveText] = useState('');
    const [passiveText, setPassiveText] = useState('');
    const [loading, setLoading] = useState(false);

    const detectVoiceType = (text) => {
        // Simple heuristics to detect voice type
        const passiveIndicators = [
            /\bis\s+\w*ed\b/i,     // "is completed"
            /\bwas\s+\w*ed\b/i,    // "was written"
            /\bare\s+\w*ed\b/i,    // "are made"
            /\bwere\s+\w*ed\b/i,   // "were built"
            /\bbeen\s+\w*ed\b/i,   // "been taken"
            /\bby\s+\w+$/i,        // ends with "by someone"
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
            // prod url
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

            // Update the opposite field
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Active Passive Voice Converter</h1>
                    <p className="text-gray-600">Convert between active and passive voice automatically</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Active Voice Side */}
                        <div className="p-6 border-r border-gray-200">
                            <div className="flex items-center justify-center mb-4">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Active Voice
                                </span>
                            </div>

                            <textarea
                                value={activeText}
                                onChange={(e) => setActiveText(e.target.value)}
                                placeholder="Type your sentence in active voice..."
                                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>

                        {/* Passive Voice Side */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Passive Voice
                                </span>
                            </div>

                            <textarea
                                value={passiveText}
                                onChange={(e) => setPassiveText(e.target.value)}
                                placeholder="Type your sentence in passive voice..."
                                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                            />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="bg-gray-50 p-4 border-t">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={convert}
                                disabled={!hasText || loading}
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
                            >
                                {loading ? (
                                    <ArrowRightLeft className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowRightLeft className="w-4 h-4" />
                                )}
                                {loading ? 'Converting...' : 'Convert'}
                            </button>

                            <button
                                onClick={clearAll}
                                disabled={!hasText}
                                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4 text-sm text-gray-500">
                    Type in either box and click Convert - the app will automatically detect the voice type
                </div>
            </div>
        </div>
    );
}