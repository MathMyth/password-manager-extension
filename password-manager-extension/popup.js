document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const noteList = document.getElementById('noteList');

  noteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (title && content) {
      const note = { title, content };
      addNoteToList(note);
      saveNoteToStorage(note);
      noteTitle.value = '';
      noteContent.value = '';
    }
  });

  loadNotesFromStorage();

  function loadNotesFromStorage() {
    noteList.innerHTML = '<div class="shimmer-effect"></div>';
    chrome.storage.sync.get(['notes'], (result) => {
      const notes = result.notes || [];
      noteList.innerHTML = '';
      for (const note of notes) {
        addNoteToList(note);
      }
    });
  }

  function addNoteToList(note) {
    const noteItem = document.createElement('div');
    noteItem.classList.add('note-item');
    noteItem.innerHTML = `
      <h2>${note.title}</h2>
      <div class="buttons">
        <button class="show-hash">Show Hash</button>
        <button class="show-plain">Show Plain Text</button>
        <button class="delete">Delete</button>
      </div>
    `;

    const showHashBtn = noteItem.querySelector('.show-hash');
    const showPlainBtn = noteItem.querySelector('.show-plain');
    const deleteBtn = noteItem.querySelector('.delete');

    showHashBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      hashFunction(note.content).then((hashedText) => {
        alert(hashedText);
      });
    });

    showPlainBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const securityKey = prompt('Please enter the security key:');
      if (securityKey === '2931') {
        alert(note.content);
      } else {
        alert('Incorrect security key. Access denied.');
      }
    });

    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteNote(note);
      noteItem.remove();
    });

    noteList.appendChild(noteItem);
  }

  function deleteNote(note) {
    chrome.storage.sync.get(['notes'], (result) => {
      const notes = result.notes || [];
      const updatedNotes = notes.filter((n) => n.title !== note.title || n.content !== note.content);
      chrome.storage.sync.set({ notes: updatedNotes });
    });
  }

  function saveNoteToStorage(note) {
    chrome.storage.sync.get(['notes'], (result) => {
      const notes = result.notes || [];
      notes.push(note);
      chrome.storage.sync.set({ notes });
    });
  }

  function hashFunction(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    return crypto.subtle.digest('SHA-256', data).then((hash) => {
      const hashArray = Array.from(new Uint8Array(hash));
      const hashedContent = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
      return hashedContent;
    });
  }
});
