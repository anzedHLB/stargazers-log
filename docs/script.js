const repositories = [
  {
    owner: 'microsoft',
    name: 'vscode',
    description: 'Visual Studio Code — a lightweight but powerful source code editor.',
    language: 'TypeScript',
    date: '2026-09-12',
  },
  {
    owner: 'vercel',
    name: 'next.js',
    description: 'The React framework for building full-stack web applications.',
    language: 'JavaScript',
    date: '2026-08-27',
  },
  {
    owner: 'tailwindlabs',
    name: 'tailwindcss',
    description: 'A utility-first CSS framework for rapidly building custom designs.',
    language: 'CSS',
    date: '2026-08-09',
  },
  {
    owner: 'nodejs',
    name: 'node',
    description: 'Node.js JavaScript runtime built on Chrome s V8 engine.',
    language: 'JavaScript',
    date: '2026-07-18',
  },
  {
    owner: 'facebook',
    name: 'react',
    description: 'A library for building user interfaces with declarative components.',
    language: 'JavaScript',
    date: '2026-06-30',
  },
  {
    owner: 'python',
    name: 'cpython',
    description: 'The Python programming language and standard library implementation.',
    language: 'Python',
    date: '2026-06-04',
  },
];

const repoList = document.querySelector('#repo-list');
const template = document.querySelector('#repo-card-template');
const searchInput = document.querySelector('#repo-search');
const repoCount = document.querySelector('#repo-count');
const resultsLabel = document.querySelector('#results-label');

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function renderRepos(items) {
  repoList.innerHTML = '';

  items.forEach((repo) => {
    const card = template.content.cloneNode(true);

    card.querySelector('.repo-owner').textContent = repo.owner;
    card.querySelector('.repo-name').textContent = repo.name;
    card.querySelector('.repo-description').textContent = repo.description;
    card.querySelector('.language-name').textContent = repo.language;
    card.querySelector('.repo-date').textContent = formatDate(repo.date);

    repoList.appendChild(card);
  });

  const count = items.length;
  repoCount.textContent = String(count);
  resultsLabel.textContent = `${count} result${count === 1 ? '' : 's'}`;
}

function filterRepos(query) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return repositories;
  }

  return repositories.filter((repo) => {
    const haystack = `${repo.owner} ${repo.name} ${repo.description} ${repo.language}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

searchInput.addEventListener('input', (event) => {
  const filtered = filterRepos(event.target.value);
  renderRepos(filtered);
});

renderRepos(repositories);
