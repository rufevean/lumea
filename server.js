const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const marked = require('marked');

const app = express();
const PORT = 3000;
const PROJECTS_DIR = path.join(__dirname, 'projects');
const CHECKLIST_PATH = path.join(__dirname, 'checklist.md');

if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR);
}

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Get all projects
app.get('/projects', (req, res) => {
    fs.readdir(PROJECTS_DIR, (err, files) => {
        if (err) return res.status(500).send("Error reading projects");
        res.json(files.map(f => f.replace('.md', '')));
    });
});

// Get project data
app.get('/project/:name', (req, res) => {
    const filePath = path.join(PROJECTS_DIR, req.params.name + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).send("Project not found");

    const markdown = fs.readFileSync(filePath, 'utf8');
    res.json({ markdown });
});

// Create new project (copy from checklist.md)
app.post('/create-project', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid project name");

    const filePath = path.join(PROJECTS_DIR, name + '.md');
    if (fs.existsSync(filePath)) return res.status(400).send("Project already exists");

    const checklistContent = fs.existsSync(CHECKLIST_PATH)
        ? fs.readFileSync(CHECKLIST_PATH, 'utf8')
        : "# Default Checklist\n\n- [ ] Task 1\n- [ ] Task 2\n";

    fs.writeFileSync(filePath, checklistContent, 'utf8');
    res.sendStatus(201);
});

// Rename project
app.post('/rename-project', (req, res) => {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).send("Invalid project names");

    const oldPath = path.join(PROJECTS_DIR, oldName + '.md');
    const newPath = path.join(PROJECTS_DIR, newName + '.md');

    if (!fs.existsSync(oldPath)) return res.status(404).send("Project not found");
    if (fs.existsSync(newPath)) return res.status(400).send("New name already exists");

    fs.renameSync(oldPath, newPath);
    res.sendStatus(200);
});

// Delete project
app.post('/delete-project', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid project name");

    const filePath = path.join(PROJECTS_DIR, name + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).send("Project not found");

    fs.unlinkSync(filePath);
    res.sendStatus(200);
});

// Save project content
app.post('/save-project', (req, res) => {
    const { name, markdown } = req.body;
    if (!name || markdown === undefined) return res.status(400).send("Invalid data");

    const filePath = path.join(PROJECTS_DIR, name + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).send("Project not found");

    fs.writeFileSync(filePath, markdown, 'utf8');
    res.sendStatus(200);
});

// Render Markdown
app.post('/render-markdown', (req, res) => {
    const { content } = req.body;
    res.send(marked.parse(content));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Lumea is running at http://localhost:${PORT}`);
});

