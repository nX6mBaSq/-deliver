/* Local preparation only: no storage, network calls, capacity or price inference. */
(() => {
  const form = document.querySelector('[data-load-planner]');
  if (!form) return;
  const quantities = [...form.querySelectorAll('input[type="number"]')];
  const extra = form.querySelector('#planner-extra');
  const note = form.querySelector('#planner-note');
  const status = form.querySelector('[data-planner-status]');
  const copy = form.querySelector('[data-copy-note]');
  const disclosure = form.closest('details');
  status.id = 'planner-status';
  let revision = 0;
  function sizeNote() {
    if (!disclosure.open) return;
    note.style.height = 'auto';
    note.style.height = `${note.scrollHeight + 2}px`;
  }
  function render() {
    revision++;
    const lines = quantities.filter(input => input.validity.valid && Number(input.value) > 0)
      .map(input => `・${input.dataset.label}：${Number(input.value)}${input.dataset.unit}`);
    if (extra.value.trim()) lines.push(`・その他：${extra.value.trim()}`);
    note.value = lines.length ? `引越しの荷物について相談します。\n\n${lines.join('\n')}\n\n積載可否と料金のお見積りをお願いします。` : '荷物の個数や、ほかの荷物を入力してください。';
    const valid = form.checkValidity();
    quantities.forEach(input => {
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      if (!input.validity.valid) input.setAttribute('aria-describedby', status.id);
      else input.removeAttribute('aria-describedby');
    });
    copy.disabled = !lines.length || !valid;
    status.textContent = valid ? '' : '個数は0〜999の整数で入力してください。';
    sizeNote();
  }
  form.addEventListener('input', render);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => requestAnimationFrame(render));
  disclosure.addEventListener('toggle', sizeNote);
  window.addEventListener('resize', sizeNote);
  document.fonts?.ready.then(sizeNote);
  copy.addEventListener('click', async () => {
    if (!form.reportValidity() || copy.disabled) return;
    const currentRevision = revision;
    try {
      await navigator.clipboard.writeText(note.value);
      if (currentRevision === revision) status.textContent = 'コピーしました。見積りフォームに貼り付けてお使いください。';
    } catch {
      if (currentRevision !== revision) return;
      note.focus(); note.select();
      status.textContent = 'メモを選択しました。端末のコピー操作でコピーしてください。';
    }
  });
  render();
})();
