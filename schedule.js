String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

let ROW_HOUR_SCALE = 6

let MINUTES_PER_CREDIT = 50

let CREDIT_TO_SCALE = MINUTES_PER_CREDIT / (60 / ROW_HOUR_SCALE)

let HOUR_START = 7
let HOUR_END = 18

// Days to show
let days = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    // 'Sabtu',
    // 'Minggu',
]

let data = []

let BACKGROUNDS = [
    '#C5CAE9',
    '#C8E6C9',
    '#F8BBD0',
    '#E1BEE7',
    '#FFCDD2',
    '#BBDEFB',
    '#B3E5FC',
    '#B2EBF2',
    '#F0F4C3',
    '#D7CCC8',
    '#D1C4E9',
    '#B2DFDB',
    '#DCEDC8',
    '#FFF9C4',
    '#FFECB3',
    '#F5F5F5',
    '#FFCCBC',
    '#FFE0B2',
    '#CFD8DC',
]

let mapping = Array(days.length).fill().map(() => Array((HOUR_END - HOUR_START) * ROW_HOUR_SCALE).fill(null))

function parse_data() {
    const rows = [...document.querySelectorAll('#dashboard table.table-hover tbody tr')]
    rows.slice(0, rows.length - 1)
    rows.forEach((el, i) => {
        const row = [...el.querySelectorAll('td')]
        const time = row[10]?.innerText
        let start_time, end_time
        if (time) {
            [start_time, end_time] = time.split('-').map(time => time.trim().substring(0, 5).replaceAt(4, '0'))
        }
        data.push({
            index: Number(row[0]?.innerText),
            code: row[1]?.innerText,
            subject: row[2]?.innerText,
            semester: Number(row[3]?.innerText),
            credit: Number(row[4]?.innerText),
            group: row[5]?.innerText,
            lecture: row[6]?.innerText,
            type: row[7]?.innerText,
            room: row[8]?.innerText,
            day: row[9]?.innerText,
            start_time,
            end_time,
            node: el
        })
    })
}

function generate_table () {
    const table = document.createElement('table')
    table.classList.add('table', 'table-bordered')
    table.id = 'schedule-table'
    table.style.marginTop = '12px'

    // Create table head
    const table_head = document.createElement('thead')
    const head_row = document.createElement('tr')
    // Insert emtpy head for time column
    head_row.appendChild(document.createElement('th'))
    days.forEach(day => {
        const day_head = document.createElement('th')
        day_head.innerText = day
        head_row.appendChild(day_head)
    })
    table_head.appendChild(head_row)
    table.appendChild(table_head)

    // Create table body
    const table_body = document.createElement('tbody')
    // Insert table row
    for (let i = 0; i < (HOUR_END - HOUR_START) * ROW_HOUR_SCALE; i++) {
        const row = document.createElement('tr')
        
        // Time column
        if (i % ROW_HOUR_SCALE === 0) {
            const time_col = document.createElement('td')
            const hour = HOUR_START + Math.floor(i / ROW_HOUR_SCALE)
            time_col.innerText = `${hour}:00 - ${hour + 1}:00`
            time_col.rowSpan = ROW_HOUR_SCALE
            row.appendChild(time_col)
        }

        days.forEach((day, j) => {
            const item = mapping[j][i]
            if (!item) {
                const item_col = document.createElement('td')
                if (i % ROW_HOUR_SCALE !== 0 &&  mapping[j][i - 1] !== 1) {
                    item_col.classList.add('disable-border')
                }
                row.appendChild(item_col)
            } else if (item !== 1) {
                const item_col = document.createElement('td')
                item_col.rowSpan = item.row_span
                item_col.classList.add('schedule-item')
                item_col.innerHTML = `<div>${item.subject}</div><div>${item.start_time} - ${item.end_time}</div>`
                item_col.style.backgroundColor = BACKGROUNDS[item.index - 1]
                row.appendChild(item_col)
            }
        })
        table_body.appendChild(row)
    }

    table.appendChild(table_body)
    
    // Install table to html
    const parent = document.querySelector('#dashboard')
    const breakline = document.querySelector('#dashboard > br')
    parent.insertBefore(table, breakline)
}

function map_schedule () {
    for (const item of data) {
        const col = days.findIndex(day => day === item.day)
        if (col < 0 || !item.start_time) {
            continue
        }

        const hour = (Number(item.start_time.substring(0, 2)) - HOUR_START) * ROW_HOUR_SCALE
        const minute_scale = (Number(item.start_time.substring(3, 5)) * ROW_HOUR_SCALE / 60)

        const row_start = hour + minute_scale
        const row_end = item.credit * (item.type === 'Praktik' ? 2 : 1) * CREDIT_TO_SCALE

        item.row_span = row_end

        mapping[col][row_start] = item
        for (let i = row_start + 1; i < row_start + row_end; i++) {
            mapping[col][i] = 1
        }
    }
}

function delete_previous_table () {
    const table = document.getElementById('schedule-table')
    table?.remove()
}

function scroll_to_element(e) {
    const y = e.getBoundingClientRect().top + window.scrollY - 42
    window.scroll({
        top: y,
        behavior: 'smooth'
    })
}

delete_previous_table()
parse_data()
map_schedule()
generate_table()

function refresh() {
    delete_previous_table()
    parse_data()
    map_schedule()
    generate_table()
}