import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runPythonJson } from "./helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VENV_PY = path.resolve(__dirname, "../parse_trials/.venv/bin/python3");
const PARSER = path.resolve(__dirname, "./python_helpers/parse.py");

// Finds page content for given topics using the topic-to-page map
async function findPagesForTopics(pdfPath, topics, topicPageMap, pagesJsonPath) {
  try {
    // Load or parse the full PDF content
    let pages;
    if (fs.existsSync(pagesJsonPath)) {
      pages = JSON.parse(fs.readFileSync(pagesJsonPath, "utf8"));
    } else {
      pages = await runPythonJson(VENV_PY, [PARSER, pdfPath]);
      fs.writeFileSync(pagesJsonPath, JSON.stringify(pages, null, 2));
    }

    const results = {};
    for (const topic of topics) {
      const pageNum = topicPageMap[topic];
      if (pageNum && pages[pageNum - 1]) { // Page numbers are 1-based, array is 0-based
        results[topic] = {
          page: pageNum,
          content: pages[pageNum - 1].text, // Assuming parse.py outputs {text: "..."} per page
        };
      } else {
        results[topic] = {
          page: null,
          content: "Topic not found in index or page out of range",
        };
      }
    }
    return results;
  } catch (error) {
    console.error("Error finding pages for topics:", error);
    throw new Error("Failed to extract pages for topics");
  }
}

export { findPagesForTopics };