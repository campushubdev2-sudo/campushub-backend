// src/utils/log.util.js
import path from "path";

const log = (...data) => {
  const stack = new Error().stack.split("\n").slice(1);
  const callerLine = stack.find(
    (line) =>
      !line.includes("log.util.js") &&
      !line.includes("node:internal") &&
      line.includes(":"),
  );

  const match = callerLine?.match(/(?:at\s+)?(?:\((.*)\)|(\S+)):\d+:\d+$/);
  let filePath = (match?.[1] || match?.[2] || "")?.replace("file:///", "");

  // Dynamically make the path relative to your project root
  if (filePath !== "unknown") {
    // path.relative compares the current directory to the file path
    filePath = path.relative(process.cwd(), filePath);
  }

  // \x1b[36m = Cyan, \x1b[0m = Reset
  console.log(`\x1b[36m[${filePath}]\x1b[0m`, ...data);
};

export default log;
