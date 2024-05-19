import { useState, useRef } from 'react';
import TooltipMain from './TooltipMain.tsx';

interface ButtonWithTooltipProps {
  tooltipContent: React.ReactNode;
  children?: React.ReactNode;
}

export interface TargetRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  tooltipContent,
  ...rest
}: ButtonWithTooltipProps): JSX.Element => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        {...rest}
        ref={buttonRef}
        onPointerEnter={() => {
          const rect = buttonRef.current?.getBoundingClientRect();
          rect &&
            setTargetRect({
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
            });
        }}
        onPointerLeave={() => {
          setTargetRect(null);
        }}
      />
      {targetRect !== null && (
        <TooltipMain targetRect={targetRect}>{tooltipContent}</TooltipMain>
      )}
    </>
  );
};

export default ButtonWithTooltip;
