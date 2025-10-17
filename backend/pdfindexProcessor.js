import { runPythonJson } from "./helpers.js";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VENV_PY = path.resolve(__dirname, "../parse_trials/.venv/bin/python3");
const PARSER = path.resolve(__dirname, "./python_helpers/parse.py");

// Fetches the index page (assumed page 1) from the PDF
async function fetchIndexPage(pdfPath) {
  try {
    // Run parse.py with a flag to extract only the first page
    // Assuming parse.py supports a page range or single-page option; adjust if needed
    const parsed = await runPythonJson(VENV_PY, [PARSER, pdfPath, "--page", "1"]);
    if (!parsed || !parsed.length || !parsed[0].text) {
      throw new Error("No text found on index page");
    }
    return parsed[0].text; // Return the text of the first page
  } catch (error) {
    console.error("Error fetching index page:", error);
    throw new Error("Failed to extract index page from PDF");
  }
}

// Extracts topic-to-page map using Grok's multimodal LLM
async function extractTopicPageMap(indexPageText) {
  try {
    // Placeholder for Grok multimodal LLM API call
    // Replace with actual xAI API endpoint and authentication
    const response = await axios.post(
      "https://api.x.ai/grok/multimodal", // Update with actual endpoint
      {
        text: indexPageText,
        prompt: "Extract a JSON object mapping topics to page numbers from the provided index page text. Format: {\"topic\": page_num, ...}. Ensure topics are exact matches to section titles in the index.",
      },
      {
        headers: {
          Authorization: "Bearer YOUR_XAI_API_KEY", // Replace with actual API key
          "Content-Type": "application/json",
        },
      }
    );

    const topicPageMap = response.data.result; // Adjust based on actual API response structure
    if (!topicPageMap || typeof topicPageMap !== "object") {
      throw new Error("Invalid topic-to-page map returned from LLM");
    }
    return topicPageMap;
  } catch (error) {
    console.error("Error extracting topic-page map:", error);
    throw new Error("Failed to process index page with LLM");
  }
}

export { fetchIndexPage, extractTopicPageMap };