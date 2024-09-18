export function getPreviousWorkday(): Date {
    const date = new Date();
    do {
        date.setDate(date.getDate() - 1);
    } while (date.getDay() === 0 || date.getDay() === 6);
    date.setHours(0, 0, 0, 0);
    return date;
}

export const isMonday = () => {
    return new Date().getDay() === 1;
};

export const getYesterdayOrLastFriday = () => {
    const date = new Date();
    if (isMonday()) {
        date.setDate(date.getDate() - 3);
    } else {
        date.setDate(date.getDate() - 1);
    }
    return date;
};