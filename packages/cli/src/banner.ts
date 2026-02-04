import chalk from "chalk";

const SENDAI_ASCII = [
  "  ███████╗███████╗███╗   ██╗██████╗  █████╗ ██╗",
  "  ██╔════╝██╔════╝████╗  ██║██╔══██╗██╔══██╗██║",
  "  ███████╗█████╗  ██╔██╗ ██║██║  ██║███████║██║",
  "  ╚════██║██╔══╝  ██║╚██╗██║██║  ██║██╔══██║██║",
  "  ███████║███████╗██║ ╚████║██████╔╝██║  ██║██║",
  "  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝",
];

const BANNER_WIDTH = SENDAI_ASCII[0].length;
const ANIMATION_DURATION_MS = 2500;
const FRAME_RATE_MS = 50;
const TOTAL_FRAMES = ANIMATION_DURATION_MS / FRAME_RATE_MS;

// Color gradient from dim to bright (cyan theme)
const getColorForPosition = (pos: number, revealPos: number): string => {
  const distance = revealPos - pos;
  if (pos > revealPos) {
    return "hidden";
  }
  // Gradient based on distance from reveal position
  if (distance <= 2) {
    return "bright";
  } else if (distance <= 5) {
    return "medium";
  } else if (distance <= 10) {
    return "dim";
  }
  return "full";
};

const colorChar = (char: string, colorType: string): string => {
  if (char === " " || char === "\n") return char;
  switch (colorType) {
    case "hidden":
      return " ";
    case "bright":
      return chalk.whiteBright(char);
    case "medium":
      return chalk.cyan(char);
    case "dim":
      return chalk.blue(char);
    case "full":
      return chalk.cyanBright(char);
    default:
      return char;
  }
};

const renderFrame = (revealPosition: number): string => {
  return SENDAI_ASCII.map((line) => {
    let coloredLine = "";
    for (let i = 0; i < line.length; i++) {
      const colorType = getColorForPosition(i, revealPosition);
      coloredLine += colorChar(line[i], colorType);
    }
    return coloredLine;
  }).join("\n");
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const clearLines = (count: number): void => {
  for (let i = 0; i < count; i++) {
    process.stdout.write("\x1b[1A"); // Move cursor up
    process.stdout.write("\x1b[2K"); // Clear line
  }
};

export const showAsciiBanner = async (): Promise<void> => {
  const isTTY = process.stdout.isTTY;

  // If not a TTY (e.g., piped output), just show the static banner
  if (!isTTY) {
    console.log(chalk.cyanBright(SENDAI_ASCII.join("\n")));
    console.log();
    return;
  }

  // Hide cursor during animation
  process.stdout.write("\x1b[?25l");

  const lineCount = SENDAI_ASCII.length;

  try {
    // Initial empty space
    console.log("\n".repeat(lineCount));
    clearLines(lineCount);

    // Animation loop - left to right fade
    for (let frame = 0; frame <= TOTAL_FRAMES; frame++) {
      const progress = frame / TOTAL_FRAMES;
      // Add extra positions to fully reveal and settle
      const revealPosition = Math.floor(progress * (BANNER_WIDTH + 15));

      const frameContent = renderFrame(revealPosition);
      console.log(frameContent);

      await sleep(FRAME_RATE_MS);

      if (frame < TOTAL_FRAMES) {
        clearLines(lineCount);
      }
    }

    // Final static frame with full color
    clearLines(lineCount);
    console.log(chalk.cyanBright(SENDAI_ASCII.join("\n")));
    console.log();
  } finally {
    // Show cursor again
    process.stdout.write("\x1b[?25h");
  }
};

export const showStaticBanner = (): void => {
  console.log(chalk.cyanBright(SENDAI_ASCII.join("\n")));
  console.log();
};
