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

// Search
let searchTimer;
searchInput.addEventListener('input', () => {clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (!q) {
        applyFilter();
        return;
    }
    searchTimer = setTimeout(() => fetchSearch(q), 400);
});

async function fetchSearch(q) {
    showLoading();
    try {
        const res  = await fetch(`${API_BASE}/issues/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        renderCards(json.data || []);
    } catch (err) {
        console.error('Search error:', err);
        renderCards([]);
    } finally {
        hideLoading();
    }
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


// ── LOADING HELPERS ──
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
        'help-wanted':      '<i class="fa-solid fa-life-ring"></i> ',
        'enhancement':      '<i class="fa-solid fa-star"></i> ',
        'documentation':    '<i class="fa-solid fa-book"></i> ',
        'question':         '<i class="fa-solid fa-question"></i> ',
        'good-first-issue': '<i class="fa-solid fa-seedling"></i> ',
    };
    return icons[slug] || '';
}

// Show Card Details
async function openPanel(issue) {
    populatePanel(issue);
    issuePanel.show();

    // Fetch single issue for full detail
    try {
        const res  = await fetch(`${API_BASE}/issue/${issue.id}`);
        const json = await res.json();
        if (json.data && json.data.id) {
            populatePanel(json.data);
        }
    } catch (err) {
        console.error('Failed to load issue detail:', err);
    }
}

function populatePanel(issue) {
    const isOpen= issue.status === 'open';
    const priority= (issue.priority || '').toLowerCase();
    const labels= issue.labels || [];
    const date= issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })  : '';

    // Title
    document.getElementById('panelTitle').textContent = issue.title || '';

    // Status badge
    const badge = document.getElementById('panelStatusBadge');
    badge.className = `panel-status-badge ${isOpen ? 'open' : 'closed'}`;
    badge.textContent = isOpen ? 'Opened' : 'Closed';

    // Author — "Opened by author"
    document.getElementById('panelAuthor').textContent =
        `${isOpen ? 'Opened' : 'Closed'} by ${escHtml(formatDisplayName(issue.author) || 'Unknown')}`;

    // Date
    document.getElementById('panelDate').textContent = date;

    // Labels
    document.getElementById('panelLabels').innerHTML =
        labels.map(l => labelBadge(l)).join('');

    // Description
    document.getElementById('panelDescription').textContent =
        issue.description || 'No description provided.';

    // Assignee
    document.getElementById('panelAssignee').textContent =
        issue.assignee ? formatDisplayName(issue.author) : 'Unassigned';

    // Priority
    const prioEl = document.getElementById('panelPriority');
    prioEl.textContent = priority ? priority.toUpperCase() : '—';
    prioEl.className   = `priority-badge priority-${priority || 'low'}`;
}

function openIcon() {
    return `<img src="../assets/Open-Status.png">`;
}

function closedIcon() {
    return `<img src="../assets/Closed-Status.png">`;
}

function formatDisplayName(name) {
    if (!name) return 'Unknown';
    return name
        .replace(/[_-]/g, ' ')           // Replace underscores/dashes with spaces
        .split(' ')                      // Split into words
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )                                // Capitalize each word
        .join(' ');                      // Rejoin with spaces
}


// New Issue
document.getElementById('newIssueBtn').addEventListener('click', () => {
    console.log('New Issue clicked');
});

loadIssues();