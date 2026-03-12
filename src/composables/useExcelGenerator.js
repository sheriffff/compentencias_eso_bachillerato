import ExcelJS from 'exceljs'

export function useExcelGenerator() {
  function colLetter(n) {
    let s = ''
    while (n > 0) {
      n--
      s = String.fromCharCode(65 + (n % 26)) + s
      n = Math.floor(n / 26)
    }
    return s
  }

  function getWeights(n) {
    if (n === 0) return []
    const base = Math.floor(100 / n) / 100
    const weights = Array(n).fill(base)
    const diff = Math.round((1 - base * n) * 100) / 100
    weights[n - 1] = Math.round((weights[n - 1] + diff) * 100) / 100
    return weights
  }

  async function generateExcel(cursoNombre, subcomps, evaluaciones, flags) {
    const wb = new ExcelJS.Workbook()

    const S = subcomps.length
    const evalCounts = evaluaciones.map(e => e.evaluables.length)
    const ROWS = 30

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } }
    const subHeaderFont = { bold: true, size: 10 }
    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    // --- Column positions for Sheet 1 (1-based) ---
    const s1Start = []
    let c1 = 3
    for (let i = 0; i < 3; i++) {
      s1Start.push(c1)
      c1 += evalCounts[i]
      if (i < 2) c1++
    }

    // --- Column positions for Sheet 2 ---
    const s2Start = []
    const s2Media = []
    let c2 = 3
    for (let i = 0; i < 3; i++) {
      s2Start.push(c2)
      c2 += evalCounts[i]
      s2Media.push(c2)
      c2++
      if (i < 2) c2++
    }

    // --- Column positions for Sheet 3 ---
    const s3Start = []
    let c3 = 3
    for (let i = 0; i < 3; i++) {
      s3Start.push(c3)
      c3 += S
      c3++
    }
    const s3Final = c3

    // ==========================================
    // Sheet 1: Comp y Crit
    // ==========================================
    const ws1 = wb.addWorksheet('Comp y Crit')

    for (let i = 0; i < 3; i++) {
      if (evalCounts[i] === 0) continue
      const start = s1Start[i]
      const end = start + evalCounts[i] - 1
      const cell = ws1.getCell(1, start)
      cell.value = `EVALUACIÓN ${i + 1}`
      cell.fill = headerFill
      cell.font = headerFont
      cell.alignment = { horizontal: 'center' }
      cell.border = thinBorder
      if (start < end) ws1.mergeCells(1, start, 1, end)
      for (let col = start; col <= end; col++) {
        ws1.getCell(1, col).fill = headerFill
        ws1.getCell(1, col).border = thinBorder
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < evalCounts[i]; j++) {
        const cell = ws1.getCell(2, s1Start[i] + j)
        cell.value = evaluaciones[i].evaluables[j].nombre
        cell.fill = subHeaderFill
        cell.font = subHeaderFont
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
    }

    for (let s = 0; s < S; s++) {
      const r = 3 + s
      const compCell = ws1.getCell(r, 1)
      compCell.value = subcomps[s].compNombre
      compCell.font = { bold: true }
      compCell.border = thinBorder
      const subCell = ws1.getCell(r, 2)
      subCell.value = subcomps[s].subNombre
      subCell.border = thinBorder
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < evalCounts[i]; j++) {
          const cell = ws1.getCell(r, s1Start[i] + j)
          cell.value = flags[i][s][j]
          cell.alignment = { horizontal: 'center' }
          cell.border = thinBorder
        }
      }
    }

    ws1.getColumn(1).width = 30
    ws1.getColumn(2).width = 40
    for (let col = 3; col < c1; col++) {
      if (ws1.getColumn(col)) ws1.getColumn(col).width = 12
    }

    // ==========================================
    // Sheet 2: Notas EX
    // ==========================================
    const ws2 = wb.addWorksheet('Notas EX')

    for (let i = 0; i < 3; i++) {
      const weights = getWeights(evalCounts[i])
      for (let j = 0; j < evalCounts[i]; j++) {
        const cell = ws2.getCell(1, s2Start[i] + j)
        cell.value = weights[j]
        cell.numFmt = '0.00'
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
        cell.font = { bold: true }
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
      if (evalCounts[i] > 0) {
        const cell = ws2.getCell(1, s2Media[i])
        cell.value = `EVAL ${i + 1}`
        cell.fill = headerFill
        cell.font = headerFont
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
    }

    const h2NameCell = ws2.getCell(2, 1)
    h2NameCell.value = 'Nombre'
    h2NameCell.font = { bold: true }
    h2NameCell.fill = subHeaderFill
    h2NameCell.border = thinBorder
    const h2ApCell = ws2.getCell(2, 2)
    h2ApCell.value = 'Apellidos'
    h2ApCell.font = { bold: true }
    h2ApCell.fill = subHeaderFill
    h2ApCell.border = thinBorder

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < evalCounts[i]; j++) {
        const cell = ws2.getCell(2, s2Start[i] + j)
        cell.value = evaluaciones[i].evaluables[j].nombre
        cell.fill = subHeaderFill
        cell.font = subHeaderFont
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
      if (evalCounts[i] > 0) {
        const cell = ws2.getCell(2, s2Media[i])
        cell.value = 'Media'
        cell.fill = subHeaderFill
        cell.font = subHeaderFont
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
    }

    for (let r = 3; r < 3 + ROWS; r++) {
      ws2.getCell(r, 1).border = thinBorder
      ws2.getCell(r, 2).border = thinBorder
      for (let i = 0; i < 3; i++) {
        if (evalCounts[i] === 0) continue
        for (let j = 0; j < evalCounts[i]; j++) {
          ws2.getCell(r, s2Start[i] + j).border = thinBorder
        }
        const terms = []
        for (let j = 0; j < evalCounts[i]; j++) {
          const cl = colLetter(s2Start[i] + j)
          terms.push(`${cl}$1*${cl}${r}`)
        }
        const mediaCell = ws2.getCell(r, s2Media[i])
        mediaCell.value = { formula: terms.join('+') }
        mediaCell.numFmt = '0.00'
        mediaCell.border = thinBorder
      }
    }

    ws2.getColumn(1).width = 18
    ws2.getColumn(2).width = 18
    for (let col = 3; col <= c2; col++) {
      if (ws2.getColumn(col)) ws2.getColumn(col).width = 12
    }

    // ==========================================
    // Sheet 3: Notas COMPET.
    // ==========================================
    const ws3 = wb.addWorksheet('Notas COMPET.')

    for (let i = 0; i < 3; i++) {
      if (S === 0) continue
      const start = s3Start[i]
      const end = start + S - 1
      const cell = ws3.getCell(1, start)
      cell.value = `EVALUACIÓN ${i + 1}`
      cell.fill = headerFill
      cell.font = headerFont
      cell.alignment = { horizontal: 'center' }
      cell.border = thinBorder
      if (start < end) ws3.mergeCells(1, start, 1, end)
      for (let col = start; col <= end; col++) {
        ws3.getCell(1, col).fill = headerFill
        ws3.getCell(1, col).border = thinBorder
      }
    }

    if (S > 0) {
      const fEnd = s3Final + S - 1
      const fCell = ws3.getCell(1, s3Final)
      fCell.value = 'EVALUACIÓN FINAL'
      fCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } }
      fCell.font = headerFont
      fCell.alignment = { horizontal: 'center' }
      fCell.border = thinBorder
      if (s3Final < fEnd) ws3.mergeCells(1, s3Final, 1, fEnd)
      for (let col = s3Final; col <= fEnd; col++) {
        ws3.getCell(1, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } }
        ws3.getCell(1, col).border = thinBorder
      }
    }

    const h3NameCell = ws3.getCell(2, 1)
    h3NameCell.value = 'Nombre'
    h3NameCell.font = { bold: true }
    h3NameCell.fill = subHeaderFill
    h3NameCell.border = thinBorder
    const h3ApCell = ws3.getCell(2, 2)
    h3ApCell.value = 'Apellidos'
    h3ApCell.font = { bold: true }
    h3ApCell.fill = subHeaderFill
    h3ApCell.border = thinBorder

    for (let i = 0; i < 3; i++) {
      for (let s = 0; s < S; s++) {
        const cell = ws3.getCell(2, s3Start[i] + s)
        cell.value = subcomps[s].subCodigo
        cell.fill = subHeaderFill
        cell.font = { bold: true, size: 9 }
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder
      }
    }
    for (let s = 0; s < S; s++) {
      const cell = ws3.getCell(2, s3Final + s)
      cell.value = subcomps[s].subCodigo
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
      cell.font = { bold: true, size: 9 }
      cell.alignment = { horizontal: 'center' }
      cell.border = thinBorder
    }

    for (let r = 3; r < 3 + ROWS; r++) {
      const nameCell = ws3.getCell(r, 1)
      nameCell.value = { formula: `'Notas EX'!A${r}` }
      nameCell.border = thinBorder
      const apCell = ws3.getCell(r, 2)
      apCell.value = { formula: `'Notas EX'!B${r}` }
      apCell.border = thinBorder

      for (let i = 0; i < 3; i++) {
        if (evalCounts[i] === 0) continue
        for (let s = 0; s < S; s++) {
          const flagRow = 3 + s
          const numTerms = []
          const denTerms = []
          for (let j = 0; j < evalCounts[i]; j++) {
            const s2c = colLetter(s2Start[i] + j)
            const s1c = colLetter(s1Start[i] + j)
            numTerms.push(`'Notas EX'!${s2c}$1*'Notas EX'!${s2c}${r}*'Comp y Crit'!${s1c}$${flagRow}`)
            denTerms.push(`'Notas EX'!${s2c}$1*'Comp y Crit'!${s1c}$${flagRow}`)
          }
          const formula = `IF((${denTerms.join('+')})=0,"",(${numTerms.join('+')})/(${denTerms.join('+')}))`
          const cell = ws3.getCell(r, s3Start[i] + s)
          cell.value = { formula }
          cell.numFmt = '0.00'
          cell.border = thinBorder
        }
      }

      for (let s = 0; s < S; s++) {
        const flagRow = 3 + s
        const numTerms = []
        const denTerms = []
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < evalCounts[i]; j++) {
            const s2c = colLetter(s2Start[i] + j)
            const s1c = colLetter(s1Start[i] + j)
            numTerms.push(`'Notas EX'!${s2c}$1*'Notas EX'!${s2c}${r}*'Comp y Crit'!${s1c}$${flagRow}`)
            denTerms.push(`'Notas EX'!${s2c}$1*'Comp y Crit'!${s1c}$${flagRow}`)
          }
        }
        if (numTerms.length > 0) {
          const formula = `IF((${denTerms.join('+')})=0,"",(${numTerms.join('+')})/(${denTerms.join('+')}))`
          const cell = ws3.getCell(r, s3Final + s)
          cell.value = { formula }
          cell.numFmt = '0.00'
          cell.border = thinBorder
        }
      }
    }

    ws3.getColumn(1).width = 18
    ws3.getColumn(2).width = 18
    const totalCols3 = s3Final + S
    for (let col = 3; col <= totalCols3; col++) {
      if (ws3.getColumn(col)) ws3.getColumn(col).width = 10
    }

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `competencias_${cursoNombre}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { generateExcel }
}
