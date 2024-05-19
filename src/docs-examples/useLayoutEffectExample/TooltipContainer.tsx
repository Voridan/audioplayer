export default function TooltipContainer({
  children,
  x,
  y,
  contentRef,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    >
      <div ref={contentRef} className='tooltip'>
        {children}
      </div>
    </div>
  );
}
