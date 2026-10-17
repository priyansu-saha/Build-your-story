import { useState } from "react";
import { DATA } from "../data";
import { triggerFluidSplat } from "./FluidCursor";

export default function Avatar({
  className = "",
  as: Tag = "div",
  interactive = false,
  ...rest
}) {
  const photo = DATA.avatar || DATA.photo;
  const [isBopped, setIsBopped] = useState(false);

  const isHero = className.includes("hero-avatar");

  const handleClick = (e) => {
    if (isHero) {
      setIsBopped(true);
      setTimeout(() => setIsBopped(false), 500);

      const rect = e.currentTarget.getBoundingClientRect();
      const normX = (rect.left + rect.width / 2) / window.innerWidth;
      const normY = 1 - (rect.top + rect.height / 2) / window.innerHeight;

      triggerFluidSplat({
        x: normX,
        y: normY,
        hexColor: "#3b82f6",
        count: 4,
        radius: 0.005,
        velocity: 800,
      });
    }

    if (rest.onClick) {
      rest.onClick(e);
    }
  };

  return (
    <Tag
      className={`avatar ${className} ${isBopped ? "avatar-bop" : ""}`}
      onClick={handleClick}
      {...rest}
    >
      {isHero && <div className="avatar-ambient-glow" aria-hidden="true" />}
      {photo ? (
        <img
          src={photo}
          alt={DATA.name}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="initial">
          {DATA.name?.[0] || "P"}
        </span>
      )}

    </Tag>
  );
}
