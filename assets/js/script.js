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
  interest: "%",
  divide: "/",
  multiply: "*",
  minus: "-",
  plus: "+",
  dot: ".",
};

const special = ["dot", "clear", "backspace"];

buttons.addEventListener("click", ({ target }) => {
  const btn = target.closest("[data-value]");

  if (!btn) return;

  const len = elementsArray.length - 1;
  const currentElement = elementsArray[len];
  const currentAction = actions[currentElement];
  const newElement = btn.dataset.value;
  const newAction = actions[newElement];

  if (btn.dataset.role == "specially") {
    respondSpecialButtons(
      len,
      currentElement,
      currentAction,
      newElement,
      newAction
    );
  } else if (btn.dataset.role == "number") {
    respondButtons(len, currentElement, newElement);
  }

  console.table(elementsArray);
});

function calculator(data) {
  const operator = {
    divide: "value",
    multiply: "value",
    minus: "value",
    plus: "value",
  };
  if (data.indexOf("*") != -1) {
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
      } else {
        elementsArray.push(`0${actions.dot}`);
      }
    }
  } else if (currentElement != newElement && newAction && !currentAction) {
    elementsArray.push(newElement);
  } else if (!special.includes(newElement)) {
    elementsArray[len] = newElement;
  } else {
    switch (newElement) {
      case "clear":
        elementsArray = [];
        break;
      case "backspace":
        if (currentElement.length == 1 || currentAction) {
          elementsArray.pop();
        } else {
          elementsArray[len] = currentElement.slice(0, -1);
        }
        break;
    }
  }
}

// Функция для отработки логики нажатия на обычные кнопки (цифры)
function respondButtons(len, currentElement, newElement) {
  if (!isNaN(currentElement)) {
    elementsArray[len] += newElement;

    // calculator(elementsArray);
  } else {
    elementsArray.push(newElement);
  }
}
