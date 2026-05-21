(() => {
  if (window.__akariCustomScriptLoaded) return
  window.__akariCustomScriptLoaded = true

  const setExperimentTab = button => {
    const box = button.closest('[data-exp-sandbox]')
    if (!box) return

    const target = button.dataset.expTab
    const buttons = Array.from(box.querySelectorAll('[data-exp-tab]'))
    const panels = Array.from(box.querySelectorAll('[data-exp-panel]'))

    buttons.forEach(item => {
      const active = item === button
      item.classList.toggle('is-active', active)
      item.setAttribute('aria-selected', String(active))
    })

    panels.forEach(panel => {
      const active = panel.dataset.expPanel === target
      panel.classList.toggle('is-active', active)
      panel.hidden = !active
    })
  }

  const syncExperimentTabs = () => {
    document.querySelectorAll('[data-exp-sandbox]').forEach(box => {
      const activeButton = box.querySelector('[data-exp-tab].is-active') || box.querySelector('[data-exp-tab]')
      if (activeButton) setExperimentTab(activeButton)
    })
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-exp-tab]') : null
    if (!target) return
    event.preventDefault()
    setExperimentTab(target)
  })

  document.addEventListener('DOMContentLoaded', syncExperimentTabs)
  document.addEventListener('pjax:complete', syncExperimentTabs)
})()
