String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length)
}

let ROW_HOUR_SCALE = 6
let MINUTES_PER_CREDIT = 50
let HOUR_START = 7
let HOUR_END = 21

let CREDIT_TO_SCALE = MINUTES_PER_CREDIT / (60 / ROW_HOUR_SCALE)

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
    ['#EF9A9A', '#FFCDD2'],
    ['#F48FB1', '#F8BBD0'],
    ['#CE93D8', '#E1BEE7'],
    ['#B39DDB', '#D1C4E9'],
    ['#9FA8DA', '#C5CAE9'],
    ['#90CAF9', '#BBDEFB'],
    ['#81D4FA', '#B3E5FC'],
    ['#80DEEA', '#B2EBF2'],
    ['#80CBC4', '#B2DFDB'],
    ['#A5D6A7', '#C8E6C9'],
    ['#C5E1A5', '#DCEDC8'],
    ['#E6EE9C', '#F0F4C3'],
    ['#FFF59D', '#FFF9C4'],
    ['#FFE082', '#FFECB3'],
    ['#FFCC80', '#FFE0B2'],
    ['#FFAB91', '#FFCCBC'],
    ['#BCAAA4', '#D7CCC8'],
    ['#B0BEC5', '#CFD8DC'],
]

let mapping

function parse_data() {
    data = []
    let rows = [...document.querySelectorAll('.col-lg-12 > .panel.panel-danger > .panel-body > table > tbody > tr')]
    rows.forEach((el, i) => {
        const row = [...el.querySelectorAll('td')]

        let index,
            code,
            subject,
            semester,
            credit,
            group,
            lecture,
            type,
            room,
            room_size,
            room_code,
            day,
            time,
            // is_online,
            is_multiple = false
        
        if (row.length < 12) {
            let fallback_item = data[data.length - 1]
            fallback_item.is_multiple = true
            index = fallback_item.index
            code = fallback_item.code
            subject = fallback_item.subject
            semester = fallback_item.semester
            credit = fallback_item.credit
            group = row[0]?.innerText
            lecture = row[1]?.innerText
            type = row[2]?.innerText
            room = row[3]?.innerText
            day = row[4]?.innerText
            time = row[5]?.innerText
            is_multiple = true
        } else {
            index = Number(row[0]?.innerText)
            code = row[1]?.innerText
            subject = row[2]?.innerText
            semester = Number(row[3]?.innerText)
            credit = Number(row[4]?.innerText)
            group = row[5]?.innerText
            lecture = row[6]?.innerText
            type = row[7]?.innerText
            room = row[8]?.innerText
            day = row[9]?.innerText
            time = row[10]?.innerText
        }

        let start_time, end_time
        if (time) {
            [start_time, end_time] = time.split('-').map(time => time.trim().substring(0, 5).replaceAt(4, '0'))
        }
        if (room) {
            room_size = Number(room.match(/(?<=size:)(.*)(?=(\s\[))/)[0])
            room_code = room.match(/(?<=\[)(.*)(?=\])/)[0]
            room = room.slice(0, room.indexOf(', size:'))
        }

        const [bg_normal, bg_hover] = BACKGROUNDS[(index - 1) % BACKGROUNDS.length]

        data.push({
            index,
            code,
            subject,
            semester,
            credit,
            group,
            lecture,
            type,
            room,
            room_size,
            room_code,
            day,
            start_time: start_time !== '0' ? start_time : null,
            end_time: end_time !== '0' ? end_time : null,
            node: el,
            is_multiple,
            bg_normal,
            bg_hover,
        })
    })
}

function generate_util () {
    const div = document.createElement('div')
    div.style.display = 'flex'

    // Create show/hide room button
    let show = false
    const button = document.createElement('button')
    button.classList.add('btn', 'btn-primary')
    button.innerText = 'Tampilkan Ruangan'
    button.style.marginLeft = 'auto'
    button.onclick = function () {
        show = !show
        if (show) {
            button.innerText = 'Sembunyikan Ruangan'
            table = document.getElementById('schedule-table')
            table?.classList.add('show-room')
        } else {
            button.innerText = 'Tampilkan Ruangan'
            table = document.getElementById('schedule-table')
            table?.classList.remove('show-room')
        }
    }

    div.appendChild(button)

    // Create save as image button
    const save = document.createElement('button')
    save.classList.add('btn', 'btn-secondary')
    save.style.marginLeft = '12px'
    save.innerText = 'Simpan Gambar'
    save.onclick = print_table

    div.appendChild(save)

    const parent = document.querySelector('#schedule-panel-body')
    const schedule_table = document.querySelector('#schedule-panel-body > #schedule-table')
    parent.insertBefore(div, schedule_table)
}

function generate_table () {
    const div = document.createElement('div')
    div.id = 'schedule-table'

    const table = document.createElement('table')
    table.classList.add('table', 'table-bordered')
    table.style.marginTop = '12px'

    const TIME_COL_WIDTH = (100 / days.length).toFixed(1) + '%'

    // Create table head
    const table_head = document.createElement('thead')
    const head_row = document.createElement('tr')
    head_row.appendChild(document.createElement('th'))

    // Create colgroup
    const col_group = document.createElement('colgroup')
    const time_col = document.createElement('col')
    time_col.width = '100px'
    col_group.appendChild(time_col)
    table.appendChild(col_group)

    days.forEach(day => {
        const day_head = document.createElement('th')
        day_head.innerText = day
        head_row.appendChild(day_head)
        
        const col = document.createElement('col')
        col.width = TIME_COL_WIDTH
        col_group.appendChild(col)
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
            time_col.innerText = `${zero_pad(hour, 2)}:00 - ${zero_pad(hour + 1, 2)}:00`
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
                item.node_col = item_col
                item_col.rowSpan = item.row_span
                item_col.classList.add('schedule-item', 'cursor-pointer')
                item_col.innerHTML = `<div class="item-subject">${item.subject}</div><div class="item-time">${item.start_time} - ${item.end_time}</div><div class="item-room">${item.room}</div>`
                item_col.style.backgroundColor = item.bg_normal
                item_col.onmouseover = () => change_color(item, true)
                item_col.onmouseleave = () => change_color(item, false)
                item_col.onclick = () => scroll_to_element(item.node)
                row.appendChild(item_col)
            }
        })
        table_body.appendChild(row)
    }

    table.appendChild(table_body)
    div.appendChild(table)

    const panel = document.createElement('div')
    panel.className = 'panel panel-warning'

    const panel_heading = document.createElement('div')
    panel_heading.className = 'panel-heading'
    panel_heading.innerHTML = '<i class="fa fa-xing"></i> Jadwal Kuliah'

    const panel_body = document.createElement('div')
    panel_body.className = 'panel-body'
    panel_body.id = 'schedule-panel-body'

    panel_body.appendChild(div)
    panel.appendChild(panel_heading)
    panel.appendChild(panel_body)

    // Refresh button
    // let btn = document.createElement('button')
    // btn.innerText = 'refresh'
    // btn.onclick = () => refresh()
    // div.prepend(btn)

    // Install table to html
    const parent = document.querySelector('#page-wrapper > div > div > div > div > div.col-lg-12')
    const breakline = document.querySelector('#page-wrapper > div > div > div > div > div.col-lg-12 > div.panel.panel-danger')
    parent.insertBefore(panel, breakline)
}

