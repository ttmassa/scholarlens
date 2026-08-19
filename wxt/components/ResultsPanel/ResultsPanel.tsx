import { 
    CircleCheck,
    CircleEllipsis,
    CircleX,
    Settings,
    Share,
    BookmarkPlus,
    FileText,
    Quote,
    BookOpen,
    ExternalLink,
    Calendar,
    X,
    Globe
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import './ResultsPanel.css';

export const SUPPORTED_LANGUAGES = [
    { code: "English", label: "EN" },
    { code: 'French', label: 'FR' },
    { code: 'Spanish', label: 'ES' },
    { code: 'German', label: 'DE' },
]

// Types and Enums
export enum FactCheckStatus {
    Loading = 'LOADING',
    Success = 'SUCCESS',
    Error = 'ERROR',
}

export enum FactCheckVerdict {
    True = 'TRUE',
    False = 'FALSE',
    Misleading = 'MISLEADING',
    Unverified = 'UNVERIFIED',
    Uncheckable = 'UNCHECKABLE',
}

export interface Source {
    title: string;
    url: string;
    description: string;
}

export interface FactCheckResult {
    status: FactCheckStatus;
    verdict?: FactCheckVerdict;
    score?: number;
    explanation?: string;
    sources?: Source[];
}

interface ResultsPanelProps {
    selectedText: string;
    result: FactCheckResult;
    currentLanguage: string;
    onLanguageChange: (lang: string) => void,
    onClose: () => void;
}

export const ResultsPanel = ({ selectedText, result, currentLanguage, onLanguageChange, onClose }: ResultsPanelProps) => {
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isCiteCopied, setIsCiteCopied] = useState(false);
    const languageSelectorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!isLanguageMenuOpen) {
                return;
            }

            if (languageSelectorRef.current && !languageSelectorRef.current.contains(event.target as Node)) {
                setIsLanguageMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, [isLanguageMenuOpen]);

    // Configuration for status indicators
    const statusConfig = {
        [FactCheckStatus.Loading]: {
            icon: <CircleEllipsis size={16} className="status-icon" />,
            label: 'Checking...',
        },
        [FactCheckStatus.Success]: {
            icon: <CircleCheck size={16} className="status-icon" />,
            label: 'Check Complete',
        },
        [FactCheckStatus.Error]: {
            icon: <CircleX size={16} className="status-icon" />,
            label: 'Error',
        },
    } as const;

    // Limit sources description to 180 characters
    const truncateDescription = (description: string, maxLength: number = 170) => {
        if (description.length <= maxLength) {
            return description;
        }
        return description.slice(0, maxLength) + '...';
    }
    
    // Save the result to worker storage for later retrieval
    const handleSaveClick = () => {
        
    }

    // Ask background script to open a preview tab so page CSP/popup blockers don't interfere.
    const handleExportClick = () => {
        const exportContent = `Claim: "${selectedText}"\nVerdict: ${result.verdict || 'N/A'}\nScore: ${result.score !== undefined ? result.score + '%' : 'N/A'}\nExplanation: ${result.explanation || 'N/A'}\nSources: ${result.sources && result.sources.length > 0 ? result.sources.map(src => `${src.title} (${src.url})`).join(', ') : 'N/A'}`;

        browser.runtime.sendMessage({
            type: 'OPEN_EXPORT_PREVIEW',
            payload: { content: exportContent },
        }).catch((error) => {
            console.error('[ScholarLens] Failed to open export preview:', error);
        });
    }

    // Copy citation to clipboard
    const handleCiteClick = () => {
        const citationTemplate = `Claim: "${selectedText}"\nVerdict: ${result.verdict || 'N/A'}\nScore: ${result.score !== undefined ? result.score + '%' : 'N/A'}\nSources: ${result.sources && result.sources.length > 0 ? result.sources.map(src => src.url).join(', ') : 'N/A'}`;
        navigator.clipboard.writeText(citationTemplate)
            .then(() => {
                setIsCiteCopied(true);
            })
            .catch(err => {
                console.error('Failed to copy citation: ', err);
            });
    }

    return (
        <div className="panel-container">
            {/* Header */}
            <header className="panel-header">
                <div className="panel-title">ScholarLens</div>
                <div className="header-actions">
                    <button className="icon-btn" aria-label="Settings">
                        <Settings size={20} />
                    </button>
                    <div className="language-selector-wrapper" ref={languageSelectorRef}>
                        <button
                            type="button"
                            className="icon-btn language-toggle"
                            aria-label={`Language selection, current language ${currentLanguage}`}
                            aria-haspopup="menu"
                            aria-expanded={isLanguageMenuOpen}
                            onClick={() => setIsLanguageMenuOpen((open) => !open)}
                        >
                            <Globe size={20} />
                        </button>
                        {isLanguageMenuOpen && (
                            <div className="language-menu" role="menu" aria-label="Language selection">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        className={`language-menu-item ${lang.code === currentLanguage ? 'is-selected' : ''}`}
                                        role="menuitemradio"
                                        aria-checked={lang.code === currentLanguage}
                                        onClick={() => {
                                            onLanguageChange(lang.code);
                                            setIsLanguageMenuOpen(false);
                                        }}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="icon-btn" aria-label="Close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Main Canvas */}
            <main className="panel-main">
                {/* Status Indicator */}
                <div className="status-indicator">
                    {statusConfig[result.status].icon}
                    <span className="status-label">{statusConfig[result.status].label}</span>
                </div>

                <div className="results-scroll-area">
                    <div className="results-stack">
                        {/* Primary Verdict Card */}
                        <div className={"glass-panel verdict-card"}>
                            <div className={"verdict-glow"}></div>
                            <div className="verdict-content">
                                <div className="verdict-header">
                                    <h2 className="verdict-title">{(result.verdict || (result.status === FactCheckStatus.Loading && "LOADING")) || "ERROR"}</h2>
                                    {result.score !== undefined && (
                                        <div className="score-badge">
                                            <span className="score-label">Score</span>
                                            <span className="score-value">{result.score}%</span>
                                        </div>
                                    )}
                                </div>
                                <div className="claim-section">
                                    <h3 className="claim-label">Analyzed Claim</h3>
                                    <p className="claim-text">"{selectedText}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Context / Quick Action Panel */}
                        <div className="glass-panel context-panel">
                            <h3 className="panel-heading">AI Analysis</h3>
                            <p className="analysis-text">
                                {result.explanation || "No explanation provided."}
                            </p>
                            <div className="action-row-divider">
                                <button className="action-btn">
                                    <Share size={14} /> Share
                                </button>
                            </div>
                        </div>

                        {/* Research Action Buttons */}
                        <div className="research-actions">
                            <button className="research-btn" onClick={handleSaveClick}>
                                <BookmarkPlus size={14} /> Save
                            </button>
                            <button className="research-btn" onClick={handleExportClick}>
                                <FileText size={14} /> Export
                            </button>
                            <button className="research-btn" onClick={handleCiteClick}>
                                <Quote size={14} /> {isCiteCopied ? "Copied!" : "Cite"}
                            </button>
                        </div>

                        {/* Verified Sources Section */}
                        {result.sources && result.sources.length > 0 && (
                            <div className="sources-section">
                                <div className="sources-header">
                                    <BookOpen size={16} className="sources-icon" />
                                    <h3 className="panel-heading">Verified Sources</h3>
                                </div>
                                
                                <div className="sources-list">
                                    {result.sources.map((source, index) => (
                                        <div key={index} className="glass-panel source-card group">
                                            <div className="source-card-header">
                                                <span className="source-tag">{source.url}</span>
                                                <a href={source.url} target="_blank" rel="noreferrer" className="source-link">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                            <h4 className="source-title">{source.title}</h4>
                                            <p className="source-desc">{truncateDescription(source.description)}</p>
                                            <div className="source-meta">
                                                <span className="meta-item"><Calendar size={11} /> 2026</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};