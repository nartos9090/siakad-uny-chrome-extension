String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

let lesson_hours = [
    ['07:30', '08:20'],
    ['08:20', '09:10'],
    ['09:10', '10:00'],
    ['10:00', '10:50'],
    ['10:50', '11:40'],
    ['11:40', '12:30'],
    ['12:30', '13:20'],
    ['13:20', '14:10'],
    ['14:10', '15:00'],
    ['15:00', '15:50'],
    ['15:50', '16:40'],
    ['16:40', '17:30'],
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
            [start_time, end_time] = time.split('-').map(time => time.trim().substring(0, 5).replaceAt(4, '0'))
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
            }
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
        for (let i = 0; i < lesson_hours.length; i++) {
            const lesson_hour = lesson_hours[i]
            if (lesson_hour[0] === item.start_time) {
                row_start = i
            } else if (lesson_hour[1] === item.end_time) {
                row_end = i
                break
            }
        }

        for (let i = row_start; i <= row_end; i++) {
            mapping[col][i] = item
        }
    }
}

function delete_previous_table () {
    const table = document.getElementById('schedule-table')
    table?.remove()
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