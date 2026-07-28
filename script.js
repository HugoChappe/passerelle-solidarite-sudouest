// --- Configuration du formulaire "Proposer une solution" ---
// Ce site est 100% statique : les propositions sont envoyées à un Google Form,
// qui les écrit automatiquement dans un Google Sheet lié. Voir README.md
// pour la marche à suivre (créer le Form, récupérer ces identifiants).
const GOOGLE_FORM_CONFIG = {
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfdYB4gm3u8MZ2WKjrYDcrb8Oyfax6y7-rrXaGdvpFjLXbeQw/formResponse',
  entries: {
    titre: 'entry.2075098705',
    lien: 'entry.1030429726',
    description: 'entry.820227345',
    email: 'entry.474797734',
  },
};

const backdrop = document.getElementById('proposal-backdrop');
const form = document.getElementById('proposal-form');
const statusEl = document.getElementById('form-status');
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  const firstField = form.querySelector('input, textarea');
  if (firstField) firstField.focus();
}

function closeModal() {
  backdrop.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  statusEl.textContent = '';
  statusEl.className = 'form-status';
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('#open-proposal, [data-open-proposal]').forEach((el) => {
  el.addEventListener('click', openModal);
});

document.getElementById('close-proposal').addEventListener('click', closeModal);

backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !backdrop.hidden) closeModal();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (GOOGLE_FORM_CONFIG.actionUrl.includes('REPLACE_WITH_FORM_ID')) {
    statusEl.textContent = "Formulaire non encore connecté — voir README.md pour finaliser la configuration.";
    statusEl.className = 'form-status error';
    return;
  }

  const data = new FormData(form);
  const body = new URLSearchParams();
  body.append(GOOGLE_FORM_CONFIG.entries.titre, data.get('titre') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.lien, data.get('lien') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.description, data.get('description') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.email, data.get('email') || '');

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusEl.textContent = 'Envoi en cours…';
  statusEl.className = 'form-status';

  try {
    await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    statusEl.textContent = 'Merci ! Votre proposition a bien été transmise.';
    statusEl.className = 'form-status success';
    setTimeout(closeModal, 1800);
  } catch (err) {
    statusEl.textContent = "Une erreur est survenue — réessayez plus tard.";
    statusEl.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
