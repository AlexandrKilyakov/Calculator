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
    if (!isNaN(item) || item == actions.minus) {
      input.textContent += item;
    } else {
      input.textContent += actions[item];
    }
  }

  setScrollEnd(input);
  setScrollEnd(output);
});

function setScrollEnd(item) {
  if (item.scrollWidth > item.offsetWidth) {
    item.scrollLeft = item.scrollWidth - item.offsetWidth;
  }
}

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
    } else if (currentElement.indexOf(actions.dot) == -1) {
      if (!isNaN(currentElement)) {
        elementsArray[len] += actions.dot;
      } else if (elementsArray[len] == actions.minus) {
        elementsArray[len] += `0${actions.dot}`;
      } else {
        elementsArray.push(`0${actions.dot}`);
      }
    }
  } else if (
    currentElement != newElement &&
    newAction &&
    !currentAction &&
    elementsArray[len] != actions.minus
  ) {
    if (!currentElement) {
      if (newElement == "minus") {
        elementsArray.push(actions.minus);
      }
    } else {
      elementsArray.push(newElement);
    }
  } else if (!special.includes(newElement)) {
    if (createNegation.includes(elementsArray[len]) && newElement == "minus") {
      elementsArray.push(actions.minus);
    } else if (!(elementsArray[len] == actions.minus && len == 0)) {
      let k = len;

      while (
        actions.hasOwnProperty(elementsArray[k]) ||
        elementsArray[k] == actions.minus
      ) {
        k--;
        elementsArray.pop();
      }
      elementsArray.push(newElement);
    }
  } else {
    switch (newElement) {
      case "clear":
        elementsArray = [];
        setValues();
        break;
      case "backspace":
        if (!currentElement) {
          break;
        }

        if (currentAction || currentElement.length == 1) {
          elementsArray.pop();
        } else {
          elementsArray[len] = currentElement.slice(0, -1);
        }
        callСalculator();
        break;
    }
  }
}

function setValues(equation = "", result = "") {
  input.textContent = equation;
  output.textContent = result;
}

// Функция для отработки логики нажатия на обычные кнопки (цифры)
function respondButtons(len, currentElement, newElement) {
  if (!isNaN(currentElement) || elementsArray[len] == actions.minus) {
    elementsArray[len] += newElement;
  } else {
    elementsArray.push(newElement);
  }

  callСalculator();
}

function setProcedure(data) {
  const procedure = [];

  for (let i = 0; i < data.length; i++) {
    if (isNaN(data[i])) {
      procedure.push({ id: i, value: data[i] });
    }
  }

  procedure.sort((a, b) => {
    const priority = {
      multiply: 1,
      divide: 1,
      interest: 1,
      plus: 2,
      minus: 2,
    };

    if (priority[a.value] < priority[b.value]) {
      return -1;
    } else if (priority[a.value] > priority[b.value]) {
      return 1;
    } else {
      return a.id - b.id;
    }
  });

  return procedure;
}

function callСalculator() {
  if (elementsArray.length > 2 || output.textContent.length > 0) {
    calculator(elementsArray.slice());
  }
}

function calculator(data) {
  let item;

  if (data.length > 2) {
    while ((item = setProcedure(data)[0])) {
      if (data[item.id + 1]) {
        data[item.id - 1] = equations[item.value](
          data[item.id - 1],
          data[item.id + 1]
        );
        data[item.id + 1] = "";
      }

      data[item.id] = "";

      data = data.filter((element) => element !== "");
    }

    output.textContent = data[0];
  } else {
    output.textContent = "";
  }
}
