(() => {
  if (window.__akariCustomScriptLoaded) return
  window.__akariCustomScriptLoaded = true

  const scoped = (root, selector) => Array.from(root.querySelectorAll(selector))
  const escapeId = value => {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value)
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&')
  }

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

  const syncPaperReveals = () => {
    const revealEls = scoped(document, '.paper-article-inline [data-reveal], .paper-article-real-time-trustworthiness-scoring .reveal')
    if (!revealEls.length) return

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => {
        el.classList.add('revealed')
        el.classList.add('visible')
      })
      return
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('revealed')
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12 })

    revealEls.forEach(el => observer.observe(el))
  }

  const syncPaperNav = () => {
    document.querySelectorAll('.paper-article-inline').forEach(root => {
      const navLinks = scoped(root, '.nav a, .topbar .nav a, .toc a')
      const sections = scoped(root, 'main section[id], footer[id], header[id], section[id]').filter(section => section.id)
      if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return

      const byId = new Map(navLinks
        .map(link => [link.getAttribute('href') || '', link])
        .filter(([href]) => href.startsWith('#')))

      const observer = new IntersectionObserver(entries => {
        const current = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!current) return

        navLinks.forEach(link => link.classList.remove('active'))
        const link = byId.get(`#${current.target.id}`)
        if (link) link.classList.add('active')
      }, { rootMargin: '-36% 0px -52% 0px', threshold: [0, 0.2, 0.45, 0.7] })

      sections.forEach(section => observer.observe(section))
    })
  }

  const setupScopedTabs = root => {
    scoped(root, '.tab[data-tab]').forEach(button => {
      if (button.dataset.akariTabReady === 'true') return
      button.dataset.akariTabReady = 'true'
      button.addEventListener('click', () => {
        const group = button.closest('.tabs') || root
        scoped(group, '.tab[data-tab]').forEach(item => item.classList.toggle('active', item === button))

        const targetId = button.dataset.tab || ''
        const plainTarget = root.querySelector(`#${escapeId(targetId)}`)
        const prefixedTarget = root.querySelector(`#tab-${escapeId(targetId)}`)
        const target = prefixedTarget || plainTarget
        const panels = target
          ? scoped(root, '.tab-panel, .panel').filter(panel => panel.id === targetId || panel.id === `tab-${targetId}` || panel.classList.contains('tab-panel'))
          : scoped(root, '.tab-panel')

        panels.forEach(panel => panel.classList.toggle('active', panel === target))
      })
    })
  }

  const setupDomainTabs = root => {
    const buttons = scoped(root, '[data-domain-tab]')
    const panes = scoped(root, '[data-domain-pane]')
    if (!buttons.length || !panes.length) return

    buttons.forEach(button => {
      if (button.dataset.akariDomainReady === 'true') return
      button.dataset.akariDomainReady = 'true'
      button.addEventListener('click', () => {
        const target = button.dataset.domainTab
        buttons.forEach(item => item.classList.toggle('active', item === button))
        panes.forEach(pane => pane.classList.toggle('active', pane.dataset.domainPane === target))
      })
    })
  }

  const setupLeveraging = root => {
    const table6 = {
      aws: {
        title: 'Table 6 · AWS exact match accuracy [%]',
        headers: ['Field', 'GPT 3.5 Z', 'GPT 3.5 F', 'GPT 4o Z', 'GPT 4o F', 'Claude 3.5 Z', 'Claude 3.5 F', 'Claude 4 Z', 'Claude 4 F', 'Gemini 2.0 Z', 'Gemini 2.0 F', 'Gemini 2.5 Z', 'Gemini 2.5 F'],
        rows: [
          ['Service Name', 84.67, 100.00, 100.00, 100.00, 76.67, 100.00, 88.00, 100.00, 79.33, 100.00, 98.67, 100.00],
          ['Location', 48.00, 96.67, 83.33, 98.67, 48.67, 96.67, 55.33, 97.33, 76.67, 96.67, 78.00, 96.00],
          ['Start Time', 88.00, 91.33, 95.33, 96.00, 84.67, 94.67, 95.33, 95.33, 88.67, 94.67, 95.33, 95.33],
          ['End Time', 83.33, 86.00, 87.33, 88.00, 66.00, 86.00, 85.33, 86.67, 83.33, 88.67, 86.67, 88.00],
          ['Timezone', 98.67, 98.67, 98.00, 98.67, 97.33, 98.00, 98.67, 98.67, 97.33, 98.67, 98.67, 98.67],
          ['Service Categ.', 73.33, 73.33, 90.00, 68.00, 85.33, 87.33, 88.00, 89.33, 84.00, 86.00, 90.67, 90.67],
          ['Average', 79.33, 91.00, 92.33, 91.56, 76.44, 93.78, 85.11, 94.56, 84.89, 94.11, 91.34, 94.78]
        ]
      },
      azure: {
        title: 'Table 6 · AZURE exact match accuracy [%]',
        headers: ['Field', 'GPT 3.5 Z', 'GPT 3.5 F', 'GPT 4o Z', 'GPT 4o F', 'Claude 3.5 Z', 'Claude 3.5 F', 'Claude 4 Z', 'Claude 4 F', 'Gemini 2.0 Z', 'Gemini 2.0 F', 'Gemini 2.5 Z', 'Gemini 2.5 F'],
        rows: [
          ['Service Name', 56.84, 63.16, 55.79, 61.05, 66.32, 67.37, 61.05, 55.79, 56.84, 65.26, 57.89, 52.63],
          ['Location', 63.16, 67.37, 65.26, 64.21, 64.21, 69.47, 66.32, 70.53, 52.63, 67.37, 60.00, 65.26],
          ['Start Time', 97.89, 100.00, 98.95, 94.74, 67.37, 96.84, 98.95, 100.00, 68.42, 100.00, 98.95, 98.95],
          ['End Time', 92.63, 96.84, 94.74, 93.68, 65.26, 93.68, 93.68, 96.84, 64.21, 93.68, 95.79, 96.84],
          ['Timezone', 97.89, 97.89, 97.89, 95.79, 97.89, 97.89, 97.89, 98.95, 86.32, 98.95, 98.95, 98.95],
          ['Service Categ.', 64.21, 58.95, 67.37, 67.37, 63.16, 63.16, 64.21, 66.32, 60.00, 65.26, 62.11, 62.11],
          ['Root Cause Categ.', 61.05, 63.16, 67.37, 64.21, 65.26, 71.58, 63.16, 66.32, 61.05, 73.68, 67.37, 70.53],
          ['Average', 76.24, 78.20, 78.20, 77.29, 69.92, 80.00, 77.89, 79.25, 64.21, 80.60, 77.29, 77.90]
        ]
      },
      gcp: {
        title: 'Table 6 · GCP exact match accuracy [%]',
        headers: ['Field', 'GPT 3.5 Z', 'GPT 3.5 F', 'GPT 4o Z', 'GPT 4o F', 'Claude 3.5 Z', 'Claude 3.5 F', 'Claude 4 Z', 'Claude 4 F', 'Gemini 2.0 Z', 'Gemini 2.0 F', 'Gemini 2.5 Z', 'Gemini 2.5 F'],
        rows: [
          ['Service Name', 83.72, 89.77, 85.12, 86.05, 73.02, 88.37, 83.72, 87.91, 59.53, 89.77, 79.07, 89.30],
          ['Start Time', 25.58, 37.21, 47.44, 55.35, 33.49, 44.65, 64.65, 49.77, 45.12, 46.98, 57.67, 47.44],
          ['End Time', 32.09, 44.19, 78.60, 84.19, 66.98, 80.47, 85.12, 86.98, 73.95, 77.67, 85.12, 88.37],
          ['Timezone', 74.42, 77.67, 77.67, 87.91, 73.49, 74.42, 89.77, 82.79, 54.88, 77.67, 86.98, 88.84],
          ['Service Categ.', 61.86, 53.02, 61.86, 40.93, 64.19, 56.74, 62.33, 61.86, 62.33, 67.91, 62.33, 64.19],
          ['Average', 55.53, 60.37, 70.14, 70.89, 62.23, 68.93, 77.12, 73.86, 59.16, 72.00, 74.23, 75.63]
        ]
      }
    }

    const renderTable = key => {
      const mount = root.querySelector(`#${escapeId(key)}`)
      if (!mount || mount.dataset.akariRendered === 'true') return
      const data = table6[key]
      mount.dataset.akariRendered = 'true'
      mount.innerHTML = `<div class="figure"><h3>${data.title}</h3><div class="table-wrap"><table><thead><tr>${data.headers.map((heading, index) => `<th class="${index ? 'num' : ''}">${heading}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row => {
        const nums = row.slice(1)
        const max = Math.max(...nums)
        const min = Math.min(...nums)
        return `<tr>${row.map((value, index) => {
          if (index === 0) return `<td><b>${value}</b></td>`
          const cls = value === max ? 'best' : (value === min ? 'worst' : '')
          return `<td class="num ${cls}">${Number(value).toFixed(2)}</td>`
        }).join('')}</tr>`
      }).join('')}</tbody></table></div><div class="caption">绿色为该行最高值，红色为最低值。Z=zero-shot，F=few-shot。</div></div>`
    }

    Object.keys(table6).forEach(renderTable)

    const plots = {
      aws: { avgC: 30.48, avgA: 0.83, maxC: 100, minA: 0.65, maxA: 0.91, pts: [[2, 0.89, 'Z'], [4, 0.77, 'Z'], [22, 0.66, 'Z'], [25, 0.86, 'Z'], [31, 0.83, 'Z'], [80, 0.79, 'Z'], [20, 0.82, 'F'], [24, 0.895, 'F'], [42, 0.90, 'F'], [98, 0.88, 'F']] },
      azure: { avgC: 61.22, avgA: 0.72, maxC: 190, minA: 0.62, maxA: 0.80, pts: [[10, 0.69, 'Z'], [18, 0.625, 'Z'], [58, 0.72, 'Z'], [90, 0.71, 'Z'], [130, 0.73, 'Z'], [6, 0.79, 'F'], [28, 0.73, 'F'], [75, 0.785, 'F'], [108, 0.75, 'F'], [180, 0.75, 'F']] },
      gcp: { avgC: 51.89, avgA: 0.66, maxC: 150, minA: 0.55, maxA: 0.75, pts: [[5, 0.615, 'Z'], [14, 0.56, 'Z'], [38, 0.685, 'Z'], [60, 0.615, 'Z'], [100, 0.675, 'Z'], [4, 0.71, 'F'], [20, 0.65, 'F'], [55, 0.645, 'F'], [95, 0.705, 'F'], [145, 0.735, 'F']] }
    }

    const drawPlot = (svg, spec) => {
      if (!spec || svg.dataset.akariRendered === 'true') return
      svg.dataset.akariRendered = 'true'
      const w = 260
      const h = 180
      const p = 30
      const iw = w - p - 12
      const ih = h - p - 18
      const x = c => p + (c / spec.maxC) * iw
      const y = a => 10 + (spec.maxA - a) / (spec.maxA - spec.minA) * ih
      let output = `<line x1="${p}" y1="${10 + ih}" x2="${p + iw}" y2="${10 + ih}" stroke="#bbb"/><line x1="${p}" y1="10" x2="${p}" y2="${10 + ih}" stroke="#bbb"/>`
      output += `<line x1="${x(spec.avgC)}" y1="10" x2="${x(spec.avgC)}" y2="${10 + ih}" stroke="#ff6b6b" stroke-dasharray="4 3"/><line x1="${p}" y1="${y(spec.avgA)}" x2="${p + iw}" y2="${y(spec.avgA)}" stroke="#3aa35c" stroke-dasharray="4 3"/>`
      spec.pts.forEach(([cost, accuracy, type], index) => {
        const color = type === 'F' ? '#f5a524' : '#0071e3'
        const shape = index % 3
        if (shape === 0) output += `<circle cx="${x(cost)}" cy="${y(accuracy)}" r="5" fill="${color}" opacity=".9"/>`
        if (shape === 1) output += `<rect x="${x(cost) - 5}" y="${y(accuracy) - 5}" width="10" height="10" fill="none" stroke="${color}" stroke-width="2"/>`
        if (shape === 2) output += `<path d="M ${x(cost)} ${y(accuracy) - 7} L ${x(cost) - 7} ${y(accuracy) + 6} L ${x(cost) + 7} ${y(accuracy) + 6} Z" fill="${color}" opacity=".9"/>`
      })
      output += `<text x="${p + iw - 38}" y="${h - 4}" font-size="10" fill="#666">Cost</text><text x="2" y="18" font-size="10" fill="#666">Acc.</text>`
      svg.innerHTML = output
    }

    scoped(root, 'svg[data-plot]').forEach(svg => drawPlot(svg, plots[svg.dataset.plot]))
  }

  const setupDocs2Table = root => {
    const modelData = [
      { name: 'Mistral-7B-Instruct-v0.3', group: 'baseline', family: 'finetune', label: 'Fine-Tune', fc_bs: 17.18, th_bs: 13.17, dc_bs: 11.91, err: 6.54, ehr: 20.59 },
      { name: 'TableLLM-7B', group: 'baseline', family: 'finetune', label: 'Fine-Tune', fc_bs: 15.64, th_bs: 10.24, dc_bs: 9.71, err: 7.08, ehr: 24.60 },
      { name: 'StructLM-7B', group: 'baseline', family: 'finetune', label: 'Fine-Tune', fc_bs: 13.46, th_bs: 10.56, dc_bs: 10.37, err: 7.30, ehr: 28.70 },
      { name: 'Qwen2.5-72B', group: 'baseline', family: 'sota', label: 'SOTA / Zero-shot', fc_bs: 37.45, th_bs: 27.01, dc_bs: 27.74, err: 4.54, ehr: 69.46 },
      { name: 'Qwen2.5-72B (CoT)', group: 'baseline', family: 'sota', label: 'SOTA / CoT', fc_bs: 39.01, th_bs: 28.04, dc_bs: 27.01, err: 4.01, ehr: 71.02 },
      { name: 'DeepSeekV3', group: 'baseline', family: 'sota', label: 'SOTA / Zero-shot', fc_bs: 35.54, th_bs: 29.56, dc_bs: 30.84, err: 4.40, ehr: 43.28 },
      { name: 'DeepSeekV3 (CoT)', group: 'baseline', family: 'sota', label: 'SOTA / CoT', fc_bs: 36.02, th_bs: 30.03, dc_bs: 30.01, err: 4.00, ehr: 44.01 },
      { name: 'GPT-4o', group: 'baseline', family: 'sota', label: 'SOTA / Zero-shot', fc_bs: 28.73, th_bs: 26.88, dc_bs: 28.34, err: 4.10, ehr: 54.39 },
      { name: 'GPT-4o (CoT)', group: 'baseline', family: 'sota', label: 'SOTA / CoT', fc_bs: 29.01, th_bs: 27.02, dc_bs: 29.31, err: 3.51, ehr: 55.02 },
      { name: 'Llama-3.3-70B', group: 'baseline', family: 'sota', label: 'SOTA / Zero-shot', fc_bs: 40.52, th_bs: 27.61, dc_bs: 27.51, err: 4.83, ehr: 68.42 },
      { name: 'Llama-3.3-70B (CoT)', group: 'baseline', family: 'sota', label: 'SOTA / CoT', fc_bs: 41.01, th_bs: 28.03, dc_bs: 28.11, err: 4.51, ehr: 69.01 },
      { name: 'Qwen3-32B', group: 'baseline', family: 'sota', label: 'SOTA / Zero-shot', fc_bs: 35.07, th_bs: 30.14, dc_bs: 33.14, err: 3.99, ehr: 80.86 },
      { name: 'Qwen3-32B (CoT)', group: 'baseline', family: 'sota', label: 'SOTA / CoT', fc_bs: 36.02, th_bs: 31.02, dc_bs: 35.67, err: 3.51, ehr: 82.01 },
      { name: 'Qwen2.5-72B (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + SOTA', fc_bs: 45.32, th_bs: 42.38, dc_bs: 41.30, err: 4.59, ehr: 76.23 },
      { name: 'DeepSeekV3 (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + SOTA', fc_bs: 39.90, th_bs: 48.24, dc_bs: 45.60, err: 5.79, ehr: 56.58 },
      { name: 'GPT-4o (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + SOTA', fc_bs: 21.38, th_bs: 47.74, dc_bs: 46.97, err: 5.21, ehr: 79.86 },
      { name: 'Llama-3.3-70B (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + SOTA', fc_bs: 45.06, th_bs: 42.21, dc_bs: 42.60, err: 4.65, ehr: 72.85 },
      { name: 'Qwen3-32B (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + SOTA', fc_bs: 49.10, th_bs: 48.46, dc_bs: 49.58, err: 4.23, ehr: 68.72 },
      { name: 'DeepSeek-r1', group: 'thinking', family: 'thinking', label: 'Thinking 原版', fc_bs: 43.56, th_bs: 56.78, dc_bs: 56.78, err: 2.87, ehr: 85.63 },
      { name: 'o4-mini', group: 'thinking', family: 'thinking', label: 'Thinking 原版', fc_bs: 41.34, th_bs: 48.92, dc_bs: 54.32, err: 2.34, ehr: 89.76 },
      { name: 'Grok3', group: 'thinking', family: 'thinking', label: 'Thinking 原版', fc_bs: 42.34, th_bs: 48.17, dc_bs: 62.34, err: 3.21, ehr: 83.42 },
      { name: 'Gemini 2.5 Pro', group: 'thinking', family: 'thinking', label: 'Thinking 原版', fc_bs: 47.89, th_bs: 50.12, dc_bs: 55.67, err: 3.12, ehr: 84.56 },
      { name: 'DeepSeek-r1 (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + Thinking', fc_bs: 51.23, th_bs: 57.01, dc_bs: 66.12, err: 1.38, ehr: 91.12 },
      { name: 'o4-mini (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + Thinking', fc_bs: 45.13, th_bs: 60.23, dc_bs: 67.45, err: 1.21, ehr: 90.22 },
      { name: 'Grok3 (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + Thinking', fc_bs: 43.42, th_bs: 59.11, dc_bs: 70.34, err: 1.47, ehr: 88.31 },
      { name: 'Gemini 2.5 Pro (DDST)', group: 'ddst', family: 'ddst', label: 'DDST + Thinking', fc_bs: 47.98, th_bs: 57.68, dc_bs: 63.15, err: 1.59, ehr: 85.64 }
    ]

    const metricMeta = {
      dc_bs: { max: 75, higherIsBetter: true },
      th_bs: { max: 65, higherIsBetter: true },
      fc_bs: { max: 60, higherIsBetter: true },
      err: { max: 8, higherIsBetter: false },
      ehr: { max: 100, higherIsBetter: true }
    }

    const state = root.__akariDocs2TableState || { activeMetric: 'dc_bs', activeGroup: 'all' }
    root.__akariDocs2TableState = state

    const renderChart = () => {
      const list = root.querySelector('#chart-list')
      if (!list) return
      const meta = metricMeta[state.activeMetric]
      const filtered = modelData
        .filter(item => state.activeGroup === 'all' || item.group === state.activeGroup || (state.activeGroup === 'thinking' && item.group === 'ddst' && /r1|o4|Grok3|Gemini/i.test(item.name)))
        .sort((a, b) => meta.higherIsBetter ? b[state.activeMetric] - a[state.activeMetric] : a[state.activeMetric] - b[state.activeMetric])
        .slice(0, 10)

      list.innerHTML = ''
      filtered.forEach(item => {
        const row = document.createElement('div')
        row.className = 'chart-row'
        row.dataset.group = item.group
        const tagClass = item.family === 'ddst' ? 'tag-ddst' : (item.family === 'thinking' ? 'tag-thinking' : (item.family === 'finetune' ? 'tag-finetune' : 'tag-sota'))
        const width = Math.max(4, Math.min(100, (item[state.activeMetric] / meta.max) * 100))
        row.innerHTML = `<div class="chart-label"><div class="chart-name">${item.name}</div><div class="chart-tags"><span class="chart-tag ${tagClass}">${item.label}</span>${item.name.includes('(DDST)') ? '<span class="chart-tag tag-ddst">带 DDST</span>' : ''}</div></div><div class="chart-track"><div class="chart-bar" style="width:${width}%"></div></div><div class="chart-score">${item[state.activeMetric].toFixed(2)}</div>`
        list.appendChild(row)
      })
    }

    scoped(root, '#metric-switch button').forEach(button => {
      if (button.dataset.akariMetricReady === 'true') return
      button.dataset.akariMetricReady = 'true'
      button.addEventListener('click', () => {
        state.activeMetric = button.dataset.metric
        scoped(root, '#metric-switch button').forEach(item => item.classList.toggle('active', item === button))
        renderChart()
      })
    })

    scoped(root, '#group-switch button').forEach(button => {
      if (button.dataset.akariGroupReady === 'true') return
      button.dataset.akariGroupReady = 'true'
      button.addEventListener('click', () => {
        state.activeGroup = button.dataset.group
        scoped(root, '#group-switch button').forEach(item => item.classList.toggle('active', item === button))
        renderChart()
      })
    })

    renderChart()
  }

  const ensureLightbox = root => {
    if (!root.classList.contains('paper-article-schematiq')) return
    let lightbox = root.querySelector('#imgLightbox')
    if (!lightbox) {
      lightbox = document.createElement('div')
      lightbox.className = 'img-lightbox'
      lightbox.id = 'imgLightbox'
      lightbox.setAttribute('aria-hidden', 'true')
      lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="关闭图片预览">&times;</button><img alt="放大预览"><div class="lightbox-caption"></div>'
      root.appendChild(lightbox)
    }

    const image = lightbox.querySelector('img')
    const caption = lightbox.querySelector('.lightbox-caption')
    const close = () => {
      lightbox.classList.remove('open')
      lightbox.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = ''
    }

    scoped(root, '.paper-img').forEach(img => {
      if (img.dataset.akariLightboxReady === 'true') return
      img.dataset.akariLightboxReady = 'true'
      img.setAttribute('title', '点击放大查看')
      img.setAttribute('tabindex', '0')
      const open = () => {
        image.src = img.currentSrc || img.src
        image.alt = img.alt || '放大预览'
        caption.textContent = img.closest('div')?.querySelector('.mini-caption')?.textContent || img.parentElement?.querySelector('.cap')?.textContent || img.alt || ''
        lightbox.classList.add('open')
        lightbox.setAttribute('aria-hidden', 'false')
        document.body.style.overflow = 'hidden'
      }
      img.addEventListener('click', open)
      img.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      })
    })

    if (lightbox.dataset.akariReady !== 'true') {
      lightbox.dataset.akariReady = 'true'
      lightbox.addEventListener('click', event => {
        if (event.target === lightbox) close()
      })
      lightbox.querySelector('.lightbox-close')?.addEventListener('click', close)
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') close()
      })
    }
  }

  const syncPaperArticles = () => {
    const paperArticles = document.querySelectorAll('.paper-article-inline')
    document.body.classList.toggle('has-paper-article', paperArticles.length > 0)
    paperArticles.forEach(root => {
      setupScopedTabs(root)
      setupDomainTabs(root)
      ensureLightbox(root)
      if (root.classList.contains('paper-article-docs2table')) setupDocs2Table(root)
      if (root.classList.contains('paper-article-leveraging')) setupLeveraging(root)
    })
    syncPaperReveals()
    syncPaperNav()
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-exp-tab]') : null
    if (!target) return
    event.preventDefault()
    setExperimentTab(target)
  })

  document.addEventListener('DOMContentLoaded', syncExperimentTabs)
  document.addEventListener('DOMContentLoaded', syncPaperArticles)
  document.addEventListener('pjax:complete', syncExperimentTabs)
  document.addEventListener('pjax:complete', syncPaperArticles)
})()
