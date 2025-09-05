import { brightCyan, brightWhite, cyan, underline } from "@std/fmt/colors";

export function createWaveAnimation(
  text: string,
  filePath: string,
): { start: () => void; stop: () => void } {
  const DEFAULT_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const textPart = ` ${text} `;
  const fileNameStartPos = textPart.length;
  const totalLength = textPart.length + filePath.length;
  let intervalId: number | null = null;
  let frame = 0;

  const animate = () => {
    const spinnerChar = DEFAULT_SPINNER[frame % DEFAULT_SPINNER.length];
    const waveWidth = 4;
    const wavePosition = (frame * 0.8) % (totalLength + waveWidth);

    // Spinner with cyan color, bright cyan in wave range
    const spinnerDistance = Math.abs(0 - wavePosition);
    let coloredText = "";
    if (spinnerDistance < waveWidth) {
      coloredText = brightCyan(spinnerChar);
    } else {
      coloredText = cyan(spinnerChar);
    }

    // Apply wave effect to text part
    for (let i = 0; i < textPart.length; i++) {
      const distance = Math.abs(i - wavePosition);
      if (distance < waveWidth) {
        coloredText += brightWhite(textPart[i]);
      } else {
        coloredText += textPart[i];
      }
    }

    // Apply wave effect to filename with underline
    for (let i = 0; i < filePath.length; i++) {
      const globalPos = fileNameStartPos + i;
      const distance = Math.abs(globalPos - wavePosition);
      if (distance < waveWidth) {
        coloredText += underline(brightWhite(filePath[i]));
      } else {
        coloredText += underline(filePath[i]);
      }
    }

    const encoder = new TextEncoder();
    Deno.stderr.writeSync(encoder.encode(`\r${coloredText}`));
    frame++;
  };

  return {
    start: () => {
      if (!intervalId) {
        intervalId = setInterval(animate, 40);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        const encoder = new TextEncoder();
        Deno.stderr.writeSync(
          encoder.encode(`\r${" ".repeat(totalLength + 2)}\r`),
        );
      }
    },
  };
}
