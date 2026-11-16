(() => {
  const searchDialog = document.querySelector('#neuro-search');
  const searchTriggers = document.querySelectorAll('[aria-controls="neuro-search"]');
  const searchForm = searchDialog.querySelector('form');
  const searchInput = searchForm.elements.q;
  const searchReset = searchDialog.querySelector('[data-search-reset]');
  const searchHistory = searchDialog.querySelector('[data-search-history]');
  const searchClear = searchDialog.querySelector('[data-search-clear]');
  const searchExample = searchDialog.querySelector('[data-search-example]');
  const searchResults = searchDialog.querySelector('[data-search-results]');
  const searchDropdown = searchDialog.querySelector('.quick-search__dropdown');
  const searchVariantButtons = [...searchDialog.querySelectorAll('[data-search-variant]')];
  const askAiButton = searchDialog.querySelector('.neuro-search__ask-ai');
  let searchOpener;
  let searchHistoryCleared = false;

  function playAskAiTrace(trigger) {
    if (searchDialog.dataset.searchVariant !== '1') return;
    if (askAiButton.hasAttribute('data-ask-ai-trace')) {
      askAiButton.removeAttribute('data-ask-ai-trace');
      // Commit the removal so an AI click can restart the opening animation.
      void askAiButton.offsetWidth;
    }
    askAiButton.dataset.askAiTrace = trigger;
  }

  function setSearchVariant(selectedButton) {
    const variant = selectedButton.dataset.searchVariant;
    if (searchDialog.dataset.searchVariant === variant) return;

    searchDialog.dataset.searchVariant = variant;
    askAiButton.setAttribute('aria-checked', 'false');
    askAiButton.removeAttribute('data-ask-ai-trace');

    for (const button of searchVariantButtons) {
      button.setAttribute('aria-pressed', String(button === selectedButton));
    }

    if (!searchDialog.hidden) playAskAiTrace('open');
  }

  setSearchVariant(searchVariantButtons[0]);
  for (const button of searchVariantButtons) {
    button.addEventListener('click', () => setSearchVariant(button));
  }

  askAiButton.addEventListener('click', event => {
    const isEnabled = askAiButton.getAttribute('aria-checked') !== 'true';
    askAiButton.setAttribute('aria-checked', String(isEnabled));

    if (searchDialog.dataset.searchVariant === '1') {
      if (isEnabled) {
        playAskAiTrace('enable');
      } else {
        askAiButton.removeAttribute('data-ask-ai-trace');
      }
      if (event.detail > 0) searchInput.focus({ preventScroll: true });
    }
  });

  function updateSearch() {
    const hasQuery = searchInput.value.trim() !== '';
    searchReset.hidden = searchInput.value === '';
    searchHistory.hidden = hasQuery || searchHistoryCleared;
    searchResults.hidden = !hasQuery;
    searchDropdown.hidden = searchHistory.hidden && searchResults.hidden;
  }

  function closeSearch() {
    searchDialog.hidden = true;
    askAiButton.removeAttribute('data-ask-ai-trace');
    searchDialog.parentElement.classList.remove('quick-search-wrapper');
    searchOpener.setAttribute('aria-expanded', 'false');
    searchOpener.focus();
  }

  for (const trigger of searchTriggers) {
    trigger.addEventListener('click', () => {
      searchOpener = trigger;
      trigger.setAttribute('aria-expanded', 'true');
      searchInput.value = '';
      updateSearch();
      searchDialog.parentElement.classList.add('quick-search-wrapper');
      searchDialog.hidden = false;
      playAskAiTrace('open');
      searchInput.focus();
    });
  }

  searchDialog.querySelector('.quick-search__underlay').addEventListener('click', closeSearch);
  searchInput.addEventListener('input', updateSearch);
  searchReset.addEventListener('click', () => {
    searchInput.value = '';
    updateSearch();
    searchInput.focus();
  });
  searchClear.addEventListener('click', () => {
    searchHistoryCleared = true;
    updateSearch();
    searchInput.focus();
  });
  searchExample.addEventListener('click', () => {
    searchInput.value = searchExample.dataset.searchExample;
    searchForm.requestSubmit();
  });
  searchForm.addEventListener('submit', event => {
    searchInput.value = searchInput.value.trim();
    if (!searchInput.value) {
      event.preventDefault();
      updateSearch();
    }
  });
  searchForm.addEventListener('formdata', event => {
    event.formData.set('ai', askAiButton.getAttribute('aria-checked') === 'true' ? '1' : '0');
  });
  searchDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
    }

    if (event.key === 'Tab') {
      const controls = [...searchDialog.querySelectorAll('input:not(:disabled), button:not(:disabled)')]
        .filter(control => !control.closest('[hidden]'));
      const edge = event.shiftKey ? controls[0] : controls.at(-1);
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? controls.at(-1) : controls[0]).focus();
      }
    }
  });
})();
