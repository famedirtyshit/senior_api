const sortByGeo = (a, b) => {
    if (a.distance < b.distance) {
        return -1;
    }
    if (a.distance > b.distance) {
        return 1;
    }
    return 0;
}

const sortByDate = (a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
        return -1;
    }
    if (new Date(a.date) > new Date(b.date)) {
        return 1;
    }
    return 0;
}

module.exports = { sortByGeo, sortByDate }