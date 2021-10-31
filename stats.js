const counterId = "F0D68381-2BE3-4E1A-9866-A7B37C3E0EE1";

fetch(`https://shri.yandex/hw/stat/data?counterId=${counterId}`)
  .then((res) => res.json())
  .then((result) => {
    let data = prepareData(result);

    showSession(counterId);
    showMetricByDay(data, "2021-10-30");
    showMetricByPeriod(data, "2021-10-30", "2021-10-31");
    sliceByBrowser(data, "fcp");
    sliceByOS(data, "fcp");
    sliceByPlatform(data, "fcp");
  });

// показать значение метрики за несколько дней
function showMetricByPeriod(data, startDate, endDate) {
  console.log(`Metrics for period from ${startDate} to ${endDate}`);
  const filteredData = data.filter(
    (item) => item.date >= startDate && item.date <= endDate
  );
  table(filteredData);
}

// показать значение метрики за день
function showMetricByDay(data, date) {
  console.log(`Metrics for day ${date}`);
  const filteredData = data.filter((item) => item.date === date);
  table(filteredData);
}

// показать сессию пользователя
function showSession(id) {
  console.log(`Session with id: ${id}`);
}

// показать метрики через слайс браузеов
function sliceByBrowser(data, name) {
  console.log(`Slice of '${name}' by Browser`);
  getSlice(data, name, "browser");
}

// показать метрики через слайс платформ
function sliceByPlatform(data, name) {
  console.log(`Slice of '${name}' by Platform`);
  getSlice(data, name, "platform");
}

// показать метрики через слайс операционных стистем
function sliceByOS(data, name) {
  console.log(`Slice of '${name}' by OS`);
  getSlice(data, name, "os");
}

function getSlice(data, name, sliceBy) {
  const slicedData = data
    .filter((item) => item.name === name)
    .map((item) => {
      const slice = item.additional[sliceBy];
      const metric = item.value;
      return { name: slice, value: metric };
    });
  table(slicedData);
}

function table(data) {
  let items = {};
  for (let { name, value } of data) {
    if (items[name]) {
      items[name].push(value);
    } else {
      items[name] = [value];
    }
  }

  let table = {};
  for (let key in items) {
    table[key] = tableRow(items[key]);
  }
  console.table(table);
}

function tableRow(data) {
  data.sort((a, b) => a - b);

  let result = {};

  result.hits = data.length;
  result.p25 = quantile(data, 0.25);
  result.p50 = quantile(data, 0.5);
  result.p75 = quantile(data, 0.75);
  result.p95 = quantile(data, 0.95);

  return result;
}

function quantile(data, q) {
  const pos = (data.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (data[base + 1] !== undefined) {
    return Math.floor(data[base] + rest * (data[base + 1] - data[base]));
  } else {
    return Math.floor(data[base]);
  }
}

function prepareData(result) {
  return result.data.map((item) => {
    item.date = item.timestamp.split("T")[0];

    return item;
  });
}
