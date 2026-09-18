const STORAGE_KEY = 'boss-kill-tracker-v1';
const defaultMapImage = null;

const bossNameInput = document.getElementById('bossName');
const mapEl = document.getElementById('map');
const eventListEl = document.getElementById('eventList');
const mapUploadEl = document.getElementById('mapUpload');
const addMarkerBtn = document.getElementById('addMarkerBtn');
const clearSelectedBtn = document.getElementById('clearSelectedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

const state = {
  markers: loadMarkers(),
  selectedId: null
};

function saveMarkers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.markers));
}

function loadMarkers() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function formatTime(isoString) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function renderEvents() {
  eventListEl.innerHTML = '';

  if (!state.markers.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No boss kills marked yet.';
    eventListEl.appendChild(empty);
    return;
  }

  state.markers
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((marker) => {
      const row = document.createElement('li');
      row.className = 'event-item';
      row.innerHTML = `
        <div class="event-meta">
          <span class="event-name">${marker.label}</span>
          <span class="event-time">${formatTime(marker.createdAt)}</span>
        </div>
        <button type="button" data-id="${marker.id}">Focus</button>
      `;

      const focusButton = row.querySelector('button');
      focusButton.addEventListener('click', () => {
        const target = document.querySelector(`.marker[data-id="${marker.id}"]`);
        if (!target) {
          return;
        }

        target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        target.classList.add('selected');
        state.selectedId = marker.id;
        setTimeout(() => target.classList.remove('selected'), 1200);
      });

      eventListEl.appendChild(row);
    });
}

function renderMarkers() {
  const existing = mapEl.querySelectorAll('.marker');
  existing.forEach((node) => node.remove());

  state.markers.forEach((marker) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'marker';
    node.dataset.id = marker.id;
    node.dataset.label = marker.label;
    node.style.left = `${marker.x}%`;
    node.style.top = `${marker.y}%`;
    node.setAttribute('aria-label', `${marker.label} killed here`);
    node.title = `${marker.label} killed here`;
    node.textContent = '';

    if (state.selectedId === marker.id) {
      node.classList.add('selected');
    }

    node.addEventListener('click', (event) => {
      event.stopPropagation();
      state.selectedId = marker.id;
      renderMarkers();
    });

    mapEl.appendChild(node);
  });
}

function addMarkerAt(xPercent, yPercent) {
  const label = bossNameInput.value.trim() || 'Completed';
  const newMarker = {
    id: crypto.randomUUID(),
    label,
    x: Math.min(Math.max(xPercent, 5), 95),
    y: Math.min(Math.max(yPercent, 5), 95),
    createdAt: new Date().toISOString()
  };

  state.selectedId = newMarker.id;
  state.markers.push(newMarker);
  saveMarkers();
  renderMarkers();
  renderEvents();
  bossNameInput.focus();
}

function removeSelectedMarker() {
  if (!state.selectedId) {
    return;
  }

  state.markers = state.markers.filter((marker) => marker.id !== state.selectedId);
  state.selectedId = null;
  saveMarkers();
  renderMarkers();
  renderEvents();
}

function clearAllMarkers() {
  if (!state.markers.length) {
    return;
  }

  const confirmed = window.confirm('Clear all boss kill markers on the map?');
  if (!confirmed) {
    return;
  }

  state.markers = [];
  state.selectedId = null;
  saveMarkers();
  renderMarkers();
  renderEvents();
}

mapEl.addEventListener('click', (event) => {
  if (event.target.closest('.marker')) {
    return;
  }

  const rect = mapEl.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  addMarkerAt(x, y);
});

addMarkerBtn.addEventListener('click', () => {
  const center = { x: 50, y: 50 };
  addMarkerAt(center.x, center.y);
});

clearSelectedBtn.addEventListener('click', removeSelectedMarker);
clearAllBtn.addEventListener('click', clearAllMarkers);

mapUploadEl.addEventListener('change', (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    mapEl.style.backgroundImage = `url("${loadEvent.target.result}")`;
  };
  reader.readAsDataURL(file);
});

renderMarkers();
renderEvents();
