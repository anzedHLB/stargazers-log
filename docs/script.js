const FALLBACK_REPOS = [
  {
    owner: 'microsoft',
    name: 'vscode',
    description: 'Visual Studio Code — a lightweight but powerful source code editor.',
    language: 'TypeScript',
    tag: 'frontend',
    stars: 210000,
    forks: 26000,
    issues: 2600,
    url: 'https://github.com/microsoft/vscode',
    date: '2026-09-12',
  },
  {
    owner: 'vercel',
    name: 'next.js',
    description: 'The React framework for building full-stack web applications.',
    language: 'JavaScript',
    tag: 'frontend',
    stars: 150000,
    forks: 32000,
    issues: 5400,
    url: 'https://github.com/vercel/next.js',
    date: '2026-08-27',
  },
  {
    owner: 'tailwindlabs',
    name: 'tailwindcss',
    description: 'A utility-first CSS framework for rapidly building custom designs.',
    language: 'CSS',
    tag: 'frontend',
    stars: 84000,
    forks: 4900,
    issues: 260,
    url: 'https://github.com/tailwindlabs/tailwindcss',
    date: '2026-08-09',
  },
  {
    owner: 'nodejs',
    name: 'node',
    description: 'Node.js JavaScript runtime built on Chrome V8 engine.',
    language: 'JavaScript',
    tag: 'backend',
    stars: 120000,
    forks: 34000,
    issues: 1900,
    url: 'https://github.com/nodejs/node',
    date: '2026-07-18',
  },
  {
    owner: 'facebook',
    name: 'react',
    description: 'A library for building user interfaces with declarative components.',
    language: 'JavaScript',
    tag: 'learning',
    stars: 230000,
    forks: 48000,
    issues: 4300,
    url: 'https://github.com/facebook/react',
    date: '2026-06-30',
  },
  {
    owner: 'python',
    name: 'cpython',
    description: 'The Python programming language and standard library implementation.',
    language: 'Python',
    tag: 'learning',
    stars: 66000,
    forks: 19000,
    issues: 850,
    url: 'https://github.com/python/cpython',
    date: '2026-06-04',
  },
];

const STORAGE_KEY = 'stargazers-log-repos';
const repoList = document.querySelector('#repo-list');
const template = document.querySelector('#repo-card-template');
const searchInput = document.querySelector('#repo-search');
const repoCount = document.querySelector('#repo-count');
const languageCount = document.querySelector('#language-count');
const resultsLabel = document.querySelector('#results-label');
const statusMessage = document.querySelector('#status-message');
const usernameInput = document.querySelector('#github-username');
const refreshButton = document.querySelector('#refresh-repos');
const sortSelect = document.querySelector('#sort-select');
const tagFilter = document.querySelector('#tag-filter');
const addModal = document.querySelector('#add-repo-modal');
const editModal = document.querySelector('#edit-repo-modal');
const repoForm = document.querySelector('#repo-form');
const editRepoForm = document.querySelector('#edit-repo-form');
const openModalButton = document.querySelector('#open-add-modal');
const closeAddModalButton = document.querySelector('#close-add-modal');
const cancelAddRepoButton = document.querySelector('#cancel-add-repo');
const closeEditModalButton = document.querySelector('#close-edit-modal');
const cancelEditRepoButton = document.querySelector('#cancel-edit-repo');

let allRepos = [...FALLBACK_REPOS];

