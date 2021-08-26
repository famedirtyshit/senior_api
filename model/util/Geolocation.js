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
    if (a.post == undefined) {
        if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
            return 1;
        }
        if (new Date(a.date).getTime() > new Date(b.date).getTime()) {
            return -1;
        }
        return 0;
    } else {
        if (new Date(a.post.date).getTime() < new Date(b.post.date).getTime()) {
            return 1;
        }
        if (new Date(a.post.date).getTime() > new Date(b.post.date).getTime()) {
            return -1;
        }
        return 0;
    }
}

module.exports = { sortByGeo, sortByDate }