import { 
    CircleCheck,
    CircleEllipsis,
    CircleX,
    Search,
    Settings,
    Share,
    BookmarkPlus,
    FileText,
    Quote,
    BookOpen,
    ExternalLink,
    Calendar,
    X
} from "lucide-react";
import './ResultsPanel.css';

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
    onClose: () => void;
}

export const ResultsPanel = ({ selectedText, result, onClose }: ResultsPanelProps) => {
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

    return (
        <div className="panel-container">
            {/* Header */}
            <header className="panel-header">
                <div className="panel-title">ScholarLens</div>
                <div className="header-actions">
                    <button className="icon-btn" aria-label="Search">
                        <Search size={20} />
                    </button>
                    <button className="icon-btn" aria-label="Settings">
                        <Settings size={20} />
                    </button>
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
                            <button className="research-btn">
                                <BookmarkPlus size={14} /> Save
                            </button>
                            <button className="research-btn">
                                <FileText size={14} /> Export
                            </button>
                            <button className="research-btn">
                                <Quote size={14} /> Cite
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