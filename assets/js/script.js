const selectors = {
  input: ".input",
  output: ".output",
  buttons: ".buttons",
};

const input = document.querySelector(selectors.input);
const output = document.querySelector(selectors.output);
const buttons = document.querySelector(selectors.buttons);

let elementsArray = [];

const actions = {
  multiply: "*",
  divide: "/",
  interest: "%",
  plus: "+",
  minus: "-",
  dot: ".",
};

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

const priority = {
  multiply: 1,
  divide: 1,
  interest: 1,
  plus: 2,
  minus: 2,
};

const special = ["equals", "dot", "clear", "backspace"];
const createNegation = ["multiply", "divide"];

buttons.addEventListener("click", ({ target }) => {
  const btn = target.closest("[data-value]");

  if (!btn) return;

  const len = elementsArray.length - 1;
  const currentRole = btn.dataset.role;
  const currentElement = elementsArray[len];
  const currentAction = actions[currentElement];
  const newElement = btn.dataset.value;
  const newAction = actions[newElement];

  if (newElement == "equals") {
    elementsArray = [output.textContent];
    setValues(output.textContent);
    return;
  }

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

function setScrollEnd(item) {
  if (item.scrollWidth > item.offsetWidth) {
    item.scrollLeft = item.scrollWidth - item.offsetWidth;
  }
}

function setValues(equation = "", result = "") {
  input.textContent = equation;
  output.textContent = result;
}

function thisMinus(item) {
  return item == actions.minus;
}

function thisMinusType(item) {
  return item == "minus";
}

function thisNumber(itemA, itemB = itemA) {
  return !isNaN(itemA) || thisMinus(itemB);
}

function callСalculator() {
  if (elementsArray.length > 2 || output.textContent.length > 0) {
    calculator(elementsArray.slice());
  }
}

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
