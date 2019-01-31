function hexToRGB(hex, alpha = 1) {
    let r = null
    let g = null
    let b = null
    if (hex.length === 4) {
        r = parseInt(hex.slice(1, 2) + '' + hex.slice(1, 2), 16)
        g = parseInt(hex.slice(2, 3) + '' + hex.slice(2, 3), 16)
        b = parseInt(hex.slice(3, 4) + '' + hex.slice(3, 4), 16)
    } else {
        r = parseInt(hex.slice(1, 3), 16)
        g = parseInt(hex.slice(3, 5), 16)
        b = parseInt(hex.slice(5, 7), 16)
    }
    
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
}

function numberWithCommas(x) {
    var parts = x.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
}

function sortData(data) {
    const entries = new Array()
    const ids = new Array()
    for(let i = 0; i < data.length; i++) {
        let fromHasBeen = false
        let toHasBeen = false
        const fromIndex = entries.findIndex((entry) => entry.name === data[i].from)
        if (fromIndex > -1) {
            fromHasBeen = true
            entries[fromIndex].total_sent += parseInt(data[i].total, 10)
            const toArrayIndex = entries[fromIndex].to.findIndex((entry) => entry.name === data[i].to)
            if (toArrayIndex > -1) {
                entries[fromIndex].to[toArrayIndex].value += parseInt(data[i].total, 10)
            } else {
                entries[fromIndex].to.push({
                    'id': null,
                    'name': data[i].to,
                    'value': parseInt(data[i].total, 10)
                })
            }
        }
        const toIndex = entries.findIndex((entry) => entry.name === data[i].to)
        if (toIndex > -1) {
            toHasBeen = true
            entries[toIndex].total_received += parseInt(data[i].total, 10)
            const fromArrayIndex = entries[toIndex].from.findIndex((entry) => entry.name === data[i].from)
            if (fromArrayIndex > -1) {
                entries[toIndex].from[fromArrayIndex].value += parseInt(data[i].total, 10)
            } else {
                entries[toIndex].from.push({
                    'id': null,
                    'name': data[i].from,
                    'value': parseInt(data[i].total, 10)
                })
            }
        }
        
        if (!fromHasBeen) {
            entries.push({
                'id': null,
                'name': data[i].from,
                'total_sent': parseInt(data[i].total, 10),
                'total_received': 0,
                'to': [
                    {
                        'id': null,
                        'name': data[i].to,
                        'value': parseInt(data[i].total, 10)
                    }
                ],
                'from': []
            })
        }

        if (!toHasBeen) {
            entries.push({
                'id': null,
                'name': data[i].to,
                'total_sent': 0,
                'total_received': parseInt(data[i].total, 10),
                'to': [],
                'from': [
                    {
                        'id': null,
                        'name': data[i].from,
                        'value': parseInt(data[i].total, 10)
                    }
                ]
            })
        }
    }

    entries.sort((a, b) => {
        return (a.name > b.name) - (a.name < b.name)
    })

    for (var m = 0; m < entries.length; m++) {
        entries[m].id = m
        ids[m] = entries[m].name
    }

    for(var k = 0; k < entries.length; k++) {
        for(var l = 0; l < entries[k].to.length; l++) {
            entries[k].to[l].id = ids.indexOf(entries[k].to[l].name)
        }
        for(var m = 0; m < entries[k].from.length; m++) {
            entries[k].from[m].id = ids.indexOf(entries[k].from[m].name)
        }
    }
    console.log(entries)
    return entries
}

export { hexToRGB, numberWithCommas, sortData }
