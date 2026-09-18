const defaultReports = [
  {
    id: 'AR-1001',
    reporterName: 'Demo User',
    mobile: '9876543210',
    animalType: 'Dog',
    condition: 'Injured',
    location: 'Near village temple, Pimpri-Chinchwad',
    description: 'Dog has a leg injury and needs medical support.',
    selfVolunteer: true,
    photo: '',
    status: 'Reported',
    volunteer: 'Not Assigned',
    date: new Date().toLocaleDateString()
  },
  {
    id: 'AR-1002',
    reporterName: 'Volunteer',
    mobile: '9876543211',
    animalType: 'Cow',
    condition: 'Needs Food',
    location: 'Gaushala road',
    description: 'Cow needs feeding support and water.',
    selfVolunteer: false,
    photo: '',
    status: 'Volunteer Assigned',
    volunteer: 'Rohan',
    date: new Date().toLocaleDateString()
  }
];

const defaultVolunteers = [
  { name: 'Rohan', mobile: '9000000001', area: 'Akurdi', role: 'Animal Rescue' },
  { name: 'Sneha', mobile: '9000000002', area: 'Chinchwad', role: 'Animal Feeding' }
];

const statusOptions = ['Reported', 'Verified', 'Volunteer Assigned', 'Rescued', 'Treated/Closed'];

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const reportForm = document.getElementById('reportForm');
const volunteerForm = document.getElementById('volunteerForm');
const animalPhoto = document.getElementById('animalPhoto');
const photoPreview = document.getElementById('photoPreview');
const detectLocation = document.getElementById('detectLocation');
const trackSearch = document.getElementById('trackSearch');
const clearSearch = document.getElementById('clearSearch');
const resetDemo = document.getElementById('resetDemo');

function getReports() {
  const saved = localStorage.getItem('animalReports');
  if (!saved) {
    localStorage.setItem('animalReports', JSON.stringify(defaultReports));
    return defaultReports;
  }
  return JSON.parse(saved);
}

function saveReports(reports) {
  localStorage.setItem('animalReports', JSON.stringify(reports));
}

function getVolunteers() {
  const saved = localStorage.getItem('volunteers');
  if (!saved) {
    localStorage.setItem('volunteers', JSON.stringify(defaultVolunteers));
    return defaultVolunteers;
  }
  return JSON.parse(saved);
}

function saveVolunteers(volunteers) {
  localStorage.setItem('volunteers', JSON.stringify(volunteers));
}

function createReportId() {
  const reports = getReports();
  const number = 1001 + reports.length;
  return `AR-${number}`;
}

function placeholderImage(type) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="350">
      <rect width="100%" height="100%" fill="#eaf7ed"/>
      <circle cx="300" cy="145" r="60" fill="#2f8f46" opacity="0.18"/>
      <text x="50%" y="48%" text-anchor="middle" font-family="Arial" font-size="36" font-weight="700" fill="#226c34">${type}</text>
      <text x="50%" y="62%" text-anchor="middle" font-family="Arial" font-size="20" fill="#65758b">Animal Report Photo</text>
    </svg>
  `)}`;
}

function renderStats() {
  const reports = getReports();
  const volunteers = getVolunteers();
  const closed = reports.filter(report => report.status === 'Treated/Closed').length;
  document.getElementById('totalReports').textContent = reports.length;
  document.getElementById('openCases').textContent = reports.length - closed;
  document.getElementById('closedCases').textContent = closed;
  document.getElementById('volunteerCount').textContent = volunteers.length;
}

function renderTrackList() {
  const reports = getReports();
  const query = trackSearch.value.trim().toLowerCase();
  const filtered = reports.filter(report => {
    return (
      report.id.toLowerCase().includes(query) ||
      report.animalType.toLowerCase().includes(query) ||
      report.condition.toLowerCase().includes(query) ||
      report.location.toLowerCase().includes(query)
    );
  });

  const list = document.getElementById('trackList');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = '<p class="muted">No reports found.</p>';
    return;
  }

  filtered.forEach(report => {
    const card = document.createElement('article');
    card.className = 'report-card';
    card.innerHTML = `
      <img src="${report.photo || placeholderImage(report.animalType)}" alt="${report.animalType} report" />
      <h3>${report.id} - ${report.animalType}</h3>
      <span class="status-pill">${report.status}</span>
      <p><strong>Condition:</strong> ${report.condition}</p>
      <p><strong>Location:</strong> ${report.location}</p>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Volunteer:</strong> ${report.volunteer}</p>
    `;
    list.appendChild(card);
  });
}

