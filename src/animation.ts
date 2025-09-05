import { brightCyan, brightWhite, cyan } from "@std/fmt/colors";

export function createWaveAnimation(
  text: string,
  filePath: string,
): { start: () => void; stop: () => void } {
  const DEFAULT_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const fullText = ` ${text} ${filePath}`;
  let intervalId: number | null = null;
  let frame = 0;

  const animate = () => {
    const spinnerChar = DEFAULT_SPINNER[frame % DEFAULT_SPINNER.length];
    const waveWidth = 4;
    const wavePosition = (frame * 0.8) % (fullText.length + waveWidth);

    // Spinner with cyan color, bright cyan in wave range
    const spinnerDistance = Math.abs(0 - wavePosition);
    let coloredText = "";
    if (spinnerDistance < waveWidth) {
      coloredText = brightCyan(spinnerChar);
    } else {
      coloredText = cyan(spinnerChar);
    }

    for (let i = 0; i < fullText.length; i++) {
      const distance = Math.abs(i - wavePosition);

      if (distance < waveWidth) {
        // highlight with bright white
        coloredText += brightWhite(fullText[i]);
      } else {
        // default white color
        coloredText += fullText[i];
      }
    }

    const encoder = new TextEncoder();
    Deno.stdout.writeSync(encoder.encode(`\r${coloredText}`));
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
        Deno.stdout.writeSync(
          encoder.encode(`\r${" ".repeat(fullText.length + 2)}\r`),
        );
      }
    },
  };
}
