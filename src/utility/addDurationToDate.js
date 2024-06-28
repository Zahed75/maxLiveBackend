 const addDurationToDate = (duration, startDate = new Date()) => {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    const ms = seconds * 1000 + minutes * 60000 + hours * 3600000;
    return new Date(startDate.getTime() + ms);
  };

module.exports = addDurationToDate