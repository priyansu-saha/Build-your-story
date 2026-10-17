import FluidCursor from "./FluidCursor";

export default function Background({ hidden }) {
  return (
    <div className="bg" aria-hidden="true">
      <FluidCursor active={!hidden} />
    </div>
  );
}
