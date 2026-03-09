// API Endpoint
const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

// State
let allIssues = [];
let currentFilter = 'all';

// Dom References
const issuesGrid     = document.getElementById('issuesGrid');
const issueCount     = document.getElementById('issueCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState     = document.getElementById('emptyState');
const searchInput    = document.getElementById('searchInput');
const issuePanel      = document.getElementById('issuePanel');

// Filter Tabs
const tabButton = document.querySelectorAll('.tab-btn');
tabButton.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButton.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        currentFilter = btn.dataset.filter;
        // clear search when switching tabs
        searchInput.value = '';
        applyFilter();
    });
});

function applyFilter() {
    let filtered = allIssues;
    if (currentFilter === 'open')   filtered = allIssues.filter(i => i.status === 'open');
    if (currentFilter === 'closed') filtered = allIssues.filter(i => i.status === 'closed');
    renderCards(filtered);
}

// Load Issues
async function loadIssues() {
    showLoading();
    try {
        const res  = await fetch(`${API_BASE}/issues`);
        const json = await res.json();
        allIssues = json.data || [];
        applyFilter();
    } catch (err) {
        console.error('Failed to load issues:', err);
        allIssues = [];
        applyFilter();
    } finally {
        hideLoading();
    }
}

// Render Card
function renderCards(issues) {
    issueCount.textContent = `${issues.length} Issues`;
    issuesGrid.innerHTML   = '';

    if (issues.length === 0) {
        issuesGrid.style.display  = 'none';
        emptyState.style.display  = 'flex';
        return;
    }

    emptyState.style.display = 'none';
    issuesGrid.style.display = 'grid';
    issues.forEach(issue => issuesGrid.appendChild(buildCard(issue)));
}

// View Card
function buildCard(issue) {
    const isOpen= issue.status === 'open';
    const priority= (issue.priority || '').toLowerCase();
    const labels= issue.labels || [];
    const date= issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-US') : '';

    const card = document.createElement('div');
    card.className = `issue-card ${isOpen ? 'open' : 'closed'}`;
    card.addEventListener('click', () => openPanel(issue));

    card.innerHTML =
        `
        <div class="card-top-row">
            <div class="card-status-icon">
                ${isOpen ? openIcon() : closedIcon()}
            </div>
            ${priority ? `<span class="card-priority priority-${priority}">${priority}</span>` : ''}
        </div>

        <p class="card-title">${escHtml(issue.title || 'Untitled')}</p>

        <p class="card-desc">${escHtml(truncate(issue.description || '', 100))}</p>

        ${labels.length ? `<div class="card-labels">${labels.map(l => labelBadge(l)).join('')}</div>` : ''}

        <div class="card-footer">
            <p class="card-meta-text"># ${issue.id} by ${escHtml(issue.author || 'unknown')}</p>
            ${date ? `<p class="card-meta-text">${date}</p>` : ''}
        </div>
        `;
    return card;
}


// Loading Helper
function showLoading() {
    loadingSpinner.style.display = 'flex';
    issuesGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Utility
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + '…' : str;
}

function labelBadge(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const known = ['bug','help-wanted','enhancement','documentation','question','duplicate','wontfix','invalid','good-first-issue'];
    const cls   = known.includes(slug) ? `label-${slug}` : 'label-default';
    return `<span class="card-label ${cls}">${labelIcon(slug)}${escHtml(name)}</span>`;
}

function labelIcon(slug) {
    const icons = {
        'bug':              '<i class="fa-solid fa-bug"></i> ',
        'help-wanted':      '<i class="fa-regular fa-handshake"></i> ',
        'enhancement':      '<i class="fa-solid fa-star"></i> ',
        'documentation':    '<i class="fa-solid fa-book"></i> ',
        'question':         '<i class="fa-solid fa-question"></i> ',
        'good-first-issue': '<i class="fa-solid fa-seedling"></i> ',
    };
    return icons[slug] || '';
}

function openIcon() {
    return `<img src="../assets/Open-Status.png">`;
}

function closedIcon() {
    return `<img src="../assets/Closed-Status.png">`;
}

// New Issue
document.getElementById('newIssueBtn').addEventListener('click', () => {
    console.log('New Issue clicked');
});

loadIssues();