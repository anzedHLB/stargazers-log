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
const HIDDEN_REPOS_KEY = 'stargazers-log-hidden';
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
const modal = document.querySelector('#add-repo-modal');
const modalTitle = document.querySelector('#modal-title');
const repoForm = document.querySelector('#repo-form');
const submitButton = document.querySelector('#repo-form-submit');
const openModalButton = document.querySelector('#open-add-modal');
const closeModalButton = document.querySelector('#close-add-modal');
const cancelAddRepoButton = document.querySelector('#cancel-add-repo');

let allRepos = [...FALLBACK_REPOS];

function repoKey(owner, name) {
  return `${String(owner || '').trim().toLowerCase()}/${String(name || '').trim().toLowerCase()}`;
}

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

function saveHiddenRepos(keys) {
  localStorage.setItem(HIDDEN_REPOS_KEY, JSON.stringify(keys));
}

function getHiddenRepos() {
  try {
    const raw = localStorage.getItem(HIDDEN_REPOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function filterHiddenRepos(repos) {
  const hidden = new Set(getHiddenRepos());
  return repos.filter((repo) => !hidden.has(repoKey(repo.owner, repo.name)));
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

  let filtered = filterHiddenRepos(allRepos).filter((repo) => {
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
    const article = card.querySelector('.repo-card');
    article.dataset.owner = repo.owner;
    article.dataset.name = repo.name;

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

function writeRepoForm(repo = null, mode = 'add') {
  const formData = repo ? {
    owner: repo.owner || '',
    name: repo.name || '',
    description: repo.description || '',
    language: repo.language || '',
    date: repo.date ? repo.date.split('T')[0] : '',
    tag: repo.tag || 'learning',
  } : {
    owner: '',
    name: '',
    description: '',
    language: '',
    date: '',
    tag: 'learning',
  };

  repoForm.reset();
  repoForm.dataset.mode = mode;

  repoForm.elements.owner.value = formData.owner;
  repoForm.elements.name.value = formData.name;
  repoForm.elements.description.value = formData.description;
  repoForm.elements.language.value = formData.language;
  repoForm.elements.date.value = formData.date;
  repoForm.elements.tag.value = formData.tag;

  modalTitle.textContent = mode === 'edit' ? 'Edit repository' : 'Add repository';
  submitButton.textContent = mode === 'edit' ? 'Save changes' : 'Save repo';
}

function openModal(mode = 'add', repo = null) {
  writeRepoForm(repo, mode);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  repoForm.reset();
  repoForm.dataset.mode = 'add';
}

function upsertCustomRepo(repo) {
  const existing = getCustomRepos();
  const cleaned = existing.filter((item) => repoKey(item.owner, item.name) !== repoKey(repo.owner, repo.name));
  const updated = [repo, ...cleaned];
  saveCustomRepos(updated);
  return updated;
}

function removeHiddenRepoKey(key) {
  const current = new Set(getHiddenRepos());
  current.delete(key);
  saveHiddenRepos([...current]);
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

  const repo = {
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

  const mode = repoForm.dataset.mode || 'add';

  if (mode === 'edit') {
    upsertCustomRepo(repo);
    removeHiddenRepoKey(repoKey(owner, name));
    updateStatus(`Updated ${owner}/${name}.`);
  } else {
    const existing = getCustomRepos();
    const updated = [repo, ...existing];
    saveCustomRepos(updated);
    removeHiddenRepoKey(repoKey(owner, name));
    updateStatus(`Saved ${owner}/${name} to your list.`);
  }

  allRepos = [...allRepos.filter((item) => repoKey(item.owner, item.name) !== repoKey(owner, name)), repo];
  renderRepos(applyFilters());
  closeModal();
}

function handleRepoCardAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const card = button.closest('.repo-card');
  if (!card) {
    return;
  }

  const repo = {
    owner: card.dataset.owner,
    name: card.dataset.name,
  };

  const existing = allRepos.find((item) => repoKey(item.owner, item.name) === repoKey(repo.owner, repo.name));

  if (button.dataset.action === 'edit') {
    openModal('edit', existing || repo);
    return;
  }

  if (button.dataset.action === 'delete') {
    const hidden = new Set(getHiddenRepos());
    hidden.add(repoKey(repo.owner, repo.name));
    saveHiddenRepos([...hidden]);

    const custom = getCustomRepos().filter((item) => repoKey(item.owner, item.name) !== repoKey(repo.owner, repo.name));
    saveCustomRepos(custom);

    renderRepos(applyFilters());
    updateStatus(`Removed ${repo.owner}/${repo.name} from your log.`);
  }
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

openModalButton.addEventListener('click', () => openModal('add'));
closeModalButton.addEventListener('click', closeModal);
cancelAddRepoButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') {
    closeModal();
  }
});

repoList.addEventListener('click', handleRepoCardAction);
repoForm.addEventListener('submit', addCustomRepo);

window.addEventListener('DOMContentLoaded', () => {
  const customRepos = getCustomRepos();
  allRepos = [...FALLBACK_REPOS, ...customRepos];
  renderRepos(applyFilters());
  fetchStarredRepos(usernameInput.value);
});
