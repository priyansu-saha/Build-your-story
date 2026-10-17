import { TOPICS } from "../data";
import Icon from "./Icon";
import { triggerFluidSplat } from "./FluidCursor";

export default function QuickChips({
  onPick,
  big = false,
  off = false,
}) {
  const handleClick = (e, key, topic) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (rect.left + rect.width / 2) / window.innerWidth;
    const normY = 1 - (rect.top + rect.height / 2) / window.innerHeight;

    triggerFluidSplat({
      x: normX,
      y: normY,
      hexColor: topic.color,
      count: 3,
      radius: 0.0045,
      velocity: 700,
    });

    onPick(key);
  };

  return (
    <div
      className={`chips${big ? " big" : ""}${off ? " off" : ""}`}
      aria-hidden={off || undefined}
    >
      {Object.entries(TOPICS).map(([key, topic]) => (
        <button
          key={key}
          className={`chip chip-${key}`}
          type="button"
          disabled={off}
          style={{ "--chip-color": topic.color }}
          onClick={(e) => handleClick(e, key, topic)}
        >
          <span className="chip-icon-box" style={{ color: topic.color }}>
            <Icon name={key} />
          </span>
          <span className="chip-label">{topic.label}</span>
        </button>
      ))}
    </div>
  );
}
