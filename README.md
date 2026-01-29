
# resume-bot

A web-based chatbot that answers questions about Julian Davies’ resume using OpenAI’s API. Users can interact with the bot through a simple web interface to get information, summaries, and insights from the resume.

## Features

- Embeds and indexes a resume for semantic search.
- Answers user questions using OpenAI’s language models.
- Friendly, positive, and context-aware responses.
- Simple web UI for chat interaction.

## Project Structure

- `server.js` – Express server, API endpoints, and static file serving.
- `embedResume.js` – Reads and embeds the resume using OpenAI embeddings.
- `queryResume.js` – Handles question answering using the embedded resume or full resume text.
- `public/index.html` – Frontend chat interface.
- `Julian Davies - Resume.txt` – The resume file.
- `package.json` – Project dependencies and scripts.

## Setup

1. **Clone the repository** and install dependencies:
	```
	npm install
	```

2. **Add your OpenAI API key** to a `.env` file:
	```
	OPENAI_API_KEY=your_openai_api_key_here
	```

3. **Start the server:**
	```
	node server.js
	```

4. **Open** `public/index.html` in your browser or visit the hosted URL if deployed.

## Usage

- Ask questions about Julian’s experience, skills, or qualifications.
- Use quick prompts for summaries or suitability checks.
- The bot responds using only the information in the resume.

## Notes

- The chatbot is a work in progress and may produce incomplete or imperfect answers.
- Only answers based on the provided resume context.
