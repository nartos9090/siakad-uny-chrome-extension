String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

let lesson_hours = [
    ['07:30', '08:20'],
    ['08:21', '09:10'],
    ['09:11', '10:00'],
    ['10:01', '10:50'],
    ['10:51', '11:40'],
    ['11:41', '12:30'],
    ['12:31', '13:20'],
    ['13:21', '14:10'],
    ['14:11', '15:00'],
    ['15:01', '15:50'],
    ['15:51', '16:40'],
    ['16:41', '17:30'],
]

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

let mapping = Array(days.length).fill().map(() => Array(lesson_hours.length).fill(null))

function parse_data() {
    const rows = [...document.querySelectorAll('#dashboard table.table-hover tbody tr')]
    rows.slice(0, rows.length - 1)
    rows.forEach((el, i) => {
        const row = [...el.querySelectorAll('td')]
        const time = row[10]?.innerText
        let start_time, end_time
        if (time) {
            [start_time, end_time] = time.split('-').map(time => time.trim().substring(0, 5))
        }
        data.push({
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
    lesson_hours.forEach((lesson_hour, i) => {
        const row = document.createElement('tr')
        const time_col = document.createElement('td')
        time_col.innerText = lesson_hour.join(' - ')
        row.appendChild(time_col)
        for (let j = 0; j < days.length; j++) {
            const item = mapping[j][i]
            const item_col = document.createElement('td')
            if (item) {
                item_col.innerText = item.subject
                item_col.classList.add('cursor-pointer')
            }
            item_col.onclick = () => scroll_to_element(item.node)
            row.appendChild(item_col)
        }
        table_body.appendChild(row)
    })
    table.appendChild(table_body)
    
    // Install table to html
    const parent = document.querySelector('#dashboard')
    const breakline = document.querySelector('#dashboard > br')
    parent.insertBefore(table, breakline)
}

function map_schedule () {
    for (const item of data) {
        const col = days.findIndex(day => day === item.day)
        if (col < 0) {
            continue
        }
        let row_start, row_end
        row_start = lesson_hours.findIndex(lesson_hour => lesson_hour[0] === item.start_time)
        row_end = row_start + (item.credit * (item.type === 'Praktik' ? 2 : 1) - 1)

        for (let i = row_start; i <= row_end; i++) {
            mapping[col][i] = item
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