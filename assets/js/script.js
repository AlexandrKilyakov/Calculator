const selectors = {
  input: ".input",
  output: ".output",
  buttons: ".buttons",
};

const input = document.querySelector(selectors.input);
const output = document.querySelector(selectors.output);
const buttons = document.querySelector(selectors.buttons);

let elementsArray = []; // В этом массиве будут храниться элементы уравнения

// Объект, который содержит математические символы
const actions = {
  multiply: "*",
  divide: "/",
  interest: "%",
  plus: "+",
  minus: "-",
  dot: ".",
};

// Объект, который содержит приоритет математических функций
const priority = {
  multiply: 1,
  divide: 1,
  interest: 1,
  plus: 2,
  minus: 2,
};

// Объект с математическими функциями
const equations = {
  multiply: (a, b) => {
    return Number(a) * Number(b);
  },
  divide: (a, b) => {
    return Number(a) / Number(b);
  },
  interest: (a, b) => {
    return Number(a) * (Number(b) / 100);
  },
  plus: (a, b) => {
    return Number(a) + Number(b);
  },
  minus: (a, b) => {
    return Number(a) - Number(b);
  },
};

const special = ["equals", "dot", "clear", "backspace"]; // Данные кнопки имеют особое действие
const createNegation = ["multiply", "divide"]; // После этих знаков может идти минус

buttons.addEventListener("click", ({ target }) => {
  const btn = target.closest("[data-value]");

  if (!btn) return;

  // Кеширую часто используемые хначения
  const len = elementsArray.length - 1;
  const currentRole = btn.dataset.role;
  const currentElement = elementsArray[len];
  const currentAction = actions[currentElement];
  const newElement = btn.dataset.value;
  const newAction = actions[newElement];

  // Выводим результат, если нажата кнопка равенства
  if (newElement == "equals") {
    elementsArray = [output.textContent];
    setValues(output.textContent);
    return;
  }

  // Вызываем функцию в зависимости от роли нажатой кнопки
  if (currentRole == "specially") {
    respondSpecialButtons(
      len,
      currentElement,
      currentAction,
      newElement,
      newAction
    );
  } else if (currentRole == "number") {
    respondButtons(len, currentElement, newElement);
  }

  input.textContent = "";

  for (let item of elementsArray) {
    input.textContent += thisNumber(item) ? item : actions[item];
  }

  setScrollEnd(input);
  setScrollEnd(output);
});

// Функция для отработки логики особых кнопок
function respondSpecialButtons(
  len,
  currentElement,
  currentAction,
  newElement,
  newAction
) {
  // Если нажата точка
  if (newElement == "dot") {
    if (!currentElement) {
      elementsArray.push(`0${actions.dot}`);
      return;
    }

    if (currentElement.indexOf(actions.dot) == -1) {
      if (!isNaN(currentElement)) {
        elementsArray[len] += actions.dot;
        return;
      }

      if (thisMinus(elementsArray[len])) {
        elementsArray[len] += `0${actions.dot}`;
        return;
      }

      elementsArray.push(`0${actions.dot}`);
      return;
    }

    return;
  }

  // Тут получаем первичный знак
  if (
    currentElement != newElement &&
    newAction &&
    !currentAction &&
    elementsArray[len] != actions.minus
  ) {
    if (!currentElement) {
      if (thisMinusType(newElement)) {
        elementsArray.push(actions.minus);
      }

      return;
    }

    elementsArray.push(newElement);
    return;
  }

  // Если нажата кнопка, которая не находится в списке особых
  // Таким образом можно менять математические функции, а не спамить ими
  if (!special.includes(newElement)) {
    if (
      createNegation.includes(elementsArray[len]) &&
      thisMinusType(newElement)
    ) {
      elementsArray.push(actions.minus);

      return;
    }

    if (!(thisMinus(elementsArray[len]) && len == 0)) {
      let k = len;

      while (
        actions.hasOwnProperty(elementsArray[k]) ||
        thisMinus(elementsArray[k])
      ) {
        elementsArray.pop();
        k--;
      }

      elementsArray.push(newElement);

      return;
    }

    return;
  }

  // Обработка некоторых особых кнопок
  switch (newElement) {
    case "clear":
      elementsArray = [];
      setValues();
      return;
    case "backspace":
      if (!currentElement) {
        return;
      }

      if (currentAction || currentElement.length == 1) {
        elementsArray.pop();
      } else {
        elementsArray[len] = currentElement.slice(0, -1);
      }

      callСalculator();
      return;
  }
}

// Функция для отработки логики нажатия на обычные кнопки (цифры)
function respondButtons(len, currentElement, newElement) {
  if (thisNumber(currentElement, elementsArray[len])) {
    elementsArray[len] += newElement;
  } else {
    elementsArray.push(newElement);
  }

  callСalculator();
}

// Функция, которая возвращает математическое действие согласно приоритету
function setProcedure(data) {
  const procedure = [];
  const max = data.length;

  for (let i = 0; i < max; i++) {
    if (isNaN(data[i])) {
      procedure.push({ id: i, value: data[i] });
    }
  }

  procedure.sort((a, b) => {
    if (priority[a.value] < priority[b.value]) {
      return -1;
    } else if (priority[a.value] > priority[b.value]) {
      return 1;
    } else {
      return a.id - b.id;
    }
  });

  return procedure[0];
}

// Функция, которая позволит увидеть вводимые цифры, если длина числа больше поля
function setScrollEnd(item) {
  if (item.scrollWidth > item.offsetWidth) {
    item.scrollLeft = item.scrollWidth - item.offsetWidth;
  }
}

// Устанавливаем значения для полей
function setValues(equation = "", result = "") {
  input.textContent = equation;
  output.textContent = result;
}

// Проверка на знак минуса, или другими словами - проверка на отрицательное число
function thisMinus(item) {
  return item == actions.minus;
}

// Проверка на математическое действие, конкретно - проверка на минус
function thisMinusType(item) {
  return item == "minus";
}

// Проверка на положительное или отрицательное число
function thisNumber(itemA, itemB = itemA) {
  return !isNaN(itemA) || thisMinus(itemB);
}

// Вызываем калькулятор
function callСalculator() {
  if (elementsArray.length > 2 || output.textContent.length > 0) {
    calculator(elementsArray.slice());
  }
}

// А вот и сам калькулятор
function calculator(data) {
  let item;

  if (data.length > 2) {
    while ((item = setProcedure(data))) {
      const prev = item.id - 1;
      const next = item.id + 1;

      if (data[next]) {
        data[prev] = equations[item.value](data[prev], data[next]);
        data[next] = "";
      }

      data[item.id] = "";

      data = data.filter((element) => element !== "");
    }

    output.textContent = Math.round(data[0] * 1000) / 1000;
  } else {
    output.textContent = "";
  }
}
