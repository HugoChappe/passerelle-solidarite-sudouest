// --- Configuration du formulaire "Proposer une initiative" ---
// Ce site est 100% statique : les propositions sont envoyées à un Google Form,
// qui les écrit automatiquement dans un Google Sheet lié. Voir README.md
// pour la marche à suivre (créer le Form, récupérer ces identifiants).
const GOOGLE_FORM_CONFIG = {
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfdYB4gm3u8MZ2WKjrYDcrb8Oyfax6y7-rrXaGdvpFjLXbeQw/formResponse',
  entries: {
    type: 'entry.1759047126',
    titre: 'entry.2075098705',
    lien: 'entry.1030429726',
    description: 'entry.820227345',
    email: 'entry.474797734',
  },
};

const backdrop = document.getElementById('proposal-backdrop');
const form = document.getElementById('proposal-form');
const statusEl = document.getElementById('form-status');
const modalTitle = document.getElementById('modal-title');
const lienHint = document.getElementById('lien-hint');
const descriptionField = document.getElementById('description-field');
const submitBtn = document.getElementById('submit-proposal');
const descriptionOptionalTag = document.getElementById('description-optional-tag');
let lastFocused = null;

const MODES = {
  proposition: {
    modalTitle: 'Proposer une initiative',
    lienHint: "Obligatoire — c'est ce qui nous permet de vérifier l'initiative avant de la référencer.",
    descriptionPlaceholder: '',
    descriptionRequired: false,
    submitLabel: 'Envoyer la proposition',
    successMessage: 'Merci ! Votre proposition a bien été transmise.',
  },
  signalement: {
    modalTitle: 'Signaler un problème',
    lienHint: 'Le lien de la ressource concernée.',
    descriptionPlaceholder: 'Lien mort, information obsolète, coordonnées incorrectes…',
    descriptionRequired: true,
    submitLabel: 'Envoyer le signalement',
    successMessage: 'Merci, le signalement a bien été transmis.',
  },
};

function openModal({ type = 'proposition', titre = '', lien = '' } = {}) {
  lastFocused = document.activeElement;
  const mode = MODES[type];

  form.querySelector('[name="type"]').value = type;
  form.querySelector('[name="titre"]').value = titre;
  form.querySelector('[name="lien"]').value = lien;

  modalTitle.textContent = mode.modalTitle;
  lienHint.textContent = mode.lienHint;
  descriptionField.placeholder = mode.descriptionPlaceholder;
  descriptionField.required = mode.descriptionRequired;
  descriptionOptionalTag.style.display = mode.descriptionRequired ? 'none' : '';
  submitBtn.textContent = mode.submitLabel;

  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  (type === 'signalement' ? descriptionField : form.querySelector('[name="titre"]')).focus();
}

function closeModal() {
  backdrop.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  statusEl.textContent = '';
  statusEl.className = 'form-status';
  if (lastFocused) lastFocused.focus();
}

// Masque le header au scroll vers le bas, le réaffiche au scroll vers le haut
// (effet surtout utile en mobile, où le header occupe une grande part de l'écran).
const siteHeader = document.querySelector('.site-header');
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    siteHeader.classList.add('header-hidden');
  } else {
    siteHeader.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY;
}, { passive: true });

document.querySelectorAll('#open-proposal, [data-open-proposal]').forEach((el) => {
  el.addEventListener('click', () => openModal({ type: 'proposition' }));
});

// Injecte un lien "Signaler un problème" à côté du CTA de chaque carte de ressource.
document.querySelectorAll('.card').forEach((card) => {
  const titleEl = card.querySelector('h3');
  const linkEl = card.querySelector('.card-cta[href]');
  if (!titleEl || !linkEl) return;

  const titre = titleEl.textContent.trim();
  const lien = linkEl.getAttribute('href');

  linkEl.addEventListener('click', () => {
    if (window.posthog) posthog.capture('resource_click', { resource: titre, url: lien });
  });

  const reportBtn = document.createElement('button');
  reportBtn.type = 'button';
  reportBtn.className = 'report-link';
  reportBtn.setAttribute('aria-label', `Signaler un problème avec ${titre}`);
  reportBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Signaler un problème';
  reportBtn.addEventListener('click', () => openModal({ type: 'signalement', titre, lien }));

  const actionsRow = document.createElement('div');
  actionsRow.className = 'card-actions';
  linkEl.replaceWith(actionsRow);
  actionsRow.appendChild(linkEl);
  actionsRow.appendChild(reportBtn);
});

// --- Partage ---
const SHARE_URL = 'https://passerelle-solidarite-sudouest.vercel.app/';
const SHARE_TEXT = 'Passerelle Solidaire — tous les liens utiles pour aider face aux incendies de Gironde et des Landes, réunis en un seul endroit.';

function trackShare(method) {
  if (window.posthog) posthog.capture('share_click', { method });
}

const nativeShareBtn = document.getElementById('share-native');
if (navigator.share) {
  nativeShareBtn.hidden = false;
  nativeShareBtn.addEventListener('click', async () => {
    try {
      await navigator.share({ title: 'Passerelle Solidaire', text: SHARE_TEXT, url: SHARE_URL });
      trackShare('native');
    } catch (err) {
      // L'utilisateur a annulé le partage, rien à faire.
    }
  });
}

function wireCopyButton(id, method) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const label = btn.querySelector('span');
    const original = label.textContent;
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      label.textContent = 'Copié !';
      trackShare(method);
    } catch (err) {
      label.textContent = 'Erreur — copiez manuellement';
    } finally {
      setTimeout(() => { label.textContent = original; }, 1800);
    }
  });
}

wireCopyButton('copy-link', 'copy_link');
wireCopyButton('copy-link-top', 'copy_link_top');

document.getElementById('share-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
document.getElementById('share-sms').href = `sms:?&body=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
document.getElementById('share-email').href = `mailto:?subject=${encodeURIComponent('Passerelle Solidaire — ressources pour les sinistrés des incendies')}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`;

['share-whatsapp', 'share-sms', 'share-email'].forEach((id) => {
  document.getElementById(id).addEventListener('click', () => trackShare(id.replace('share-', '')));
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
  const type = data.get('type') || 'proposition';
  const body = new URLSearchParams();
  body.append(GOOGLE_FORM_CONFIG.entries.type, type);
  body.append(GOOGLE_FORM_CONFIG.entries.titre, data.get('titre') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.lien, data.get('lien') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.description, data.get('description') || '');
  body.append(GOOGLE_FORM_CONFIG.entries.email, data.get('email') || '');

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
    statusEl.textContent = MODES[type].successMessage;
    statusEl.className = 'form-status success';
    setTimeout(closeModal, 1800);
  } catch (err) {
    statusEl.textContent = "Une erreur est survenue — réessayez plus tard.";
    statusEl.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
