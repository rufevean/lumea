async function loadProjects() {
    const res = await fetch('/projects');
    const projects = await res.json();
    const dropdown = document.getElementById('project-dropdown');

    dropdown.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        dropdown.appendChild(option);
    });
}

async function createProject() {
    const name = prompt("Enter project name:");
    if (!name) return;
    
    const res = await fetch('/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    if (res.ok) loadProjects();
    else alert("Error creating project!");
}

async function loadProject(name) {
    if (!name) return;
    const res = await fetch(`/project/${name}`);
    if (!res.ok) return alert("Project not found!");

    const data = await res.json();
    document.getElementById('editor').value = data.markdown;
    document.getElementById('editor').dataset.project = name;
    updatePreview();
}

async function renameProject() {
    const oldName = document.getElementById('editor').dataset.project;
    if (!oldName) return alert("No project selected!");

    const newName = prompt("Enter new project name:", oldName);
    if (!newName || newName === oldName) return;

    const res = await fetch('/rename-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName })
    });

    if (res.ok) loadProjects();
    else alert("Error renaming project!");
}

async function deleteProject() {
    const name = document.getElementById('editor').dataset.project;
    if (!name) return alert("No project selected!");
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const res = await fetch('/delete-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    if (res.ok) {
        document.getElementById('editor').value = "";
        document.getElementById('editor').dataset.project = "";
        loadProjects();
    } else alert("Error deleting project!");
}

async function saveProject() {
    const name = document.getElementById('editor').dataset.project;
    if (!name) return;

    const markdown = document.getElementById('editor').value;
    await fetch('/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, markdown })
    });
}

function updatePreview() {
    const content = document.getElementById('editor').value;
    fetch('/render-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    }).then(res => res.text()).then(html => {
        document.getElementById('preview').innerHTML = html;
    });
}

document.getElementById('editor').addEventListener('input', saveProject);
loadProjects();
