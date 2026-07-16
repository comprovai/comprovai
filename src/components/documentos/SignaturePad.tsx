"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface SignaturePadHandle {
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<SignaturePadHandle>(function SignaturePad(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [vazio, setVazio] = useState(true);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => (vazio ? null : (canvasRef.current?.toDataURL("image/png") ?? null)),
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setVazio(true);
    },
    isEmpty: () => vazio,
  }));

  function posicao(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function iniciar(e: React.PointerEvent<HTMLCanvasElement>) {
    desenhando.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = posicao(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function desenhar(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = posicao(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#212771";
    ctx.lineTo(x, y);
    ctx.stroke();
    setVazio(false);
  }

  function parar() {
    desenhando.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={150}
      className="w-full touch-none rounded border border-border-default bg-surface"
      onPointerDown={iniciar}
      onPointerMove={desenhar}
      onPointerUp={parar}
      onPointerLeave={parar}
    />
  );
});
