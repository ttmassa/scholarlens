import { CircleCheck, Search, Settings } from "lucide-react";
import './ResultsPanel.css';

// Start by defining the types for the fact-checking results
export enum FactCheckStatus {
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export enum FactCheckVerdict {
    True = 'TRUE',
    False = 'FALSE',
    Misleading = 'MISLEADING',
    Unverified = 'UNVERIFIED',
}

// Define the structure of the fact-checking result
export interface FactCheckResult {
    status: FactCheckStatus;
    verdict?: FactCheckVerdict;
    score?: number;
    explanation?: string;
    sources?: string[];
}

interface ResultsPanelProps {
    selectedText: string,
    result: FactCheckResult;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ selectedText, result }) => {
    return (
        <div className="panel-container">
            <header className="panel-header">
                <h2 className="panel-title">ScholarLens</h2>
                <div className="header-end">
                    <button className="header-btn search-btn">
                        <Search />
                    </button>
                    <button className="header-btn settings-btn">
                        <Settings />
                    </button>
                </div>
            </header>
            
            <main className="panel-main">
                <div className="factcheck-status">
                    <CircleCheck className={`status-icon ${result.status}`} size={18}/>
                    <span className="status-text">{result.status.toUpperCase()}</span>
                </div>
            </main>
        </div>
    )
}