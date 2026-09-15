(function () {
  const STORAGE_KEY = 'registry:students';
  let students = [];

  const form = document.getElementById('registry-form');
  const submitBtn = document.getElementById('submit-btn');
  const formNote = document.getElementById('form-note');
  const rosterContainer = document.getElementById('roster-container');
  const rosterCount = document.getElementById('roster-count');
  const searchInput = document.getElementById('search-input');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setNote(msg, isError) {
    formNote.textContent = msg || '';
    formNote.classList.toggle('error', !!isError);
  }

  function loadStudents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      students = raw ? JSON.parse(raw) : [];
    } catch (err) {
      students = [];
    }
    render();
  }

  function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? students.filter(s =>
          (s.name || '').toLowerCase().includes(query) ||
          (s.rollNo || '').toLowerCase().includes(query) ||
          (s.className || '').toLowerCase().includes(query))
      : students;

    rosterCount.textContent = students.length === 1 ? '1 entry' : students.length + ' entries';

    if (students.length === 0) {
      rosterContainer.innerHTML = '<p class="empty-state">No one is on the roll yet. Be the first entry above.</p>';
      return;
    }

    if (filtered.length === 0) {
      rosterContainer.innerHTML = '<p class="empty-state">No entries match that search.</p>';
      return;
    }

    let rows = '';
    filtered.forEach((s, idx) => {
      rows += `<tr data-id="${escapeHtml(s.id)}">
        <td class="num">${String(idx + 1).padStart(3, '0')}</td>
        <td>${escapeHtml(s.name)}</td>
        <td class="meta">${escapeHtml(s.rollNo)}</td>
        <td class="meta">${escapeHtml(s.className || '\u2014')}</td>
        <td class="meta">${escapeHtml(s.email || '\u2014')}</td>
        <td class="remove-cell"><button class="remove-btn" data-remove="${escapeHtml(s.id)}">Remove</button></td>
      </tr>`;
    });

    rosterContainer.innerHTML = `
      <table class="roll">
        <thead>
          <tr>
            <th class="num">No.</th>
            <th>Name</th>
            <th class="meta-col">Roll / ID</th>
            <th class="meta-col">Class</th>
            <th class="meta-col">Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    rosterContainer.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeStudent(btn.getAttribute('data-remove')));
    });
  }

  function removeStudent(id) {
    students = students.filter(s => s.id !== id);
    render();
    try {
      saveStudents();
    } catch (err) {
      setNote('Could not update the record. Try again.', true);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const rollNo = document.getElementById('f-roll').value.trim();
    const className = document.getElementById('f-class').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const phone = document.getElementById('f-phone').value.trim();

    if (!name || !rollNo) {
      setNote('Name and roll number are required.', true);
      return;
    }

    const entry = {
      id: 'stu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name, rollNo, className, email, phone,
      addedAt: new Date().toISOString()
    };

    submitBtn.disabled = true;
    setNote('Saving\u2026', false);

    students.push(entry);
    render();

    try {
      saveStudents();
      setNote('Added to the registry.', false);
      form.reset();
    } catch (err) {
      students = students.filter(s => s.id !== entry.id);
      render();
      setNote('Could not save \u2014 your browser storage may be full or blocked.', true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  searchInput.addEventListener('input', render);

  loadStudents();
})();
