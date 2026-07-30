import './HoverButton.css'

interface HoverButtonProps {
    onClick: () => void;
}

export const HoverButton = ({ onClick }: HoverButtonProps) => {
    return (
        <button className="factcheck-btn" onClick={onClick}>
            Fact-check
        </button>
    )
}