function saveCustomRepos(repos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

function getCustomRepos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatDate(dateString) {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getUniqueLanguages(repos) {
  const languages = new Set(
    repos
      .filter((repo) => repo.language && repo.language.trim())
      .map((repo) => repo.language.trim())
  );

  return languages.size;
}

function sortRepos(items) {
  const sortValue = sortSelect.value;
  const sorted = [...items];

  switch (sortValue) {
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'language-asc':
      sorted.sort((a, b) => (a.language || '').localeCompare(b.language || ''));
      break;
    case 'date-desc':
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }

  return sorted;
}

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedTag = tagFilter.value;

  let filtered = allRepos.filter((repo) => {
    const matchesQuery =
      !query ||
      `${repo.owner} ${repo.name} ${repo.description || ''} ${repo.language || ''}`
        .toLowerCase()
        .includes(query);

    const matchesTag = selectedTag === 'all' || repo.tag === selectedTag;
    return matchesQuery && matchesTag;
  });

  return sortRepos(filtered);
}

function renderRepos(items) {
  repoList.innerHTML = '';

  items.forEach((repo) => {
    const card = template.content.cloneNode(true);
    card.querySelector('.repo-owner').textContent = repo.owner;
    card.querySelector('.repo-name').textContent = repo.name;
    card.querySelector('.repo-description').textContent =
      repo.description || 'No description provided.';
    card.querySelector('.language-name').textContent = repo.language || 'Unknown';
    card.querySelector('.repo-tag').textContent = repo.tag || 'general';
    card.querySelector('.repo-date').textContent = formatDate(repo.date);
    card.querySelector('.repo-stars').textContent = formatNumber(repo.stars || 0);
    card.querySelector('.repo-forks').textContent = formatNumber(repo.forks || 0);
    card.querySelector('.repo-issues').textContent = formatNumber(repo.issues || 0);

    const repoLink = card.querySelector('.repo-link');
    const repoUrl = repo.url || `https://github.com/${repo.owner}/${repo.name}`;
    repoLink.href = repoUrl;

    const deleteButton = card.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => deleteRepo(repo));

    const editButton = card.querySelector('.edit-btn');
    editButton.addEventListener('click', () => openEditModal(repo));

    repoList.appendChild(card);
  });

  const count = items.length;
  repoCount.textContent = String(count);
  languageCount.textContent = String(getUniqueLanguages(items));
  resultsLabel.textContent = `${count} result${count === 1 ? '' : 's'}`;
}

function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#fca5a5' : '#a6b2c8';
}

function normalizeRepo(repo) {
  return {
    owner: repo.owner.login || repo.owner,
    name: repo.name,
    description: repo.description || 'No description provided.',
    language: repo.language || 'Unknown',
    tag: repo.tag || 'learning',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    issues: repo.open_issues_count || 0,
    url: repo.html_url || `https://github.com/${repo.owner.login || repo.owner}/${repo.name}`,
    date: repo.pushed_at || repo.updated_at || repo.created_at || new Date().toISOString(),
  };
}

function getRepoKey(repo) {
  return `${repo.owner.toLowerCase()}/${repo.name.toLowerCase()}`;
}

function deleteRepo(repo) {
  const customRepos = getCustomRepos();
  const filtered = customRepos.filter(
    (entry) => getRepoKey(entry) !== getRepoKey(repo)
  );
  saveCustomRepos(filtered);

  allRepos = allRepos.filter((entry) => getRepoKey(entry) !== getRepoKey(repo));
  renderRepos(applyFilters());
  updateStatus(`Deleted ${repo.owner}/${repo.name}.`);
}

function openEditModal(repo) {
  editRepoForm.elements.repoKey.value = getRepoKey(repo);
  editRepoForm.elements.owner.value = repo.owner;
  editRepoForm.elements.name.value = repo.name;
  editRepoForm.elements.description.value = repo.description || '';
  editRepoForm.elements.language.value = repo.language || '';
  editRepoForm.elements.date.value = repo.date ? new Date(repo.date).toISOString().slice(0, 10) : '';
  editRepoForm.elements.tag.value = repo.tag || 'learning';

  editModal.classList.remove('hidden');
  editModal.setAttribute('aria-hidden', 'false');
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editModal.setAttribute('aria-hidden', 'true');
  editRepoForm.reset();
}

