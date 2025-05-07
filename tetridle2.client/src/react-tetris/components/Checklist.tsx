export const Checklist = (props: { missions: string[], completion?: boolean[], className?: string}) => {
    const completion = props.completion || new Array(props.missions.length).fill(false); // Default to empty array if undefined
    return (
        <div className={"modal-checklist " + props.className}>
            <h2 className="modal-checklist-title">Today's mission</h2>
            <ul className="modal-checklist-list">
                {props.missions.map((mission: string, index: number) => ( // Explicit types for map args
                    <li key={index} className="modal-checklist-item">
                        {/* Use template literals for unique IDs */}
                        <input type="checkbox" id={`mission-${index}`} disabled={true} value={completion[index]} />
                        <label htmlFor={`mission-${index}`}>{mission}</label>
                    </li>
                ))}
                {props.missions.length === 0 && (
                    <li className="modal-checklist-item-empty">No missions today!</li>
                )}
            </ul>
        </div>
    )
}