function map_schedule () {
    mapping = Array(days.length).fill().map(() => Array((HOUR_END - HOUR_START) * ROW_HOUR_SCALE).fill(null))
    for (const item of data) {
        const col = days.findIndex(day => day === item.day)
        if (col < 0 || !item.start_time || !item.end_time) {
            continue
        }

        let start_hour_minute = parse_time(item.start_time)
        let start_hour = (start_hour_minute[0] - HOUR_START) * ROW_HOUR_SCALE
        let start_minute_scale = (start_hour_minute[1] * ROW_HOUR_SCALE / 60)

        let end_hour_minute = parse_time(item.end_time)
        let end_hour = (end_hour_minute[0] - HOUR_START) * ROW_HOUR_SCALE
        let end_minute_scale = (end_hour_minute[1] * ROW_HOUR_SCALE / 60)

        let row_start = start_hour + start_minute_scale
        let row_end = end_hour + end_minute_scale

        if (row_start < 0) {
            if (row_end > 0) {
                row_start = 0
            } else {
                 continue
            }
        }


        item.row_span = row_end - row_start

        mapping[col][row_start] = item
        for (let i = row_start + 1; i < row_end; i++) {
            mapping[col][i] = 1
        }
    }
}

function parse_time(time_str) {
    return time_str.split(':').map(Number)
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

function zero_pad(num, places) {
    return String(num).padStart(places, '0')
}

function change_color(item, active = false) {
    const background = BACKGROUNDS[(item.index - 1) % BACKGROUNDS.length][active ? 1 : 0]
    if (item.is_multiple) {
        data.filter(v => v.index === item.index).forEach((item) => {
            if (item.node_col) {
                item.node_col.style.backgroundColor = background
            }
        })
    } else {
        if (item.node_col) {
            item.node_col.style.backgroundColor = background
        }
    }
}

function print_table () {
    const el = document.querySelector('#schedule-table')
    el.style.width = '1920px'
    html2canvas(el).then((canvas) => {
        el.style.width = 'unset'
        const a = document.createElement('a')
        a.download = 'jadwal.png'
        a.href = canvas.toDataURL()
        a.click()
    })
}

delete_previous_table()
parse_data()
map_schedule()
generate_table()
generate_util()

function refresh() {
    delete_previous_table()
    parse_data()
    map_schedule()
    generate_table()
}