function updateRepo(event) {
  event.preventDefault();

  const formData = new FormData(editRepoForm);
  const repoKey = String(formData.get('repoKey') || '').trim();
  const owner = String(formData.get('owner') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const language = String(formData.get('language') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const tag = String(formData.get('tag') || 'learning').trim();

  if (!repoKey || !owner || !name) {
    updateStatus('Owner and repository name are required.', true);
    return;
  }

  const updatedRepo = {
    owner,
    name,
    description: description || 'Added manually to your log.',
    language: language || 'Custom',
    tag,
    stars: 0,
    forks: 0,
    issues: 0,
    url: `https://github.com/${owner}/${name}`,
    date: date || new Date().toISOString(),
  };

  const customRepos = getCustomRepos();
  const nextCustomRepos = customRepos.map((repo) =>
    getRepoKey(repo) === repoKey ? updatedRepo : repo
  );
  saveCustomRepos(nextCustomRepos);

  allRepos = allRepos.map((repo) =>
    getRepoKey(repo) === repoKey ? { ...repo, ...updatedRepo } : repo
  );

  renderRepos(applyFilters());
  updateStatus(`Updated ${owner}/${name}.`);
  closeEditModal();
}

async function fetchStarredRepos(username) {
  if (!username || !username.trim()) {
    updateStatus('Please enter a valid GitHub username.', true);
    return;
  }

  updateStatus('Loading starred repositories...');

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=100`);

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const payload = await response.json();
    const fetchedRepos = Array.isArray(payload) ? payload.map((repo) => normalizeRepo(repo)) : [];
    const customRepos = getCustomRepos();

    allRepos = [...fetchedRepos.map((repo) => ({ ...repo, tag: repo.tag || 'learning' })), ...customRepos];
    renderRepos(applyFilters());
    updateStatus(`Loaded ${fetchedRepos.length} starred repos for ${username}.`);
  } catch (error) {
    const customRepos = getCustomRepos();
    allRepos = [...FALLBACK_REPOS, ...customRepos];
    renderRepos(applyFilters());
    updateStatus('Could not load live data, showing fallback repos instead.', true);
  }
}

function openAddModal() {
  addModal.classList.remove('hidden');
  addModal.setAttribute('aria-hidden', 'false');
}

function closeAddModal() {
  addModal.classList.add('hidden');
  addModal.setAttribute('aria-hidden', 'true');
  repoForm.reset();
}

function addCustomRepo(event) {
  event.preventDefault();

  const formData = new FormData(repoForm);
  const owner = String(formData.get('owner') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const language = String(formData.get('language') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const tag = String(formData.get('tag') || 'learning').trim();

  if (!owner || !name) {
    updateStatus('Owner and repository name are required.', true);
    return;
  }

  const customRepo = {
    owner,
    name,
    description: description || 'Added manually to your log.',
    language: language || 'Custom',
    tag,
    stars: 0,
    forks: 0,
    issues: 0,
    url: `https://github.com/${owner}/${name}`,
    date: date || new Date().toISOString(),
  };

  const existing = getCustomRepos();
  const updated = [customRepo, ...existing];
  saveCustomRepos(updated);

  allRepos = [...allRepos.filter((repo) => !(repo.owner === owner && repo.name === name)), ...updated];
  renderRepos(applyFilters());
  updateStatus(`Saved ${owner}/${name} to your list.`);
  closeAddModal();
}

searchInput.addEventListener('input', () => {
  renderRepos(applyFilters());
});

sortSelect.addEventListener('change', () => {
  renderRepos(applyFilters());
});

tagFilter.addEventListener('change', () => {
  renderRepos(applyFilters());
});

refreshButton.addEventListener('click', () => {
  fetchStarredRepos(usernameInput.value);
});

openModalButton.addEventListener('click', openAddModal);
closeAddModalButton.addEventListener('click', closeAddModal);
cancelAddRepoButton.addEventListener('click', closeAddModal);
addModal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') {
    closeAddModal();
  }
});

closeEditModalButton.addEventListener('click', closeEditModal);
cancelEditRepoButton.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') {
    closeEditModal();
  }
});

repoForm.addEventListener('submit', addCustomRepo);
editRepoForm.addEventListener('submit', updateRepo);

window.addEventListener('DOMContentLoaded', () => {
  const customRepos = getCustomRepos();
  allRepos = [...FALLBACK_REPOS, ...customRepos];
  renderRepos(applyFilters());
  fetchStarredRepos(usernameInput.value);
});