function renderAdminTable() {
  const reports = getReports();
  const volunteers = getVolunteers();
  const table = document.getElementById('adminTable');
  table.innerHTML = '';

  reports.forEach((report, index) => {
    const statusSelect = statusOptions.map(status => {
      return `<option ${report.status === status ? 'selected' : ''}>${status}</option>`;
    }).join('');

    const volunteerOptions = ['Not Assigned', ...volunteers.map(vol => vol.name)].map(name => {
      return `<option ${report.volunteer === name ? 'selected' : ''}>${name}</option>`;
    }).join('');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${report.id}</strong><br><small>${report.date}</small></td>
      <td>${report.animalType}</td>
      <td>${report.condition}</td>
      <td>${report.location}</td>
      <td>
        <select data-index="${index}" class="status-select">${statusSelect}</select>
      </td>
      <td>
        <select data-index="${index}" class="volunteer-select">${volunteerOptions}</select>
      </td>
      <td>
        <button class="btn secondary save-row" data-index="${index}">Save</button>
      </td>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll('.save-row').forEach(button => {
    button.addEventListener('click', event => {
      const index = Number(event.target.dataset.index);
      const status = document.querySelector(`.status-select[data-index="${index}"]`).value;
      const volunteer = document.querySelector(`.volunteer-select[data-index="${index}"]`).value;
      const updatedReports = getReports();
      updatedReports[index].status = status;
      updatedReports[index].volunteer = volunteer;
      saveReports(updatedReports);
      renderAll();
    });
  });
}

function renderAll() {
  renderStats();
  renderTrackList();
  renderAdminTable();
}

menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('show'));
});

animalPhoto.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) {
    photoPreview.textContent = 'Photo preview will appear here';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photoPreview.innerHTML = `<img src="${reader.result}" alt="Uploaded animal" />`;
  };
  reader.readAsDataURL(file);
});

detectLocation.addEventListener('click', () => {
  const locationInput = document.getElementById('location');
  if (!navigator.geolocation) {
    alert('GPS is not supported in this browser.');
    return;
  }
  locationInput.value = 'Detecting location...';
  navigator.geolocation.getCurrentPosition(
    position => {
      locationInput.value = `Lat: ${position.coords.latitude.toFixed(5)}, Long: ${position.coords.longitude.toFixed(5)}`;
    },
    () => {
      locationInput.value = '';
      alert('Unable to detect location. Please enter it manually.');
    }
  );
});

reportForm.addEventListener('submit', event => {
  event.preventDefault();
  const photoImg = photoPreview.querySelector('img');
  const report = {
    id: createReportId(),
    reporterName: document.getElementById('reporterName').value,
    mobile: document.getElementById('mobile').value,
    animalType: document.getElementById('animalType').value,
    condition: document.getElementById('condition').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    selfVolunteer: document.getElementById('selfVolunteer').checked,
    photo: photoImg ? photoImg.src : '',
    status: 'Reported',
    volunteer: document.getElementById('selfVolunteer').checked ? 'Self Volunteer' : 'Not Assigned',
    date: new Date().toLocaleDateString()
  };

  const reports = getReports();
  reports.push(report);
  saveReports(reports);
  reportForm.reset();
  photoPreview.textContent = 'Photo preview will appear here';
  document.getElementById('reportSuccess').textContent = `Report submitted successfully. Your Report ID is ${report.id}.`;
  renderAll();
});

volunteerForm.addEventListener('submit', event => {
  event.preventDefault();
  const volunteer = {
    name: document.getElementById('volName').value,
    mobile: document.getElementById('volMobile').value,
    area: document.getElementById('volArea').value,
    role: document.getElementById('volRole').value
  };
  const volunteers = getVolunteers();
  volunteers.push(volunteer);
  saveVolunteers(volunteers);
  volunteerForm.reset();
  document.getElementById('volunteerSuccess').textContent = 'Volunteer registered successfully.';
  renderAll();
});

trackSearch.addEventListener('input', renderTrackList);
clearSearch.addEventListener('click', () => {
  trackSearch.value = '';
  renderTrackList();
});

resetDemo.addEventListener('click', () => {
  localStorage.removeItem('animalReports');
  localStorage.removeItem('volunteers');
  document.getElementById('reportSuccess').textContent = '';
  document.getElementById('volunteerSuccess').textContent = '';
  renderAll();
});

renderAll();
