const style = document.createElement('style')
style.innerHTML = `
#schedule-table table td,
#schedule-table table th {
    text-align: center !important;
    vertical-align: middle !important;
}

/* #schedule-table tr td:first-child {
    width: 1%;
    white-space: nowrap;
} */

#schedule-table.show-room table tr td {
    padding: 6px;
}

#schedule-table table tr td {
    padding: 4px;
    transition: 0.3s;
}

#schedule-table table td.disable-border {
    border-top: none;
}

#schedule-table table {
    min-width: 900px;
    table-layout: fixed;
}

#schedule-table {
    overflow-x: auto;
}

#schedule-table.show-room .item-room {
    display: block;
    color: white;
}

#schedule-table .item-room {
    display: none;
}

.schedule-item {
    transition: 0.3s;
}

.cursor-pointer {
    cursor: pointer;
}

#schedule-table > table > tbody > tr:nth-child(6n) > td,
#schedule-table > table > tbody > tr td[rowspan="${ROW_HOUR_SCALE}"] {
    border-bottom-width: 2px;
}

#schedule-table > table > tbody > tr:not(:nth-child(6n)) > td:not([rowspan="6"]) {
    border-top: none;
    border-bottom: none;
}
`

document.head.appendChild(style)