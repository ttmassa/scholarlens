import './HoverButton.css'

interface HoverButtonProps {
    onClick: () => void;
}

export const HoverButton: React.FC<HoverButtonProps> = ({ onClick }) => {
    return (
        <button className="factcheck-btn" onClick={onClick}>
            Fact-check
        </button>
    )
}